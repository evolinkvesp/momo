import { NextRequest } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      return Response.json({ error: 'STRIPE_PRICE_ID not configured' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const isSignup = body.signup === true
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.usemomo.online'

    // For the signup flow the session cookie may not exist yet (signUp returns
    // session:null when email confirmation is enabled). Accept the email from
    // the request body and fall back to the authenticated user's email.
    const customerEmail: string =
      (isSignup && typeof body.email === 'string' && body.email.includes('@'))
        ? body.email
        : (user?.email ?? '')

    if (!customerEmail) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const sessionParams: Record<string, any> = {
      mode: 'subscription',
      ui_mode: 'embedded',
      customer_email: customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${baseUrl}/plano?success=1`,
    }

    if (isSignup) {
      sessionParams.subscription_data = { trial_period_days: 7 }
    }

    const stripeClient = getStripe()
    const session = await stripeClient.checkout.sessions.create(sessionParams)
    return Response.json({ clientSecret: session.client_secret })

  } catch (err: any) {
    const detail = {
      type: err?.type,
      code: err?.code,
      message: err?.message,
      statusCode: err?.statusCode,
      raw: String(err),
    }
    console.error('[create-checkout]', JSON.stringify(detail))
    return Response.json({ error: err?.message || String(err), detail }, { status: 500 })
  }
}
