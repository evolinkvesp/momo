/* 
  Custom push handlers for Momo App.
  This file is injected into the main service worker via next-pwa.
*/

console.log("[SW] Momo Push Service Worker loaded.");

self.addEventListener("install", () => {
  console.log("[SW] Installing Momo Service Worker...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Momo Service Worker activated.");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
  console.log("[SW] Push received.");
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.warn("[SW] Push data was not JSON, using as text.");
    data = { title: "Momo", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Momo";
  const options = {
    body: data.body || "Você tem uma nova atualização.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    vibrate: [100, 50, 100],
    data: { 
      url: data.url || "/",
      receivedAt: Date.now()
    },
    actions: [
      { action: "open", title: "Ver agora" },
      { action: "close", title: "Fechar" }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  console.log("[SW] Notification clicked:", event.action);
  event.notification.close();

  if (event.action === "close") return;

  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // If a window is already open, focus it
      for (const client of clientList) {
        const clientPath = new URL(client.url).pathname;
        const targetPath = new URL(url, self.location.origin).pathname;
        
        if (clientPath === targetPath && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
