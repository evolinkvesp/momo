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

  const { data: assinatura, error: assinaturaError } = await supabase
    .from('fornecedor_assinaturas')
    .select('stripe_customer_id')
    .eq('fornecedor_id', fornecedor.id)
    .maybeSingle()

  if (assinaturaError || !assinatura?.stripe_customer_id) {
    return Response.json({ error: 'Assinatura não encontrada' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.usemomo.online'

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: assinatura.stripe_customer_id,
      return_url: `${baseUrl}/fornecedor/plano`,
    })

    return Response.json({ url: portalSession.url })
  } catch (err: any) {
    console.error('[fornecedor/portal] stripe error:', err?.message)
    return Response.json({ error: 'Erro ao criar portal de assinatura' }, { status: 500 })
  }
}
