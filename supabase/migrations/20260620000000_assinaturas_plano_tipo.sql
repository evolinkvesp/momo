-- Adiciona coluna plano_tipo para distinguir mensal vs trimestral
ALTER TABLE assinaturas
  ADD COLUMN IF NOT EXISTS plano_tipo text NOT NULL DEFAULT 'mensal';
