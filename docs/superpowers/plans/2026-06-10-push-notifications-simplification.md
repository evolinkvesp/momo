# Push Notifications Simplification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace next-pwa/Workbox with a manual SW, migrate `push_subscriptions` to a single `subscription_json` column, and simplify `push-client.ts` — keeping all 4 backend push routes working.

**Architecture:** `PushRegistrar` registers `/push-sw.js` directly on mount. Backend routes parse `subscription_json` directly into `webpush.sendNotification()`. Engine route is unchanged (it delegates to `/api/push/send` via HTTP).

**Tech Stack:** Next.js App Router, Supabase, web-push, TypeScript

---

## File Map

| Action | File |
|--------|------|
| Create | `supabase/migrations/20260610000001_simplify_push_subscriptions.sql` |
| Modify | `app/api/push/send/route.ts` |
| Modify | `app/api/push/venda/route.ts` |
| Modify | `app/api/admin/notificacoes/route.ts` |
| Modify | `lib/push-client.ts` |
| Modify | `app/(app)/configuracoes/ConfiguracoesClient.tsx` (unsubscribeFromPush call) |
| Create | `components/PushRegistrar.tsx` |
| Modify | `app/layout.tsx` |
| Modify | `next.config.js` |
| Modify | `package.json` (remove next-pwa) |
| Modify | `public/push-sw.js` (update comment only) |

---

## Task 1: Supabase Migration

**Files:**
- Create: `supabase/migrations/20260610000001_simplify_push_subscriptions.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/20260610000001_simplify_push_subscriptions.sql

-- Add new unified column
ALTER TABLE push_subscriptions ADD COLUMN subscription_json TEXT;

-- Remove old split columns
ALTER TABLE push_subscriptions DROP COLUMN endpoint;
ALTER TABLE push_subscriptions DROP COLUMN p256dh;
ALTER TABLE push_subscriptions DROP COLUMN auth;

-- One subscription per user (last device wins on re-subscribe)
ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_user_id_unique UNIQUE (user_id);
```

- [ ] **Step 2: Apply migration**

Run in Supabase SQL editor or via CLI:
```bash
npx supabase db push
```

Or paste the SQL above in the Supabase dashboard → SQL Editor → Run.

- [ ] **Step 3: Verify schema**

In Supabase Table Editor → `push_subscriptions`, confirm columns are:
```
id, user_id, subscription_json, created_at
```
No `endpoint`, `p256dh`, or `auth` columns.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260610000001_simplify_push_subscriptions.sql
git commit -m "feat: simplify push_subscriptions schema to single subscription_json column"
```

---

## Task 2: Update `/api/push/send`

**Files:**
- Modify: `app/api/push/send/route.ts:43-79`

- [ ] **Step 1: Replace subscription select and webpush call**

In `app/api/push/send/route.ts`, replace lines 41–80:

```typescript
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("id, subscription_json")
      .eq("user_id", userId);

    if (error) {
      console.error("[PushSend] Supabase fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      console.log("[PushSend] No subscriptions found for user");
      return NextResponse.json({ ok: true, sent: 0 });
    }

    const payload = JSON.stringify({
      title,
      body: finalBody,
      url: url ?? "/",
    });

    console.log(`[PushSend] Recording in-app notification for ${userId}`);
    await supabase.from("notifications").insert({
      user_id: userId,
      title,
      body: finalBody,
      url: url ?? "/",
      tag: tag ?? null,
      read: false,
    });

    console.log(`[PushSend] Sending to ${subs.length} endpoints...`);
    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(JSON.parse(s.subscription_json), payload),
      ),
    );

    const stale: string[] = [];
    results.forEach((r, i) => {
      if (
        r.status === "rejected" &&
        [404, 410].includes((r.reason as { statusCode?: number })?.statusCode ?? 0)
      ) {
        stale.push(subs[i].id);
      }
    });

    if (stale.length > 0) {
      console.log(`[PushSend] Cleaning up ${stale.length} stale subscriptions`);
      await supabase.from("push_subscriptions").delete().in("id", stale);
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    console.log(`[PushSend] Success: ${sent} notifications delivered`);
    return NextResponse.json({ ok: true, sent });
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd D:/baixados/monjaro && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to `push/send/route.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/api/push/send/route.ts
git commit -m "feat: update /api/push/send to use subscription_json schema"
```

---

## Task 3: Update `/api/push/venda`

**Files:**
- Modify: `app/api/push/venda/route.ts:37-61`

- [ ] **Step 1: Replace `enviarPush` subscription select and webpush call**

In `app/api/push/venda/route.ts`, replace the `enviarPush` function (lines 24–62) with:

```typescript
async function enviarPush(userId: string, payload: PushPayload): Promise<number> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || "mailto:no-reply@momo.app";

  if (!publicKey || !privateKey) {
    console.warn("[PushVenda] VAPID keys missing, skipping.");
    return 0;
  }

  webpush.setVapidDetails(vapidEmail, publicKey, privateKey);

  const supabase = createServiceClient();
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, subscription_json")
    .eq("user_id", userId);

  if (!subs?.length) return 0;

  const json = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush
        .sendNotification(JSON.parse(sub.subscription_json), json)
        .catch(async (err: any) => {
          if ([404, 410].includes(err?.statusCode)) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
          throw err;
        }),
    ),
  );

  return results.filter((r) => r.status === "fulfilled").length;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to `push/venda/route.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/api/push/venda/route.ts
git commit -m "feat: update /api/push/venda to use subscription_json schema"
```

---

## Task 4: Update `/api/admin/notificacoes`

**Files:**
- Modify: `app/api/admin/notificacoes/route.ts:51-65`

- [ ] **Step 1: Replace subscription select and webpush call**

In `app/api/admin/notificacoes/route.ts`, replace line 51:
```typescript
  const { data: subs } = await admin.from("push_subscriptions").select("user_id, id, subscription_json").in("user_id", userIds);
```

Replace line 65:
```typescript
  const results = await Promise.allSettled(subs.map((s) => webpush.sendNotification(JSON.parse(s.subscription_json), payload)));
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/notificacoes/route.ts
git commit -m "feat: update /api/admin/notificacoes to use subscription_json schema"
```

---

## Task 5: Simplify `lib/push-client.ts`

**Files:**
- Modify: `lib/push-client.ts` (full rewrite)

- [ ] **Step 1: Replace file content**

Replace the entire `lib/push-client.ts` with:

```typescript
"use client";

import { supabase } from "@/lib/supabase";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function pushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushStatus(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

export async function subscribeToPush(userId: string): Promise<void> {
  if (!pushSupported()) {
    throw new Error("Seu navegador não suporta notificações push.");
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    throw new Error("Erro de configuração: chave VAPID não encontrada.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Você precisa permitir as notificações no seu navegador.");
  }

  // navigator.serviceWorker.ready resolves once the SW is active (registered by PushRegistrar)
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
  });

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { user_id: userId, subscription_json: JSON.stringify(sub) },
      { onConflict: "user_id" },
    );

  if (error) {
    throw new Error("Erro ao salvar sua inscrição no servidor.");
  }
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  if (!pushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    if (reg) {
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
    }
    await supabase.from("push_subscriptions").delete().eq("user_id", userId);
  } catch (e) {
    console.error("[Push] Error unsubscribing:", e);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: may show errors in `ConfiguracoesClient.tsx` because `unsubscribeFromPush` now requires `userId` — fix in Task 6.

- [ ] **Step 3: Commit**

```bash
git add lib/push-client.ts
git commit -m "feat: simplify push-client.ts — remove 12s timeout and use subscription_json"
```

---

## Task 6: Update `unsubscribeFromPush` call in ConfiguracoesClient

**Files:**
- Modify: `app/(app)/configuracoes/ConfiguracoesClient.tsx:355`

- [ ] **Step 1: Add userId to unsubscribeFromPush call**

Find line ~355 in `app/(app)/configuracoes/ConfiguracoesClient.tsx`:
```typescript
await unsubscribeFromPush();
```

Replace with:
```typescript
await unsubscribeFromPush(userId);
```

Note: this is inside `NotificacoesSection({ userId })` — `userId` is already the prop name, same variable used on line 359 for `subscribeToPush(userId)`.

- [ ] **Step 2: Verify TypeScript compiles with no errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add app/(app)/configuracoes/ConfiguracoesClient.tsx
git commit -m "fix: pass userId to unsubscribeFromPush in ConfiguracoesClient"
```

---

## Task 7: Create `PushRegistrar` component

**Files:**
- Create: `components/PushRegistrar.tsx`

- [ ] **Step 1: Create file**

```typescript
// components/PushRegistrar.tsx
"use client";

import { useEffect } from "react";

export default function PushRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/push-sw.js", { scope: "/" }).catch(() => {});
    }
  }, []);

  return null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/PushRegistrar.tsx
git commit -m "feat: add PushRegistrar component for manual SW registration"
```

---

## Task 8: Add `PushRegistrar` to root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Import and render PushRegistrar**

In `app/layout.tsx`, add the import after existing imports:
```typescript
import PushRegistrar from "@/components/PushRegistrar";
```

Inside the `<body>` tag, add `<PushRegistrar />` before `<Providers>`:
```tsx
<body className={`${outfit.className} font-sans bg-bg`} suppressHydrationWarning>
  <PushRegistrar />
  <Providers>{children}</Providers>
</body>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: register push SW on mount via PushRegistrar in root layout"
```

---

## Task 9: Remove next-pwa

**Files:**
- Modify: `next.config.js`
- Modify: `package.json`
- Modify: `public/push-sw.js` (comment update)

- [ ] **Step 1: Rewrite `next.config.js`**

Replace the entire file with:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "date-fns",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
```

- [ ] **Step 2: Remove next-pwa from package.json**

```bash
npm uninstall next-pwa
```

- [ ] **Step 3: Update comment in `public/push-sw.js`**

Replace the top comment in `public/push-sw.js`:
```javascript
// Push notification handler for Momo App.
// Registered directly by PushRegistrar — no Workbox or next-pwa dependency.
```

- [ ] **Step 4: Verify build succeeds**

```bash
npm run build 2>&1 | tail -20
```

Expected: build completes without Workbox or next-pwa errors. No `sw.js` is generated in `public/`.

- [ ] **Step 5: Commit**

```bash
git add next.config.js package.json package-lock.json public/push-sw.js
git commit -m "feat: remove next-pwa, register push SW directly without Workbox"
```

---

## Verification

After all tasks, deploy and confirm:

1. Open DevTools → Application → Service Workers
   - SW status: **ACTIVATED**
   - Source: `/push-sw.js`
   - No Workbox errors in console

2. Subscribe to push in Settings → Notificações
   - Check `push_subscriptions` table: row has `subscription_json` column with JSON value

3. Send a test push:
   ```bash
   curl -X POST https://momo-rust-nu.vercel.app/api/push/send \
     -H "Content-Type: application/json" \
     -d '{"userId":"<your-user-id>","title":"Teste","body":"Funcionou!"}'
   ```
   Expected response: `{"ok":true,"sent":1}`
   Expected result: notification appears on device
