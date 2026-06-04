-- Migration: 20260604170000_ensure_notifications_push.sql
-- Description: Garantir que as tabelas de notificações e push existam com as políticas corretas.

-- 1. Tabela de Notificações In-App
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text NOT NULL,
    url text,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Users can manage their own notifications'
    ) THEN
        CREATE POLICY "Users can manage their own notifications" ON notifications 
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Tabela de Inscrições de Push (Web Push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    endpoint TEXT UNIQUE,
    p256dh TEXT,
    auth TEXT,
    created_at TIMESTAMPTT DEFAULT now()
);

-- Corrigindo erro de digitação no tipo TIMESTAMPTZ se houver
ALTER TABLE push_subscriptions ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'push_subscriptions' AND policyname = 'Users can manage own push_subscriptions.'
    ) THEN
        CREATE POLICY "Users can manage own push_subscriptions." ON push_subscriptions 
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Recarregar o esquema para o PostgREST
NOTIFY pgrst, 'reload schema';
