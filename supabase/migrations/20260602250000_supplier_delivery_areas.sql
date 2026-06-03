-- Migration: 20260602250000_supplier_delivery_areas.sql
-- Description: Add granular delivery control (cities and radius) to suppliers.

ALTER TABLE fornecedores
  ADD COLUMN IF NOT EXISTS cidades_entrega text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS raio_entrega_km int DEFAULT 50;
