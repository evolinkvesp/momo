CREATE TABLE IF NOT EXISTS receitas_favoritas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fase         int  NOT NULL,
  receita_id   text NOT NULL,
  receita_data jsonb NOT NULL,
  criado_em    timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS receitas_favoritas_user_receita_idx
  ON receitas_favoritas (user_id, receita_id);

ALTER TABLE receitas_favoritas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner" ON receitas_favoritas
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
