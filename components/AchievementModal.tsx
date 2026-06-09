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
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!achievement) return;
    let raf: number;
    raf = requestAnimationFrame(() => setVisible(true));

    let cancelled = false;
    (async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (cancelled) return;
      const fire = (ratio: number, opts: Record<string, unknown>) =>
        confetti({
          origin: { y: 0.65 },
          colors: ["#ff6500", "#ff7a1a", "#ffaa66", "#fff7ed", "#fbbf24"],
          particleCount: Math.floor(280 * ratio),
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
      setVisible(false);
      cancelAnimationFrame(raf);
    };
  }, [achievement]);

  if (!mounted || !achievement) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes _achieveRing1 {
          0%,100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes _achieveRing2 {
          0%,100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.22); opacity: 0.45; }
        }
        @keyframes _achieveFloat {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes _achieveShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div
        className="fixed inset-0 flex items-center justify-center px-6"
        style={{ zIndex: "var(--z-modal)" }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(4, 2, 0, 0.94)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            zIndex: "var(--z-overlay)",
          }}
          onClick={onClose}
        />

        {/* Bottom ember ambience */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 360,
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(255,101,0,0.2) 0%, rgba(204,68,0,0.08) 40%, transparent 70%)",
            pointerEvents: "none",
            zIndex: "var(--z-overlay)",
          }}
        />

        {/* Card */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 340,
            textAlign: "center",
            zIndex: "var(--z-modal)",
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateY(0) scale(1)"
              : "translateY(36px) scale(0.90)",
            transition:
              "opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Emoji orb with rings */}
          <div
            style={{
              position: "relative",
              marginBottom: 28,
              display: "inline-block",
            }}
          >
            {/* Outer pulse ring */}
            <div
              style={{
                position: "absolute",
                inset: -22,
                borderRadius: "50%",
                border: "1px solid rgba(255,101,0,0.18)",
                animation: "_achieveRing2 3.2s ease-in-out infinite",
              }}
            />
            {/* Inner pulse ring */}
            <div
              style={{
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                border: "1px solid rgba(255,101,0,0.35)",
                animation: "_achieveRing1 2.6s ease-in-out infinite",
              }}
            />
            {/* Emoji orb */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 40% 35%, #2d1500, #160a00)",
                border: "1.5px solid rgba(255,101,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                boxShadow:
                  "0 0 48px rgba(255,101,0,0.28), 0 0 100px rgba(255,101,0,0.08), inset 0 1px 0 rgba(255,200,80,0.12)",
                animation: "_achieveFloat 3.5s ease-in-out infinite",
              }}
            >
              {achievement.emoji}
            </div>
          </div>

          {/* "Conquista desbloqueada" chip */}
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,101,0,0.3)",
              background: "rgba(255,101,0,0.1)",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#ff6500",
              fontFamily: "Syne, sans-serif",
              marginBottom: 14,
            }}
          >
            Conquista desbloqueada
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "Syne, sans-serif",
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              margin: "0 0 10px",
            }}
          >
            {achievement.name}
          </h3>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "Outfit, sans-serif",
              margin: "0 0 28px",
              lineHeight: 1.55,
            }}
          >
            Mais um marco na sua jornada com Mounjaro
          </p>

          {/* Ember divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(255,101,0,0.45), transparent)",
              marginBottom: 24,
            }}
          />

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={onShare}
              style={{
                width: "100%",
                height: 52,
                borderRadius: 999,
                background: "linear-gradient(135deg, #ff6500 0%, #cc3f00 100%)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                fontFamily: "Outfit, sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                boxShadow:
                  "0 8px 32px rgba(255,101,0,0.45), 0 2px 8px rgba(255,101,0,0.2)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onPointerDown={(e) => {
                e.currentTarget.style.transform = "scale(0.97)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(255,101,0,0.3)";
              }}
              onPointerUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(255,101,0,0.45)";
              }}
            >
              Compartilhar conquista
            </button>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 999,
                background: "transparent",
                color: "rgba(255,255,255,0.28)",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "Outfit, sans-serif",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Continuar acompanhando
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
