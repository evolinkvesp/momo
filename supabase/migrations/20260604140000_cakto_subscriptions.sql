-- Migration: 20260604140000_cakto_subscriptions.sql
-- Description: Creates the assinaturas table and updates profiles for Cakto integration.

CREATE TABLE IF NOT EXISTS assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  cakto_order_id text UNIQUE,
  cakto_subscription_id text,
  plano text NOT NULL DEFAULT 'mensal',
  status text CHECK (status IN (
    'ativa','cancelada','expirada','pendente','recusada'
  )) DEFAULT 'pendente',
  valor decimal,
  proximo_vencimento date,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuario ve sua assinatura" ON assinaturas
  FOR ALL USING (auth.uid() = user_id);

-- Check if function update_updated_at exists before creating trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    CREATE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.atualizado_em = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END
$$;

-- Drop trigger if exists to avoid errors on reruns, then create
DROP TRIGGER IF EXISTS assinaturas_updated_at ON assinaturas;
CREATE TRIGGER assinaturas_updated_at
  BEFORE UPDATE ON assinaturas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Adicionar coluna de plano no profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  plano_ativo text DEFAULT 'free';
