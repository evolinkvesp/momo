CREATE TABLE fornecedor_assinaturas (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id           uuid REFERENCES fornecedores(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id      text,
  stripe_subscription_id  text UNIQUE,
  stripe_session_id       text,
  status                  text CHECK (status IN ('ativa','cancelada','inadimplente','pendente')) DEFAULT 'pendente',
  current_period_end      timestamptz,
  inadimplente_desde      timestamptz,
  cancel_at_period_end    boolean DEFAULT false,
  criado_em               timestamptz DEFAULT now(),
  atualizado_em           timestamptz DEFAULT now()
);

ALTER TABLE fornecedor_assinaturas ENABLE ROW LEVEL SECURITY;

-- Fornecedor vê sua própria assinatura
CREATE POLICY "Fornecedor ve sua assinatura" ON fornecedor_assinaturas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fornecedores
      WHERE id = fornecedor_assinaturas.fornecedor_id
      AND user_id = auth.uid()
    )
  );

-- Trigger para atualizar atualizado_em
CREATE TRIGGER fornecedor_assinaturas_updated_at
  BEFORE UPDATE ON fornecedor_assinaturas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
