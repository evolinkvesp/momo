-- Migration: 20260619210000_add_pix_comprovante.sql
-- Description: Add pix key and payment methods to suppliers, and receipt url to orders. Also create the receipts storage bucket.

-- 1. Extend suppliers table
ALTER TABLE fornecedores
  ADD COLUMN chave_pix text,
  ADD COLUMN formas_pagamento text[] DEFAULT '{}';

-- 2. Extend orders table
ALTER TABLE pedidos
  ADD COLUMN comprovante_url text;

-- 3. Create Storage bucket for Comprovantes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprovantes', 'comprovantes', true)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS for the comprovantes bucket
CREATE POLICY "Comprovantes são públicos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'comprovantes');

CREATE POLICY "Usuários autenticados podem fazer upload de comprovantes" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'comprovantes' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Usuários podem atualizar seus próprios comprovantes" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'comprovantes' AND 
    auth.role() = 'authenticated' AND
    owner = auth.uid()
  );

CREATE POLICY "Usuários podem deletar seus próprios comprovantes" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'comprovantes' AND 
    auth.role() = 'authenticated' AND
    owner = auth.uid()
  );
