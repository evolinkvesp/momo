-- Corrige handle_new_user: remove referências às colunas plano_ativo/trial_inicio/trial_expira_em
-- que foram removidas em 20260625000001_remove_user_billing.sql
-- Também adiciona acesso_vitalicio se ainda não existir

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acesso_vitalicio BOOLEAN DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    altura_cm,
    dose_atual_mg,
    data_inicio_tratamento
  ) VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome',
    NULLIF(new.raw_user_meta_data->>'altura_cm', '')::decimal,
    NULLIF(new.raw_user_meta_data->>'dose_atual_mg', '')::decimal,
    NULLIF(new.raw_user_meta_data->>'data_inicio_tratamento', '')::date
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
