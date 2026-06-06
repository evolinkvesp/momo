-- Tabela de auditoria de ações administrativas
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  acao text NOT NULL,
  entidade text,            -- 'fornecedor', 'usuario', 'pedido', 'notificacao'
  entidade_id uuid,
  detalhes jsonb,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
-- Somente service role pode ler/escrever (sem policy pública)

-- Histórico de notificações em massa enviadas pelo admin
CREATE TABLE IF NOT EXISTS notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  titulo text NOT NULL,
  mensagem text NOT NULL,
  url text DEFAULT '/',
  segmento text NOT NULL,
  total_enviado int DEFAULT 0,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Adicionar status 'reprovado' à tabela fornecedores (se houver CHECK constraint)
DO $$
BEGIN
  ALTER TABLE fornecedores DROP CONSTRAINT IF EXISTS fornecedores_status_check;
  ALTER TABLE fornecedores ADD CONSTRAINT fornecedores_status_check
    CHECK (status IN ('pendente', 'ativo', 'suspenso', 'reprovado'));
EXCEPTION WHEN others THEN
  NULL; -- Ignora se a coluna não tiver constraint
END;
$$;
