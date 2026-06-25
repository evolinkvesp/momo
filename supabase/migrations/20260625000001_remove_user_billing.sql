-- Remove funções
DROP FUNCTION IF EXISTS is_trial_ativo(uuid);
DROP FUNCTION IF EXISTS is_premium_ativo(uuid);

-- Remove tabela de assinaturas de usuários
DROP TABLE IF EXISTS assinaturas CASCADE;

-- Remove colunas de billing do profiles
ALTER TABLE profiles
  DROP COLUMN IF EXISTS plano_ativo,
  DROP COLUMN IF EXISTS trial_inicio,
  DROP COLUMN IF EXISTS trial_expira_em,
  DROP COLUMN IF EXISTS assinatura_expira_em;
