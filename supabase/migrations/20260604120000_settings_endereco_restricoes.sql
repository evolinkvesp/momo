-- Migration: 20260604120000_settings_endereco_restricoes.sql
-- Description: Support the rebuilt /configuracoes page.
--   * profiles.endereco (jsonb)            -> default delivery address used at checkout
--   * profiles.restricoes_alimentares (text[]) -> dietary restrictions used to regenerate recipes
--
-- The flat address columns (cep, logradouro, ...) added in
-- 20260602180000_profile_address_goals.sql are kept and written alongside the
-- jsonb so the existing checkout flow (ProdutoDetalheClient) keeps working.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS endereco JSONB,
  ADD COLUMN IF NOT EXISTS restricoes_alimentares TEXT[] DEFAULT '{}';
