"use client";

export type StatusPlano = "trial" | "premium" | "expirado" | "loading";

/**
 * Acesso ao Momo agora é gratuito para todos os pacientes.
 * Este hook sempre retorna acesso liberado para não quebrar os consumidores existentes.
 */
export function usePlano() {
  return {
    status: "premium" as StatusPlano,
    temAcesso: true,
    isPremium: true,
    isTrial: false,
    isExpirado: false,
    diasRestantesTrial: 0,
    loading: false,
  };
}
