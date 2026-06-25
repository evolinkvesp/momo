import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createRouteClient, createServiceClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabaseAuth = createRouteClient()
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: fornecedor, error: fornecedorError } = await supabase
    .from('fornecedores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fornecedorError || !fornecedor) {
    return Response.json({ error: 'Fornecedor não encontrado' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.usemomo.online'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_FORNECEDOR!,
          quantity: 1,
        },
      ],
      metadata: {
        fornecedor_id: fornecedor.id,
        user_id: user.id,
      },
      subscription_data: {
        metadata: { fornecedor_id: fornecedor.id, user_id: user.id },
      },
      success_url: `${baseUrl}/fornecedor/aguardando?paid=1`,
      cancel_url: `${baseUrl}/fornecedor/cadastro`,
    })

    return Response.json({ url: session.url })
  } catch (err: any) {
    console.error('[fornecedor/create-checkout] stripe error:', err?.message)
    return Response.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 })
  }
}
