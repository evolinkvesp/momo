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

/** Check if browser supports all required APIs for Web Push. */
export function pushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Check if this specific device already has an active push subscription. */
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

/**
 * Waits for a SW registration to reach "active" state.
 * Uses statechange events instead of navigator.serviceWorker.ready,
 * which can hang if the SW never claims the page.
 */
async function waitForActiveRegistration(
  reg: ServiceWorkerRegistration,
  timeoutMs = 12000
): Promise<ServiceWorkerRegistration> {
  if (reg.active) return reg;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Service Worker demorou para ativar. Recarregue a página.")),
      timeoutMs
    );

    const sw = reg.installing ?? reg.waiting;
    if (!sw) {
      clearTimeout(timer);
      resolve(reg);
      return;
    }

    function onStateChange(this: ServiceWorker) {
      if (this.state === "activated" || this.state === "activating") {
        clearTimeout(timer);
        sw!.removeEventListener("statechange", onStateChange);
        resolve(reg);
      } else if (this.state === "redundant") {
        clearTimeout(timer);
        sw!.removeEventListener("statechange", onStateChange);
        reject(new Error("Service Worker entrou em estado redundante."));
      }
    }

    sw.addEventListener("statechange", onStateChange);
  });
}

/**
 * Subscribe flow:
 * 1. Request permission
 * 2. Register SW if not present (with updateViaCache: none to avoid stale SW)
 * 3. Wait for SW active state (not controlling — just active is enough for PushManager)
 * 4. Get/create PushManager subscription
 * 5. Sync to Supabase
 */
export async function subscribeToPush(userId: string): Promise<void> {
  if (!pushSupported()) {
    throw new Error("Seu navegador não suporta notificações push.");
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    throw new Error("Erro de configuração: chave VAPID não encontrada.");
  }

  // 1. Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Você precisa permitir as notificações no seu navegador.");
  }

  // 2. Ensure SW is registered
  let reg = await navigator.serviceWorker.getRegistration("/");
  if (!reg) {
    console.log("[Push] SW not found, registering...");
    reg = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }

  // 3. Wait for active (not controlling) — avoids hanging on first install
  const activeReg = await waitForActiveRegistration(reg);

  // 4. Get or create subscription via reg.pushManager directly
  let sub = await activeReg.pushManager.getSubscription();
  if (!sub) {
    console.log("[Push] Creating new subscription...");
    sub = await activeReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
    });
  }

  // 5. Sync to Supabase — clean up old entry for same endpoint first
  const json = sub.toJSON();
  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);

  const { error } = await supabase.from("push_subscriptions").insert({
    user_id: userId,
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh ?? null,
    auth: json.keys?.auth ?? null,
  });

  if (error) {
    throw new Error("Erro ao salvar sua inscrição no servidor.");
  }

  console.log("[Push] Subscription successful!");
}

/**
 * Unsubscribe flow:
 * 1. Unsubscribe from PushManager
 * 2. Remove from Supabase
 */
export async function unsubscribeFromPush(): Promise<void> {
  if (!pushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    }
  } catch (e) {
    console.error("[Push] Error unsubscribing:", e);
  }
}
