import { NextRequest } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Não autenticado' }, { status: 401 })

    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) return Response.json({ error: 'STRIPE_PRICE_ID não configurado' }, { status: 500 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.usemomo.online'

    const baseParams = {
      mode: 'subscription' as const,
      ui_mode: 'embedded_page' as const,
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${baseUrl}/plano?success=1`,
      metadata: { user_id: user.id },
      // Cartão + carteiras digitais (Google Pay / Apple Pay) aparecem automaticamente
      payment_method_types: ['card'] as ('card')[],
    }

    let session
    try {
      // Tenta incluir PIX via Pix Automático (mandato recorrente autorizado no app bancário)
      // Requer suporte a Pix Automático na conta Stripe (invite-only para contas BR)
      session = await stripe.checkout.sessions.create({
        ...baseParams,
        payment_method_types: ['card', 'pix'],
        payment_method_options: {
          pix: {
            mandate_options: {
              payment_schedule: 'monthly',
              // Limite máximo por ciclo: R$35,00 (acima do preço atual R$29,90)
              amount: 3500,
              amount_type: 'maximum',
            } as any,
          },
        },
      })
      console.log('[stripe/create-checkout] sessão criada com PIX + cartão')
    } catch (pixErr: any) {
      // Pix Automático não disponível nesta conta — usa cartão + carteiras digitais
      console.warn('[stripe/create-checkout] PIX indisponível, usando cartão:', pixErr?.message)
      session = await stripe.checkout.sessions.create(baseParams)
    }

    return Response.json({ clientSecret: session.client_secret })
  } catch (err: any) {
    console.error('[stripe/create-checkout]', err?.message)
    return Response.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
