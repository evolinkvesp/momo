-- Migration: 20260602230000_city_radius_delivery.sql
-- Description: Replace state-based delivery with city-radius and specific cities.

ALTER TABLE fornecedores
  ADD COLUMN raio_entrega_km int DEFAULT 50,
  ADD COLUMN cidades_entrega text[] DEFAULT '{}',
  DROP COLUMN IF EXISTS regioes_entrega;
