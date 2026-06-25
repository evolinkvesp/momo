import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[stripe/webhook] signature verification failed:', err?.message)
    return Response.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  console.log('[stripe/webhook] event:', event.type)

  const supabase = createServiceClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.usemomo.online'

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const fornecedorId: string = session.metadata?.fornecedor_id ?? ''
        if (!fornecedorId) {
          console.error('[stripe/webhook] checkout.session.completed: no fornecedor_id in metadata')
          break
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const periodEnd = new Date((subscription as any).current_period_end * 1000)

        const { error: upsertError } = await supabase.from('fornecedor_assinaturas').upsert({
          fornecedor_id: fornecedorId,
          stripe_session_id: session.id,
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          status: 'ativa',
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        }, { onConflict: 'fornecedor_id' })

        if (upsertError) {
          console.error('[stripe/webhook] checkout.session.completed: upsert error:', upsertError.message)
        } else {
          console.log('[stripe/webhook] checkout.session.completed: assinatura ativada para fornecedor', fornecedorId)
        }

        // Notifica o fornecedor via push
        try {
          const userId: string = session.metadata?.user_id ?? ''
          if (userId) {
            await fetch(`${baseUrl}/api/push/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Internal-Key': process.env.N8N_SECRET ?? '',
              },
              body: JSON.stringify({
                userId,
                title: 'Assinatura Ativada!',
                body: 'Sua assinatura foi ativada. Seu perfil já está visível na plataforma.',
                url: '/fornecedor/plano',
              }),
            })
          }
        } catch (e) {
          console.error('[stripe/webhook] push notification failed:', e)
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any
        const subId: string = invoice.subscription ?? ''
        if (!subId) break

        const subscription = await stripe.subscriptions.retrieve(subId)
        const periodEnd = new Date((subscription as any).current_period_end * 1000)

        const { error } = await supabase.from('fornecedor_assinaturas')
          .update({
            status: 'ativa',
            current_period_end: periodEnd.toISOString(),
            inadimplente_desde: null,
          })
          .eq('stripe_subscription_id', subId)

        if (error) {
          console.error('[stripe/webhook] invoice.paid: update error:', error.message)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const subId: string = invoice.subscription ?? ''
        if (!subId) break

        // Período de graça: Stripe vai retentar — apenas marca inadimplente, não suspende fornecedor
        const { error } = await supabase.from('fornecedor_assinaturas')
          .update({
            status: 'inadimplente',
            inadimplente_desde: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subId)

        if (error) {
          console.error('[stripe/webhook] invoice.payment_failed: update error:', error.message)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any

        const { data: assinatura, error } = await supabase.from('fornecedor_assinaturas')
          .update({ status: 'cancelada' })
          .eq('stripe_subscription_id', subscription.id)
          .select('fornecedor_id')
          .single()

        if (error) {
          console.error('[stripe/webhook] customer.subscription.deleted: update error:', error.message)
          break
        }

        if (assinatura?.fornecedor_id) {
          const { error: suspendError } = await supabase.from('fornecedores')
            .update({ status: 'suspenso' })
            .eq('id', assinatura.fornecedor_id)

          if (suspendError) {
            console.error('[stripe/webhook] customer.subscription.deleted: suspend error:', suspendError.message)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any
        const periodEnd = new Date((sub as any).current_period_end * 1000)

        // Mapeia status do Stripe para status interno
        const statusMap: Record<string, string> = {
          active: 'ativa',
          past_due: 'inadimplente',
          canceled: 'cancelada',
          unpaid: 'inadimplente',
          paused: 'inadimplente',
        }
        const novoStatus = statusMap[sub.status] ?? 'ativa'

        const { error } = await supabase.from('fornecedor_assinaturas')
          .update({
            status: novoStatus,
            current_period_end: periodEnd.toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
          })
          .eq('stripe_subscription_id', sub.id)

        if (error) {
          console.error('[stripe/webhook] customer.subscription.updated: update error:', error.message)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as any
        const customerId: string = charge.customer ?? ''
        if (!customerId) break

        const { data: assinatura, error } = await supabase.from('fornecedor_assinaturas')
          .update({ status: 'cancelada' })
          .eq('stripe_customer_id', customerId)
          .select('fornecedor_id')
          .single()

        if (error) {
          console.error('[stripe/webhook] charge.refunded: update error:', error.message)
          break
        }

        if (assinatura?.fornecedor_id) {
          const { error: suspendError } = await supabase.from('fornecedores')
            .update({ status: 'suspenso' })
            .eq('id', assinatura.fornecedor_id)

          if (suspendError) {
            console.error('[stripe/webhook] charge.refunded: suspend error:', suspendError.message)
          }
        }
        break
      }

      default:
        console.log('[stripe/webhook] unhandled event:', event.type)
    }
  } catch (e: any) {
    console.error('[stripe/webhook] error processing', event.type, ':', e?.message)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }

  return Response.json({ received: true })
}
