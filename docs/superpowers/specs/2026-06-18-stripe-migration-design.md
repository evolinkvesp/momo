# Stripe Migration Design — Momo

**Date:** 2026-06-18  
**Status:** Approved  
**Scope:** Remove Cakto payment integration, replace with Stripe Embedded Checkout + Customer Portal

---

## Context

Momo is a Next.js 14 + Supabase app for Mounjaro treatment tracking. It has a R$ 29,90/mês subscription paywall. The current payment provider is Cakto (Brazilian). We are migrating to Stripe with no active subscribers, so a clean cutover is safe.

---

## Architecture

### Files removed
| File | Reason |
|---|---|
| `lib/cakto.ts` | Replaced by `lib/stripe.ts` |
| `app/api/cakto/webhook/route.ts` | Replaced by `app/api/stripe/webhook/route.ts` |
| `app/api/cakto/pedidos/route.ts` | Admin lists subscribers directly from Supabase |
| `app/api/cakto/setup-webhook/route.ts` | Stripe webhooks are configured in the dashboard |

### Files added
| File | Responsibility |
|---|---|
| `lib/stripe.ts` | Server-side Stripe singleton client |
| `app/api/stripe/create-checkout/route.ts` | Creates `CheckoutSession` (mode: subscription, ui_mode: embedded), returns `clientSecret` |
| `app/api/stripe/webhook/route.ts` | Consumes Stripe events, updates Supabase |
| `app/api/stripe/portal/route.ts` | Creates Stripe Customer Portal session for subscription management |
| `components/StripeCheckout.tsx` | Client component wrapping `<EmbeddedCheckout>` |

### Files updated
| File | Change |
|---|---|
| `app/(app)/configuracoes/plano/page.tsx` | Remove `CAKTO_CHECKOUT_URL`, pass `userId` and `userEmail` |
| `app/(app)/configuracoes/plano/PlanoClient.tsx` | Embed `<StripeCheckout>` for upsell; replace "Gerenciar na Cakto" with portal button |
| `app/plano/PlanoClient.tsx` | Remove hardcoded Cakto URL, embed `<StripeCheckout>` |
| `middleware.ts` | Replace `/api/cakto` with `/api/stripe` in `ROTAS_LIVRES` |
| `.env.example` | Add Stripe env vars |

---

## Database

### Migration: `20260618_stripe_migration.sql`

```sql
ALTER TABLE assinaturas
  DROP COLUMN IF EXISTS cakto_order_id,
  DROP COLUMN IF EXISTS cakto_subscription_id;

ALTER TABLE assinaturas
  ADD COLUMN IF NOT EXISTS stripe_session_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;
```

`profiles.plano_ativo` and `profiles.assinatura_expira_em` remain the source of truth consumed by middleware and `usePlano`. No changes to `profiles`.

---

## Checkout Flow

```
User clicks "Assinar"
  → POST /api/stripe/create-checkout (no body needed)
    → Server reads STRIPE_PRICE_ID from env, user email from auth session
    → Stripe: CheckoutSession(mode=subscription, ui_mode=embedded, customer_email=email)
    ← { clientSecret }
  → <EmbeddedCheckout clientSecret={clientSecret} /> renders in-app
  → User completes payment
  → Stripe redirects to return_url (/plano?success=1)
  → Webhook: checkout.session.completed → activates premium in Supabase
```

The `create-checkout` route requires an authenticated session. `STRIPE_PRICE_ID` is read server-side from env (never exposed to the client). Email comes from the session, not the request body.

---

## Webhook Events

| Stripe Event | Action |
|---|---|
| `checkout.session.completed` | Upsert `assinaturas` (status=ativa), set `profiles.plano_ativo=premium`, `assinatura_expira_em` from subscription `current_period_end`, send push notification |
| `invoice.paid` | Update `proximo_vencimento`, keep status=ativa, keep `plano_ativo=premium` |
| `invoice.payment_failed` | Set status=expirada, `plano_ativo=expirado`, `assinatura_expira_em=null` |
| `customer.subscription.deleted` | Set status=cancelada, `plano_ativo=expirado`, `assinatura_expira_em=null` |
| `charge.refunded` | Set status=expirada, `plano_ativo=expirado`, `assinatura_expira_em=null` |

All webhook events are verified with `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)` before processing.

---

## Customer Portal (Manage Subscription)

The "Gerenciar Assinatura" button calls `POST /api/stripe/portal`:
1. Looks up `stripe_customer_id` from `assinaturas` for the authenticated user
2. Calls `stripe.billingPortal.sessions.create({ customer, return_url })`
3. Returns `{ url }` — frontend does `window.location.href = url`

The portal (hosted by Stripe) lets users cancel, update payment method, and view invoices.

---

## Environment Variables

```env
STRIPE_SECRET_KEY=rk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

Use a restricted API key (`rk_` prefix) with only the permissions needed: Checkout Sessions, Customers, Subscriptions, Billing Portal, Webhooks.

---

## Dependencies

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

No Cakto SDK to remove (it used plain fetch).

---

## Decisions & Constraints

- **ui_mode: embedded** — user never leaves the app during checkout
- **Dynamic payment methods** — no `payment_method_types` specified; Stripe displays eligible methods (card, PIX, etc.) automatically
- **No active subscribers** — clean migration, no data migration needed for existing subscriptions
- **Stripe API version:** 2026-05-27.dahlia (latest)
- **`proximo_vencimento`** is derived from `subscription.current_period_end` (Unix timestamp → date)
