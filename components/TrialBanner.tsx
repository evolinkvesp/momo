"use client";

import { usePlano } from "@/hooks/usePlano";

export function TrialBanner() {
  const { isTrial, diasRestantesTrial, isExpirado, loading } = usePlano();

  if (loading) return null;
  if (!isTrial && !isExpirado) return null;

  const urgente = diasRestantesTrial <= 2;
  const bg = isExpirado ? "#ef4444" : urgente ? "#f59e0b" : "#ff6500";

  return (
    <div
      style={{
        background: bg,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
        {isExpirado
          ? "Seu acesso expirou. Assine para continuar."
          : urgente
            ? `Trial expira em ${diasRestantesTrial} dia(s)!`
            : `Trial gratuito — ${diasRestantesTrial} dias restantes`}
      </span>
      <a
        href="/plano"
        style={{
          background: "rgba(0,0,0,0.25)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          padding: "6px 14px",
          borderRadius: 999,
          textDecoration: "none",
          whiteSpace: "nowrap",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        {isExpirado ? "Assinar agora" : "Ver planos"}
      </a>
    </div>
  );
}
