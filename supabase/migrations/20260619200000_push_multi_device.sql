-- Allow multiple devices per user in push_subscriptions.
-- Change unique constraint from user_id to endpoint URL.

ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS endpoint TEXT;

-- Backfill endpoint from existing subscription_json
UPDATE push_subscriptions
SET endpoint = subscription_json::json->>'endpoint'
WHERE endpoint IS NULL AND subscription_json IS NOT NULL;

-- Drop old single-device constraint
ALTER TABLE push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_unique;

-- New constraint: one row per device (endpoint is globally unique per push service)
ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint);
