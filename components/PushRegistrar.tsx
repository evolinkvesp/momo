"use client";

import { useEffect } from "react";

export default function PushRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register sw.js (Workbox) which imports push-sw.js internally.
      // Fallback to push-sw.js directly if sw.js fails (e.g. dev mode).
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        navigator.serviceWorker.register("/push-sw.js", { scope: "/" }).catch(() => {});
      });
    }
  }, []);

  return null;
}
