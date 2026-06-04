"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type StatusPlano = "trial" | "premium" | "expirado" | "loading";

/**
 * Reads the current user's plan status from `profiles`.
 *
 *  - `trial`     → free trial still valid (see `diasRestantesTrial`)
 *  - `premium`   → active paid subscription
 *  - `expirado`  → trial ended / subscription lapsed → no access
 *  - `loading`   → still resolving
 */
export function usePlano() {
  const [status, setStatus] = useState<StatusPlano>("loading");
  const [diasRestantesTrial, setDiasRestantesTrial] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verificar() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setStatus("expirado");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("plano_ativo, trial_expira_em, assinatura_expira_em")
          .eq("id", user.id)
          .single();

        if (!profile || cancelled) return;

        const agora = new Date();

        if (profile.plano_ativo === "premium") {
          const expirou =
            profile.assinatura_expira_em &&
            new Date(profile.assinatura_expira_em) < agora;
          setStatus(expirou ? "expirado" : "premium");
        } else if (profile.plano_ativo === "trial") {
          const trialExp = new Date(profile.trial_expira_em);
          if (trialExp > agora) {
            const dias = Math.ceil(
              (trialExp.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24),
            );
            setDiasRestantesTrial(dias);
            setStatus("trial");
          } else {
            setStatus("expirado");
          }
        } else {
          setStatus("expirado");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verificar();
    return () => {
      cancelled = true;
    };
  }, []);

  const temAcesso = status === "trial" || status === "premium";
  const isPremium = status === "premium";
  const isTrial = status === "trial";
  const isExpirado = status === "expirado";

  return {
    status,
    temAcesso,
    isPremium,
    isTrial,
    isExpirado,
    diasRestantesTrial,
    loading,
  };
}
