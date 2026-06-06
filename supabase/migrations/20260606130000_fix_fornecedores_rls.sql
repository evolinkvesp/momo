-- Migration: 20260606130000_fix_fornecedores_rls.sql
-- Description: Fix RLS policies for fornecedores to allow owners to see and manage their own profile even if pending.

-- 1. Fix SELECT policy: allow users to see their own profile regardless of status.
-- This is critical for the middleware and registration flow.
DROP POLICY IF EXISTS "Fornecedores são visíveis se ativos" ON fornecedores;

CREATE POLICY "Fornecedores são visíveis se ativos ou se for o dono" 
ON fornecedores FOR SELECT 
USING (status = 'ativo' OR auth.uid() = user_id);

-- 2. Improve UPDATE policy: explicitly allow owners to update their profile, 
-- but prevent them from changing their own status to 'ativo' manually.
DROP POLICY IF EXISTS "Suppliers can update their own profile" ON fornecedores;

CREATE POLICY "Suppliers can update their own profile" 
ON fornecedores FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  -- Users cannot change their own status to 'ativo' (only admins can via RPC or Service Role)
  -- If the old status was 'pendente', they can only keep it 'pendente' or 'suspenso' (though they wouldn't suspend themselves)
  -- Actually, let's just ensure they don't change status to 'ativo' if it wasn't already 'ativo'.
  AND (
    (status = 'ativo' AND (SELECT f.status FROM fornecedores f WHERE f.id = id) = 'ativo')
    OR 
    (status != 'ativo')
  )
);

-- 3. Ensure user_id is unique in fornecedores to prevent duplicate profiles for the same user.
-- This helps avoid confusing "policy errors" that are actually unique constraint violations.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fornecedores_user_id_key'
    ) THEN
        ALTER TABLE fornecedores ADD CONSTRAINT fornecedores_user_id_key UNIQUE (user_id);
    END IF;
END $$;
