import { NextRequest } from 'next/server'
import { createRouteClient, createServiceClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Não autenticado' }, { status: 401 })

    const apiKey = process.env.ABACATEPAY_API_KEY
    if (!apiKey) return Response.json({ error: 'API key missing' }, { status: 500 })

    const svc = createServiceClient()

    // Check if user already has a known subscription ID stored
    const { data: existingSub } = await svc
      .from('assinaturas')
      .select('abacate_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle()

    // List all subscriptions from AbacatePay
    const subsRes = await fetch('https://api.abacatepay.com/v2/subscriptions/list', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const subsData = await subsRes.json() as any
    const subscriptions: any[] = subsData.data ?? []

    console.log('[abacate/sync] all subs:', JSON.stringify(subscriptions))

    // 1. If we know the subscription ID, verify it's ACTIVE
    // 2. Otherwise, take any ACTIVE subscription (user just paid)
    let activeSub = existingSub?.abacate_subscription_id
      ? subscriptions.find(s => s.id === existingSub.abacate_subscription_id && s.status === 'ACTIVE')
      : null

    if (!activeSub) {
      activeSub = subscriptions.find((s: any) => s.status === 'ACTIVE')
    }

    if (!activeSub) {
      console.log('[abacate/sync] no active subscription found for user', user.id)
      return Response.json({ synced: false, reason: 'no_active_subscription' })
    }

    // Get customer ID to store, try to look up from customers list
    const custRes = await fetch('https://api.abacatepay.com/v2/customers/list', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const custData = await custRes.json() as any
    const customers: any[] = custData.data ?? []
    const customer = customers.find((c: any) => c.id === activeSub.customerId)

    const periodEnd = activeSub.nextBillingAt
      ? new Date(activeSub.nextBillingAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const { error: upsertError } = await svc.from('assinaturas').upsert({
      user_id: user.id,
      abacate_subscription_id: activeSub.id,
      abacate_customer_id: activeSub.customerId ?? null,
      status: 'ativa',
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    }, { onConflict: 'user_id' })

    if (upsertError) {
      console.error('[abacate/sync] upsert failed:', upsertError.message)
      return Response.json({ error: upsertError.message }, { status: 500 })
    }

    await svc.from('profiles').update({
      plano_ativo: 'premium',
      assinatura_expira_em: periodEnd.toISOString(),
    }).eq('id', user.id)

    console.log('[abacate/sync] premium granted for user', user.id, 'sub', activeSub.id)
    return Response.json({ synced: true })
  } catch (e: any) {
    console.error('[abacate/sync] error:', e?.message)
    return Response.json({ error: e?.message }, { status: 500 })
  }
}
