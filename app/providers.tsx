"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { LazyMotion, domMax } from "framer-motion";

/**
 * Client-side providers shared across the whole app (toast notifications, and
 * a good place to add context providers later).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("[SW] Active at:", reg.scope))
          .catch((err) => console.error("[SW] Registration error:", err));
      });
    }
  }, []);

  return (
    <LazyMotion features={domMax}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#0f172a",
            color: "#fff",
          },
          success: {
            iconTheme: { primary: "#16a34a", secondary: "#fff" },
          },
        }}
      />
    </LazyMotion>
  );
}
