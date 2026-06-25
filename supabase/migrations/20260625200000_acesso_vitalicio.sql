-- Adiciona flag de acesso vitalício: isenta o usuário do gate de convites
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acesso_vitalicio BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.acesso_vitalicio IS 'Quando true, o usuário está isento do gate de 3 convites. Concedido manualmente pelo admin.';
