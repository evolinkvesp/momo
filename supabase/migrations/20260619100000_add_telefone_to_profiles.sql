-- Add telefone column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Update trigger to also capture telefone from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    data_nascimento,
    sexo,
    altura_cm,
    dose_atual_mg,
    data_inicio_tratamento,
    telefone
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome',
    NULLIF(new.raw_user_meta_data->>'data_nascimento', '')::date,
    new.raw_user_meta_data->>'sexo',
    NULLIF(new.raw_user_meta_data->>'altura_cm', '')::decimal,
    NULLIF(new.raw_user_meta_data->>'dose_atual_mg', '')::decimal,
    NULLIF(new.raw_user_meta_data->>'data_inicio_tratamento', '')::date,
    NULLIF(new.raw_user_meta_data->>'telefone', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
