# Signup Plan Selection — Design Spec

**Date:** 2026-06-18  
**Status:** Approved  
**Scope:** Add Step 4 (plan selection) to the cadastro flow, with Stripe Embedded Checkout and 7-day trial

---

## Context

The `/cadastro` page today has 3 steps (dados pessoais → tratamento → metas). After completing step 3, the Supabase account is created and the user goes straight to `/`. Every new account automatically receives a 7-day trial via the `handle_new_user` DB trigger.

We are changing this: the 7-day trial is now **Stripe-managed** (not DB-managed). Users who don't enter a card during signup start as `plano_ativo = 'free'` and hit the paywall immediately. Users who complete the Stripe checkout get `plano_ativo = 'premium'` with `trial_period_days: 7` — charged only on day 8.

---

## Flow

```
Step 1: Dados pessoais (nome, email, senha)
Step 2: Tratamento (início, dose, altura, peso)
Step 3: Metas e rotina (peso meta, dia aplicação)
  ↓ create Supabase account here (skip_trial: true)
Step 4: Plano
  ├─ [default] Pitch card → "Começar meu teste grátis" button
  ├─ [on click] EmbeddedCheckout (trial_period_days: 7)
  └─ [footer] "Entrar sem plano →" → navigate to /
```

If user exits at Step 4 without paying: account is `plano_ativo = 'free'`, middleware redirects to `/plano`.

---

## Architecture

### Files changed
| Action | File |
|---|---|
| **Modify** | `app/cadastro/page.tsx` — add step 4, move account creation to step 3→4 transition |
| **Modify** | `app/api/stripe/create-checkout/route.ts` — accept `{ signup: true }` body param → add `trial_period_days: 7` |
| **Modify** | `components/StripeCheckout.tsx` — add `signup?: boolean` prop |
| **Create** | `supabase/migrations/20260618100000_signup_skip_trial.sql` — update trigger to respect `skip_trial` flag |

### Database

```sql
-- Updated handle_new_user trigger
-- If raw_user_meta_data->>'skip_trial' = 'true':
--   plano_ativo = 'free', trial_inicio = NULL, trial_expira_em = NULL
-- Else:
--   existing behavior (plano_ativo = 'trial', trial_expira_em = now() + 7 days)
```

### Stripe

`POST /api/stripe/create-checkout` with body `{ signup: true }` adds:

```typescript
subscription_data: { trial_period_days: 7 }
```

The existing `checkout.session.completed` webhook fires immediately on checkout completion (Stripe does this even during trial). It sets `plano_ativo = 'premium'` and `assinatura_expira_em = now + 7 days`. No webhook changes needed.

---

## Step 4 UI

**Pitch card (default state):**
- Header: "⭐ Momo Premium" + "7 dias grátis, depois R$ 29,90/mês"
- 5 benefit bullets (doses, gráficos, receitas, estoque, histórico médico)
- Badge: "🔒 Pagamento seguro · Cancele quando quiser"
- CTA button: "Começar meu teste grátis →"

**After button click:**
- Pitch card replaced by `<StripeCheckout signup />`
- No footer "Próximo" in step 4 — flow is handled by Stripe's `return_url`

**Footer step 4:**
- "Prefere pular? [Entrar sem plano →]" → `router.push('/')`
- Middleware redirects them to `/plano` automatically

---

## Progress Bar

Steps indicator expands from `[1][2][3]` to `[1][2][3][4]`. All existing styles preserved.

---

## Constraints

- Next.js 14.2.15, App Router, TypeScript strict
- `supabase.auth.signUp` is called with `options.data.skip_trial = true` (string `'true'` — `raw_user_meta_data` is JSON)
- Stripe API version: `2026-05-27.dahlia`
- Account creation happens on step 3 → step 4 advance; step 4 can't go back (account already exists)
- "Entrar sem plano" must navigate to `/` (not `/plano`) — let middleware handle the redirect
