"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface Achievement {
  emoji: string;
  name: string;
}

interface Props {
  achievement: Achievement | null;
  onShare: () => void;
  onClose: () => void;
}

/**
 * Celebration modal shown when the user unlocks a new achievement.
 * Fires a confetti burst (canvas-confetti, loaded lazily) and offers to
 * share the milestone via the ShareProgressDrawer.
 */
export function AchievementModal({ achievement, onShare, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!achievement) return;
    let cancelled = false;
    (async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (cancelled) return;
      const fire = (particleRatio: number, opts: Record<string, unknown>) =>
        confetti({
          origin: { y: 0.7 },
          colors: ["#1c4d2e", "#2d7a4f", "#4ade80", "#e8f5ee", "#fbbf24"],
          particleCount: Math.floor(200 * particleRatio),
          ...opts,
        });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    })();
    return () => {
      cancelled = true;
    };
  }, [achievement]);

  if (!mounted || !achievement) return null;

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-[131] w-full max-w-xs rounded-[28px] bg-white p-7 text-center shadow-2xl animate-fade-up">
        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-surface text-[64px] leading-none">
          <span>{achievement.emoji}</span>
        </div>
        <p className="text-sm font-black uppercase tracking-widest text-forest">
          Conquista desbloqueada!
        </p>
        <h3 className="mt-1 text-xl font-bold text-slate-900">{achievement.name}</h3>

        <div className="mt-6 space-y-3">
          <button
            onClick={onShare}
            className="w-full rounded-full bg-forest py-3.5 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.97]"
          >
            Compartilhar
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-full py-2.5 text-sm font-bold text-slate-400"
          >
            Depois
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
