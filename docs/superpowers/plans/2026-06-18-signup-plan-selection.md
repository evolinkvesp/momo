# Signup Plan Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Step 4 to the cadastro flow with a Stripe Embedded Checkout (7-day trial) so users enter payment info during signup; accounts without a card start as `plano_ativo = 'free'` and hit the paywall.

**Architecture:** Account is created at the Step 3→4 transition with a `skip_trial: true` metadata flag, which the DB trigger uses to set `plano_ativo = 'free'`. Step 4 shows a pitch card; clicking it opens `<EmbeddedCheckout signup />` which creates a Stripe subscription with `trial_period_days: 7`. The existing webhook handler (`checkout.session.completed`) activates premium without changes.

**Tech Stack:** Next.js 14 App Router, Supabase Auth + Postgres, Stripe Embedded Checkout, TypeScript strict

## Global Constraints

- Next.js 14.2.15 — App Router, `"use client"` on interactive components
- TypeScript strict mode — no `any` except where Stripe types require it (documented above)
- Stripe API version: `2026-05-27.dahlia`
- `raw_user_meta_data` values are strings — pass `skip_trial` as string `'true'`, not boolean
- Account creation is irreversible — if it succeeds and the user closes the tab, they have a `plano_ativo = 'free'` account
- Do NOT modify middleware, webhook handler, or `/plano` pages — they already handle `'free'` correctly

---

## File Map

| Action | File |
|---|---|
| **Create** | `supabase/migrations/20260618100000_signup_skip_trial.sql` |
| **Modify** | `app/api/stripe/create-checkout/route.ts` |
| **Modify** | `components/StripeCheckout.tsx` |
| **Modify** | `app/cadastro/page.tsx` |

---

### Task 1: DB migration — `skip_trial` flag in trigger

**Files:**
- Create: `supabase/migrations/20260618100000_signup_skip_trial.sql`

**Interfaces:**
- Produces: `handle_new_user` trigger that sets `plano_ativo = 'free'` when `raw_user_meta_data->>'skip_trial' = 'true'`, otherwise keeps current behavior (`'trial'` + 7-day expiry)

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260618100000_signup_skip_trial.sql`:

```sql
-- Migration: 20260618100000_signup_skip_trial.sql
-- Updates handle_new_user trigger to support skip_trial flag.
-- When signup passes skip_trial=true, the user starts as 'free' (no trial).
-- The 7-day trial is then managed by Stripe (trial_period_days: 7).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF (new.raw_user_meta_data->>'skip_trial') = 'true' THEN
    -- New signup flow: Stripe manages the trial, start as 'free'
    INSERT INTO public.profiles (
      id,
      email,
      nome,
      altura_cm,
      dose_atual_mg,
      data_inicio_tratamento,
      plano_ativo,
      trial_inicio,
      trial_expira_em
    ) VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'nome',
      NULLIF(new.raw_user_meta_data->>'altura_cm', '')::decimal,
      NULLIF(new.raw_user_meta_data->>'dose_atual_mg', '')::decimal,
      NULLIF(new.raw_user_meta_data->>'data_inicio_tratamento', '')::date,
      'free',
      NULL,
      NULL
    );
  ELSE
    -- Legacy flow: 7-day trial starts on signup
    INSERT INTO public.profiles (
      id,
      email,
      nome,
      data_nascimento,
      sexo,
      altura_cm,
      dose_atual_mg,
      data_inicio_tratamento
    ) VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'nome',
      NULLIF(new.raw_user_meta_data->>'data_nascimento', '')::date,
      new.raw_user_meta_data->>'sexo',
      NULLIF(new.raw_user_meta_data->>'altura_cm', '')::decimal,
      NULLIF(new.raw_user_meta_data->>'dose_atual_mg', '')::decimal,
      NULLIF(new.raw_user_meta_data->>'data_inicio_tratamento', '')::date
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 2: Apply migration to Supabase**

Run the SQL above in the Supabase Dashboard SQL editor for project `wlnlmmvlhjazqifyetse`.

Verify: create a test auth user with `raw_user_meta_data = { "skip_trial": "true" }` and confirm the resulting profile row has `plano_ativo = 'free'` and `trial_expira_em IS NULL`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260618100000_signup_skip_trial.sql
git commit -m "feat(cadastro): add skip_trial DB trigger flag for Stripe-managed trial"
```

---

### Task 2: Update create-checkout API for trial

**Files:**
- Modify: `app/api/stripe/create-checkout/route.ts`

**Interfaces:**
- Consumes: `POST /api/stripe/create-checkout` with optional body `{ signup: true }`
- Produces: `{ clientSecret: string }` — when `signup: true`, the underlying Stripe subscription has `trial_period_days: 7`

- [ ] **Step 1: Replace the route file**

Replace the full content of `app/api/stripe/create-checkout/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { createRouteClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = createRouteClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const isSignup = body.signup === true

  const priceId = process.env.STRIPE_PRICE_ID!
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://momo-rust-nu.vercel.app'

  const sessionParams: Record<string, any> = {
    mode: 'subscription',
    ui_mode: 'embedded' as any,
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    return_url: `${baseUrl}/plano?success=1`,
  }

  if (isSignup) {
    sessionParams.subscription_data = { trial_period_days: 7 }
  }

  const session = await stripe.checkout.sessions.create(sessionParams)
  return Response.json({ clientSecret: session.client_secret })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/stripe/create-checkout/route.ts
git commit -m "feat(stripe): support trial_period_days:7 for signup checkout"
```

---

### Task 3: Update StripeCheckout component

**Files:**
- Modify: `components/StripeCheckout.tsx`

**Interfaces:**
- Consumes: `POST /api/stripe/create-checkout` with `{ signup: boolean }` body (Task 2)
- Produces: `<StripeCheckout />` (existing) and `<StripeCheckout signup />` (new) — the latter creates a subscription with a 7-day trial

- [ ] **Step 1: Replace the component file**

Replace the full content of `components/StripeCheckout.tsx`:

```tsx
"use client"

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function StripeCheckout({ signup }: { signup?: boolean }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signup: signup ?? false }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret)
        else setError('Não foi possível iniciar o checkout.')
      })
      .catch(() => setError('Erro ao conectar com o servidor.'))
  }, [signup])

  if (error) {
    return (
      <p className="py-4 text-center text-sm text-danger">{error}</p>
    )
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ember border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/StripeCheckout.tsx
git commit -m "feat(stripe): add signup prop to StripeCheckout for trial checkout"
```

---

### Task 4: Rewrite cadastro page with Step 4

**Files:**
- Modify: `app/cadastro/page.tsx`

**Interfaces:**
- Consumes: `supabase.auth.signUp` with `options.data.skip_trial = 'true'` — creates account as `plano_ativo = 'free'` (Task 1)
- Consumes: `<StripeCheckout signup />` from Task 3
- Produces: 4-step signup flow; after step 3 account exists; step 4 shows plan pitch + checkout

- [ ] **Step 1: Replace the full page file**

Replace the full content of `app/cadastro/page.tsx`:

```tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ArrowRight, Check, User, Activity, Target, Star, Bell, TrendingUp, Utensils, Package, BookOpen, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { StripeCheckout } from '@/components/StripeCheckout';

const DOSES = ['2.5', '5', '7.5', '10', '12.5', '15'];
const DIAS_SEMANA = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
];

const BENEFICIOS = [
  { icon: <Bell size={15} />, text: 'Lembretes automáticos de dose' },
  { icon: <TrendingUp size={15} />, text: 'Gráficos de peso e progresso' },
  { icon: <Utensils size={15} />, text: 'Receitas para sua fase do tratamento' },
  { icon: <Package size={15} />, text: 'Alerta de estoque de ampolas' },
  { icon: <BookOpen size={15} />, text: 'Histórico completo para o médico' },
];

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    data_inicio_tratamento: '',
    dose_atual_mg: '2.5',
    altura_cm: '',
    peso_inicial: '',
    peso_meta: '',
    dia_aplicacao: '0',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createAccount = async () => {
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nome: formData.nome,
          skip_trial: 'true',
          altura_cm: Number(formData.altura_cm),
          peso_inicial: Number(formData.peso_inicial),
          peso_meta: formData.peso_meta ? Number(formData.peso_meta) : null,
          data_inicio_tratamento: formData.data_inicio_tratamento,
          dose_atual_mg: Number(formData.dose_atual_mg),
          dia_aplicacao: Number(formData.dia_aplicacao),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return false;
    }
    return true;
  };

  const nextStep = async () => {
    if (step === 1 && (!formData.nome || !formData.email || !formData.password)) {
      toast.error('Preencha os dados básicos');
      return;
    }
    if (step === 2 && (!formData.data_inicio_tratamento || !formData.altura_cm || !formData.peso_inicial)) {
      toast.error('Preencha os dados do tratamento');
      return;
    }
    if (step === 3) {
      const ok = await createAccount();
      if (!ok) return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step === 1) { router.push('/login'); }
    else if (step === 4) { /* can't go back after account created */ }
    else { setStep(step - 1); }
  };

  const TOTAL_STEPS = 4;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
      <header
        className="flex items-center justify-between px-6 py-4 shadow-sm"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-surface-border)" }}
      >
        <button
          onClick={prevStep}
          className="rounded-full p-2 transition-all active:scale-95"
          style={{
            background: "var(--color-surface-mid)",
            color: step === 4 ? "transparent" : "var(--color-text-muted)",
            border: "1px solid var(--color-surface-border)",
            pointerEvents: step === 4 ? "none" : "auto",
          }}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-text">Criar conta</h1>
        <div className="w-10" />
      </header>

      {/* Progress Bar */}
      <div className="flex px-6 pt-6">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex flex-1 items-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
              style={
                step >= s
                  ? { background: "var(--color-ember)", color: "#fff", boxShadow: "var(--shadow-ember)" }
                  : { background: "var(--color-surface-mid)", color: "var(--color-text-dim)", border: "1px solid var(--color-surface-border)" }
              }
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < TOTAL_STEPS && (
              <div
                className="h-0.5 flex-1 transition-all duration-300"
                style={{ background: step > s ? "var(--color-ember)" : "var(--color-surface-border)" }}
              />
            )}
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-6 pt-8">
        <div className="mx-auto max-w-md pb-32">
          {error && (
            <div className="mb-6 animate-fade-up rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-up">
              <StepHeader icon={<User className="h-5 w-5" />} title="Dados pessoais" subtitle="Comece sua jornada" />
              <DarkInput label="Nome completo" name="nome" value={formData.nome} onChange={handleChange} placeholder="Como deseja ser chamado?" />
              <DarkInput label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" />
              <DarkInput label="Senha" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <StepHeader icon={<Activity className="h-5 w-5" />} title="Seu tratamento" subtitle="Personalize seu acompanhamento" />
              <DarkInput label="Início do tratamento" name="data_inicio_tratamento" type="date" value={formData.data_inicio_tratamento} onChange={handleChange} />

              <div>
                <label className="mb-2 block text-sm font-bold text-text">Dose atual (mg)</label>
                <div className="grid grid-cols-3 gap-2">
                  {DOSES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({ ...formData, dose_atual_mg: d })}
                      className="rounded-xl py-3 text-sm font-bold transition-all duration-200"
                      style={
                        formData.dose_atual_mg === d
                          ? { background: "var(--color-ember)", color: "#fff", boxShadow: "var(--shadow-ember)", transform: "scale(1.02)" }
                          : { background: "var(--color-surface)", color: "var(--color-text-muted)", border: "1px solid var(--color-surface-border)" }
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DarkInput label="Altura (cm)" name="altura_cm" type="number" value={formData.altura_cm} onChange={handleChange} placeholder="Ex: 175" />
                <DarkInput label="Peso inicial (kg)" name="peso_inicial" type="number" value={formData.peso_inicial} onChange={handleChange} placeholder="Ex: 95.5" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-up">
              <StepHeader icon={<Target className="h-5 w-5" />} title="Metas e rotina" subtitle="Onde você quer chegar?" />
              <DarkInput label="Peso meta (opcional)" name="peso_meta" type="number" value={formData.peso_meta} onChange={handleChange} placeholder="Ex: 70.0" />

              <div>
                <label className="mb-2 block text-sm font-bold text-text">Dia da aplicação</label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, dia_aplicacao: String(d.id) })}
                      className="min-w-[60px] flex-1 rounded-full py-2.5 text-xs font-bold transition-all duration-200"
                      style={
                        formData.dia_aplicacao === String(d.id)
                          ? { background: "var(--color-ember)", color: "#fff", boxShadow: "var(--shadow-ember)", transform: "scale(1.05)" }
                          : { background: "var(--color-surface)", color: "var(--color-text-muted)", border: "1px solid var(--color-surface-border)" }
                      }
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-text-dim">Enviaremos lembretes neste dia para você não esquecer a dose.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-fade-up">
              <StepHeader icon={<Star className="h-5 w-5" />} title="Seu plano" subtitle="7 dias grátis para começar" />

              {showCheckout ? (
                <StripeCheckout signup />
              ) : (
                <div
                  className="space-y-5 rounded-[24px] p-6"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-surface-border)" }}
                >
                  {/* Header do plano */}
                  <div
                    className="relative overflow-hidden rounded-2xl p-5"
                    style={{ background: "linear-gradient(135deg, #1a0800, #2d1200)", border: "1px solid rgba(255,101,0,0.2)" }}
                  >
                    <div
                      className="absolute right-0 top-0 h-32 w-32 rounded-full opacity-10"
                      style={{ background: "#ff6500", filter: "blur(40px)", transform: "translate(20%, -20%)" }}
                    />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(255,101,0,0.8)" }}>
                        Momo Premium
                      </p>
                      <div className="mt-2 flex items-end gap-1">
                        <span className="text-3xl font-black text-white">R$ 29,90</span>
                        <span className="mb-1 text-sm font-medium text-white/50">/mês</span>
                      </div>
                      <p className="mt-1 text-sm font-bold" style={{ color: "rgba(255,101,0,0.9)" }}>
                        7 dias grátis — cancele quando quiser
                      </p>
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-3">
                    {BENEFICIOS.map((b, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "rgba(255,101,0,0.1)", color: "#ff6500" }}
                        >
                          {b.icon}
                        </div>
                        <span className="text-sm font-medium text-text">{b.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Badge segurança */}
                  <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-text-dim">
                    <ShieldCheck size={13} style={{ color: "#ff6500" }} />
                    Pagamento seguro · Cancele quando quiser
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-black text-white transition-all active:scale-[0.97]"
                    style={{
                      background: "linear-gradient(135deg, #ff6500, #e05500)",
                      boxShadow: "0 8px 24px rgba(255,101,0,0.4)",
                    }}
                  >
                    Começar meu teste grátis
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer
        className="fixed bottom-0 left-0 right-0 z-40 p-6"
        style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-surface-border)" }}
      >
        <div className="mx-auto max-w-md">
          {step < 3 && (
            <button
              onClick={nextStep}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold text-white shadow-lg transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, var(--color-ember), var(--color-ember-dim))", boxShadow: "var(--shadow-ember)" }}
            >
              Próximo
              <ArrowRight className="h-5 w-5" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={nextStep}
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, var(--color-ember), var(--color-ember-dim))", boxShadow: "var(--shadow-ember)" }}
            >
              {loading ? 'Criando conta...' : 'Próximo'}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          )}

          {step === 4 && !showCheckout && (
            <button
              onClick={() => router.push('/')}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-all active:scale-95"
              style={{
                background: "transparent",
                border: "1px solid var(--color-surface-border)",
                color: "var(--color-text-dim)",
              }}
            >
              Prefiro pular por agora
            </button>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-text-dim">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-bold hover:underline" style={{ color: "var(--color-ember)" }}>
            Entrar
          </Link>
        </p>
      </footer>
    </div>
  );
}

function StepHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ background: "var(--color-ember-glow)", color: "var(--color-ember)", border: "1px solid var(--color-ember-glow-strong)" }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-text">{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function DarkInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-text">{label}</label>
      <input
        {...props}
        className="block h-12 w-full rounded-xl px-4 text-sm text-text outline-none transition-all"
        style={{ background: "var(--color-surface-mid)", border: "1px solid var(--color-surface-border)" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-ember)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-ember-glow)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-surface-border)"; e.currentTarget.style.boxShadow = "none"; }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify full build**

```bash
npm run build
```

Expected: build completes, `/cadastro` listed in routes, no errors.

- [ ] **Step 4: Commit**

```bash
git add app/cadastro/page.tsx
git commit -m "feat(cadastro): add step 4 plan selection with Stripe trial checkout"
```

---

### Task 5: Push to production

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Apply DB migration in Supabase Dashboard**

If not already done in Task 1 Step 2: open Supabase SQL editor for project `wlnlmmvlhjazqifyetse`, paste and run the migration from Task 1.

- [ ] **Step 3: Deploy to Vercel**

```bash
vercel deploy --prod
```

Expected: build passes, deployed to `https://www.usemomo.online`.

- [ ] **Step 4: Manual smoke test**

1. Open `https://www.usemomo.online/cadastro`
2. Complete steps 1-3 with test data
3. Verify step 4 pitch card appears with "7 dias grátis" text
4. Click "Começar meu teste grátis" — verify Stripe EmbeddedCheckout appears
5. Use Stripe test card `4242 4242 4242 4242` (exp any future date, any CVC)
6. After payment: verify redirect to `/plano?success=1` showing "Assinatura Premium Ativa"
7. Check Supabase `profiles` table: `plano_ativo = 'premium'`
8. Check Supabase `assinaturas` table: new row with `stripe_subscription_id`, `status = 'ativa'`

---

## Post-Implementation Checklist

- [ ] Test "Prefiro pular por agora" button: user lands on `/plano` paywall (middleware redirects `'free'` users)
- [ ] Test back button on step 4: confirm it's disabled (back arrow hidden/non-functional on step 4)
- [ ] Confirm Stripe Dashboard shows subscription in trial state for the test signup
