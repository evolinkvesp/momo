-- Migration: 20260625400000_fornecedor_logos_bucket.sql
-- Description: Storage bucket for supplier logos.

INSERT INTO storage.buckets (id, name, public) VALUES ('fornecedor-logos', 'fornecedor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for "fornecedor-logos"
CREATE POLICY "Public can view supplier logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fornecedor-logos');

CREATE POLICY "Authenticated users can upload supplier logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fornecedor-logos');

CREATE POLICY "Authenticated users can update supplier logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'fornecedor-logos');

CREATE POLICY "Authenticated users can delete supplier logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fornecedor-logos');
