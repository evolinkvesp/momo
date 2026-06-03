-- AI-generated recipe cache for the Dieta > Receitas tab. One row per
-- (user, treatment phase); refreshed at most once every 7 days by the
-- /api/receitas/gerar route handler.
CREATE TABLE IF NOT EXISTS receitas_geradas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  fase int not null,
  receitas jsonb not null,
  gerado_em timestamptz default now(),
  UNIQUE(user_id, fase)
);

ALTER TABLE receitas_geradas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario ve suas receitas" ON receitas_geradas
  FOR ALL USING (auth.uid() = user_id);
