import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { EnderecoClient } from "./EnderecoClient";

export const dynamic = "force-dynamic";

export default async function EnderecoPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("endereco, cep, logradouro, numero, complemento, bairro, cidade, estado")
    .eq("id", session.user.id)
    .single();

  // Prefer the jsonb column, fall back to the flat columns for legacy rows.
  const e = (profile?.endereco as Record<string, string> | null) ?? {};

  return (
    <EnderecoClient
      userId={session.user.id}
      initial={{
        cep: e.cep ?? profile?.cep ?? "",
        logradouro: e.logradouro ?? profile?.logradouro ?? "",
        numero: e.numero ?? profile?.numero ?? "",
        complemento: e.complemento ?? profile?.complemento ?? "",
        bairro: e.bairro ?? profile?.bairro ?? "",
        cidade: e.cidade ?? profile?.cidade ?? "",
        estado: e.estado ?? profile?.estado ?? "",
      }}
    />
  );
}
