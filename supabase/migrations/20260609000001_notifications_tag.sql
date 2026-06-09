-- Migration: 20260609000001_notifications_tag.sql
-- Adiciona coluna `tag` na tabela notifications para deduplicação de notificações automáticas.

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tag TEXT;

-- Índice para acelerar a busca por tag (usada na deduplicação do engine)
CREATE INDEX IF NOT EXISTS idx_notifications_user_tag ON notifications(user_id, tag)
WHERE tag IS NOT NULL;
