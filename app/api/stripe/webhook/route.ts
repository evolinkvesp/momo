import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[Stripe] Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const email = session.customer_email
      if (!email) break

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (!profile) break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any
      const periodEnd = new Date(subscription.current_period_end * 1000)

      await supabase.from('assinaturas').upsert({
        user_id: profile.id,
        stripe_session_id: session.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: session.customer as string,
        status: 'ativa',
        valor: (subscription.items.data[0].price.unit_amount ?? 0) / 100,
        plano: 'mensal',
        proximo_vencimento: periodEnd.toISOString().split('T')[0],
      }, { onConflict: 'stripe_subscription_id' })

      await supabase.from('profiles').update({
        plano_ativo: 'premium',
        assinatura_expira_em: periodEnd.toISOString(),
      }).eq('id', profile.id)

      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://momo-rust-nu.vercel.app'
        await fetch(`${baseUrl}/api/push/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': process.env.N8N_SECRET ?? '',
          },
          body: JSON.stringify({
            userId: profile.id,
            title: '💎 Assinatura Premium Ativada!',
            body: 'Parabéns! Seu acesso total ao Momo já está liberado.',
            url: '/',
          }),
        })
      } catch (e) {
        console.error('[Stripe] Push notification failed:', e)
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as any
      if (invoice.billing_reason === 'subscription_create') break

      const subscriptionId = invoice.subscription as string
      if (!subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any
      const periodEnd = new Date(subscription.current_period_end * 1000)

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .update({
          status: 'ativa',
          proximo_vencimento: periodEnd.toISOString().split('T')[0],
        })
        .eq('stripe_subscription_id', subscriptionId)
        .select('user_id')
        .single()

      if (assinatura) {
        await supabase.from('profiles').update({
          plano_ativo: 'premium',
          assinatura_expira_em: periodEnd.toISOString(),
        }).eq('id', assinatura.user_id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any
      const subscriptionId = invoice.subscription as string
      if (!subscriptionId) break

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .update({ status: 'expirada' })
        .eq('stripe_subscription_id', subscriptionId)
        .select('user_id')
        .single()

      if (assinatura) {
        await supabase.from('profiles').update({
          plano_ativo: 'expirado',
          assinatura_expira_em: null,
        }).eq('id', assinatura.user_id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .update({ status: 'cancelada' })
        .eq('stripe_subscription_id', subscription.id)
        .select('user_id')
        .single()

      if (assinatura) {
        await supabase.from('profiles').update({
          plano_ativo: 'expirado',
          assinatura_expira_em: null,
        }).eq('id', assinatura.user_id)
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as any
      const invoiceId = charge.invoice as string
      if (!invoiceId) break

      const invoice = await stripe.invoices.retrieve(invoiceId) as any
      const subscriptionId = invoice.subscription as string
      if (!subscriptionId) break

      const { data: assinatura } = await supabase
        .from('assinaturas')
        .update({ status: 'expirada' })
        .eq('stripe_subscription_id', subscriptionId)
        .select('user_id')
        .single()

      if (assinatura) {
        await supabase.from('profiles').update({
          plano_ativo: 'expirado',
          assinatura_expira_em: null,
        }).eq('id', assinatura.user_id)
      }
      break
    }
  }

  return Response.json({ received: true })
}
