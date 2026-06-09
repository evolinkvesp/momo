"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { LazyMotion, domMax } from "framer-motion";

/**
 * Client-side providers shared across the whole app (toast notifications, and
 * a good place to add context providers later).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#1a1a1a",
            border: "1px solid #2d2d2d",
            color: "#fff",
          },
          success: {
            iconTheme: { primary: "#ff6500", secondary: "#fff" },
          },
        }}
      />
    </LazyMotion>
  );
}
