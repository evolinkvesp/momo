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
