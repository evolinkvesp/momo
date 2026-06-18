-- Migration: 20260618000000_stripe_migration.sql
-- Replaces Cakto payment columns with Stripe equivalents.
-- Safe to run with no active subscribers.

ALTER TABLE assinaturas
  DROP COLUMN IF EXISTS cakto_order_id,
  DROP COLUMN IF EXISTS cakto_subscription_id;

ALTER TABLE assinaturas
  ADD COLUMN IF NOT EXISTS stripe_session_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;
