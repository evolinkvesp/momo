import { createRouteClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = createRouteClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: assinatura } = await supabase
    .from('assinaturas')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .order('criado_em', { ascending: false })
    .limit(1)
    .single()

  if (!assinatura?.stripe_customer_id) {
    return Response.json({ error: 'No Stripe customer found' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://momo-rust-nu.vercel.app'

  const session = await stripe.billingPortal.sessions.create({
    customer: assinatura.stripe_customer_id,
    return_url: `${baseUrl}/configuracoes/plano`,
  })

  return Response.json({ url: session.url })
}
