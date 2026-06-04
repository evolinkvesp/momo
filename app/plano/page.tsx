import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { PlanoClient } from "./PlanoClient";

// Reads the user's plan per request.
export const dynamic = "force-dynamic";

export default async function PlanoPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plano_ativo, trial_expira_em, assinatura_expira_em")
    .eq("id", session.user.id)
    .single();

  const agora = Date.now();
  let status: "trial" | "premium" | "expirado" = "expirado";
  let diasRestantesTrial = 0;

  if (profile?.plano_ativo === "premium") {
    const expirou =
      profile.assinatura_expira_em &&
      new Date(profile.assinatura_expira_em).getTime() < agora;
    status = expirou ? "expirado" : "premium";
  } else if (profile?.plano_ativo === "trial" && profile.trial_expira_em) {
    const trialExp = new Date(profile.trial_expira_em).getTime();
    if (trialExp > agora) {
      status = "trial";
      diasRestantesTrial = Math.ceil((trialExp - agora) / (1000 * 60 * 60 * 24));
    }
  }

  return (
    <PlanoClient
      email={session.user.email ?? ""}
      status={status}
      diasRestantesTrial={diasRestantesTrial}
      assinaturaExpiraEm={profile?.assinatura_expira_em ?? null}
    />
  );
}
