# Push Notifications Simplification

**Date:** 2026-06-10  
**Status:** Approved

## Overview

Replace the `next-pwa` / Workbox-based service worker with a minimal manual SW (pattern from daily-quest). Eliminate Workbox precaching errors that prevented SW installation. Simplify the `push_subscriptions` DB schema to a single `subscription_json` column. Keep all 4 backend push routes intact — only the data layer changes.

## Motivation

- `next-pwa@5.6.0` includes Next.js App Router internal manifest files (`build-manifest.json`, `app-build-manifest.json`, etc.) in the Workbox precache. These return 404, causing `bad-precaching-response` which aborts SW installation entirely.
- The existing `push-sw.js` push handler never activates because the SW never installs.
- The 3-column subscription schema (`endpoint`, `p256dh`, `auth`) is unnecessary — `web-push` accepts the full subscription object directly.

## Architecture

```
[next.config.js]       [public/push-sw.js]      [Supabase]
 plain nextConfig        push + click handlers    push_subscriptions
                              ↑ registered by        subscription_json TEXT
[app/layout.tsx]         PushRegistrar
 <PushRegistrar />            ↓
                         pushManager.subscribe()
[lib/push-client.ts]          ↓
 subscribe/unsubscribe    upsert subscription_json

                         [Backend routes — logic unchanged]
                         /api/push/send   ← JSON.parse(subscription_json)
                         /api/push/venda
                         /api/push/engine
                         /api/admin/notificacoes
```

## Changes

### 1. `next.config.js`
- Remove `next-pwa` import and `withPWA` wrapper
- Export `nextConfig` directly
- Remove `next-pwa` from `package.json` dependencies

### 2. `public/push-sw.js`
- No code changes — already handles `push` and `notificationclick`
- Now acts as the primary SW instead of being injected via `importScripts`

### 3. `components/PushRegistrar.tsx` (new file)
- Client component with a single `useEffect`
- Calls `navigator.serviceWorker.register("/push-sw.js", { scope: "/" })`
- Returns `null` — no UI
- Added to `app/layout.tsx` once

### 4. `lib/push-client.ts`
- Remove: 12s timeout, manual SW state polling, endpoint deduplication logic
- `subscribeToPush`: use `navigator.serviceWorker.ready` to wait for active SW, then `pushManager.subscribe()`, upsert `subscription_json` with `onConflict: "user_id"`
- `unsubscribeFromPush`: call `pushManager.unsubscribe()`, delete row by `user_id`
- `getPushStatus`: check `push_subscriptions` for row with matching `user_id`

### 5. Supabase Migration
New migration file `supabase/migrations/20260610000001_simplify_push_subscriptions.sql`:
```sql
ALTER TABLE push_subscriptions ADD COLUMN subscription_json TEXT;
ALTER TABLE push_subscriptions DROP COLUMN endpoint;
ALTER TABLE push_subscriptions DROP COLUMN p256dh;
ALTER TABLE push_subscriptions DROP COLUMN auth;
-- One subscription per user (last device wins on re-subscribe)
ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_user_id_unique UNIQUE (user_id);
```

**Trade-off:** Schema anterior permitia múltiplos dispositivos por usuário (unique em `endpoint`). Novo schema mantém uma subscription por usuário — ao re-subscrever num segundo dispositivo, a subscription anterior é substituída. Consistente com o padrão daily-quest e com a meta de simplificação.

### 6. Backend Routes (4 files)
Only the subscription query changes in each:
- `SELECT endpoint, p256dh, auth` → `SELECT subscription_json`
- Subscription object construction → `JSON.parse(row.subscription_json)`
- Files: `app/api/push/send/route.ts`, `app/api/push/venda/route.ts`, `app/api/push/engine/route.ts`, `app/api/admin/notificacoes/route.ts`

## Data Flow

**Subscribe:**
1. User clicks bell → `subscribeToPush(userId)`
2. `navigator.serviceWorker.ready` resolves (SW already registered by `PushRegistrar`)
3. `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC })` 
4. Upsert `{ user_id, subscription_json: JSON.stringify(sub) }` into `push_subscriptions`

**Send notification:**
1. Event (order, cron, admin) → `/api/push/send`
2. Fetch `subscription_json` rows for `user_id`
3. `webpush.sendNotification(JSON.parse(subscription_json), payload)`
4. On 404/410 → delete stale row

**Receive:**
1. SW receives `push` event
2. `push-sw.js` parses payload, calls `showNotification()`
3. Click → focus existing window or open `/`

## What Does NOT Change
- `public/push-sw.js` push/click handler logic
- All business logic in `/api/push/venda`, `/api/push/engine`, `/api/admin/notificacoes`
- Notification templates (`lib/notificacoes-templates.ts`, `lib/notificacoes-vendas.ts`)
- `notifications` table (in-app notification history)
- `NotificationBell.tsx` visual layout
- VAPID key environment variables (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`)

## Out of Scope
- Offline caching / PWA install prompt (next-pwa removal eliminates these — can be re-added separately with a focused Workbox setup if needed)
- Push notification content changes
- Engine cron schedule changes
