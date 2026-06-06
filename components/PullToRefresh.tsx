"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 70;

function isAtBottom() {
  return window.innerHeight + window.scrollY >= document.body.scrollHeight - 10;
}

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pullUp, setPullUp] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    if (isAtBottom()) {
      startYRef.current = e.touches[0].clientY;
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startYRef.current === null || isRefreshing) return;
    const delta = startYRef.current - e.touches[0].clientY; // positivo = arrastou pra cima
    if (delta > 0 && isAtBottom()) {
      pullingRef.current = true;
      setPullUp(Math.min(delta * 0.4, PULL_THRESHOLD + 20));
    } else {
      startYRef.current = null;
      setPullUp(0);
    }
  }

  async function onTouchEnd() {
    if (pullingRef.current && pullUp > PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullUp(40);
      router.refresh();
      await new Promise((r) => setTimeout(r, 800));
      setIsRefreshing(false);
    }
    setPullUp(0);
    startYRef.current = null;
    pullingRef.current = false;
  }

  return (
    <div
      className="relative overflow-visible"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}

      {/* Indicador no fundo */}
      <m.div
        className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-50"
        style={{ opacity: Math.min(1, pullUp / 40) }}
        animate={isRefreshing ? { opacity: 1 } : {}}
      >
        <div className="bg-white rounded-full p-2 shadow-xl border border-slate-100">
          <m.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: pullUp * 3 }}
            transition={
              isRefreshing
                ? { repeat: Infinity, duration: 1, ease: "linear" }
                : { type: "tween" }
            }
          >
            <RefreshCw size={18} className="text-forest" strokeWidth={3} />
          </m.div>
        </div>
      </m.div>
    </div>
  );
}
