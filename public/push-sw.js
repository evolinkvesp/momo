/* 
  Custom push handlers for Momo App.
  This file is injected into the main service worker via next-pwa.
*/

self.addEventListener("push", function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
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
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(url, self.location.origin);
        
        if (clientUrl.pathname === targetUrl.pathname && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
