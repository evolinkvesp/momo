ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS receitas_geradas_hoje INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultima_receita_data DATE;
