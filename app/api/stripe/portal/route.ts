import { createRouteClient } from '@/lib/supabase-server'

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

  const stripeKey = process.env.STRIPE_SECRET_KEY!
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.usemomo.online'

  const formData = new URLSearchParams()
  formData.append('customer', assinatura.stripe_customer_id)
  formData.append('return_url', `${baseUrl}/plano`)

  const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  const data = await res.json() as any

  if (!res.ok) {
    return Response.json({ error: data?.error?.message || 'Stripe error', detail: data?.error }, { status: 500 })
  }

  return Response.json({ url: data.url })
}
