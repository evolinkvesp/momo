"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 80;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAtTop, setIsAtTop] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDrag = (_: any, info: any) => {
    if (isRefreshing || !isAtTop) return;
    
    // Tracking downward movement from the top
    if (info.offset.y > 0) {
      const distance = Math.min(info.offset.y * 0.4, PULL_THRESHOLD + 20);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleDragEnd = async (_: any, info: any) => {
    if (isRefreshing) return;

    if (isAtTop && info.offset.y > PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(40); // Hang indicator slightly visible
      
      router.refresh();
      
      // Delay to ensure the refresh feels substantial
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setIsRefreshing(false);
      setPullDistance(0);
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div className="relative overflow-visible">
      {/* Indicator */}
      <m.div
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50"
        style={{ 
          y: pullDistance - 50,
          opacity: Math.min(1, pullDistance / 40)
        }}
        animate={isRefreshing ? { y: 20, opacity: 1 } : {}}
      >
        <div className="bg-white rounded-full p-2 shadow-xl border border-slate-100 flex items-center justify-center">
          <m.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: pullDistance * 3 }}
            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "tween" }}
          >
            <RefreshCw size={18} className="text-forest" strokeWidth={3} />
          </m.div>
        </div>
      </m.div>

      {/* Content Wrapper */}
      <m.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ y: pullDistance }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      >
        {children}
      </m.div>
    </div>
  );
}
