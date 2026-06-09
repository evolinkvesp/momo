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
          colors: ["#ff6500", "#ff7a1a", "#ffaa66", "#ffffff", "#f59e0b"],
          particleCount: Math.floor(200 * particleRatio),
          ...opts,
        });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    })();
    return () => { cancelled = true; };
  }, [achievement]);

  if (!mounted || !achievement) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-6" style={{ zIndex: "var(--z-modal)" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} style={{ zIndex: "var(--z-overlay)" }} />

      <div
        className="relative w-full max-w-xs rounded-[28px] p-7 text-center shadow-2xl animate-fade-up border border-surface-border"
        style={{ background: "var(--color-surface)", zIndex: "var(--z-modal)" }}
      >
        <div
          className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full text-[64px] leading-none"
          style={{ background: "var(--color-ember-glow)", border: "1px solid var(--color-ember-glow-strong)" }}
        >
          <span>{achievement.emoji}</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ember">
          Conquista desbloqueada!
        </p>
        <h3 className="mt-1 text-xl font-bold text-text tracking-tight">{achievement.name}</h3>

        <div className="mt-8 space-y-3">
          <button
            onClick={onShare}
            className="w-full rounded-full py-4 text-sm font-bold text-white transition-all active:scale-[0.97] shadow-ember"
            style={{ background: "linear-gradient(135deg, var(--color-ember), var(--color-ember-dim))" }}
          >
            Compartilhar progresso
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-full py-3 text-sm font-bold text-text-dim hover:text-text transition-colors"
          >
            Continuar acompanhando
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
