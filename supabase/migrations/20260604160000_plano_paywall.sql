-- Migration: 20260604160000_plano_paywall.sql
-- Description: Premium plan + trial paywall.
--   Momo is 100% premium: on signup the user gets a 7-day free trial, then
--   must subscribe to keep using the app.

-- 1. Plan / trial columns on profiles ----------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plano_ativo text DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS trial_inicio timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS trial_expira_em timestamptz
    DEFAULT (now() + interval '7 days'),
  ADD COLUMN IF NOT EXISTS assinatura_expira_em timestamptz;

-- plano_ativo já existia (migration do Cakto) com DEFAULT 'free'. Como agora o
-- app é premium-com-trial, novos cadastros devem nascer em 'trial'.
ALTER TABLE profiles ALTER COLUMN plano_ativo SET DEFAULT 'trial';

-- Usuários legados marcados como 'free' (nunca pagantes) ganham o trial de 7
-- dias a partir de agora. Premium e cancelados não são tocados.
UPDATE profiles
SET plano_ativo = 'trial',
    trial_inicio = now(),
    trial_expira_em = now() + interval '7 days'
WHERE plano_ativo = 'free' OR plano_ativo IS NULL;

-- 2. Helper functions --------------------------------------------------------
-- Trial ainda válido?
CREATE OR REPLACE FUNCTION is_trial_ativo(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND plano_ativo = 'trial'
    AND trial_expira_em > now()
  );
$$ LANGUAGE sql;

-- Premium ativo?
CREATE OR REPLACE FUNCTION is_premium_ativo(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND plano_ativo = 'premium'
    AND (assinatura_expira_em IS NULL OR assinatura_expira_em > now())
  );
$$ LANGUAGE sql;
