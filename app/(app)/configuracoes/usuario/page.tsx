import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UsuarioClient } from "./UsuarioClient";

export const dynamic = "force-dynamic";

export default async function UsuarioPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, data_nascimento, sexo, altura_cm")
    .eq("id", session.user.id)
    .single();

  return (
    <UsuarioClient
      userId={session.user.id}
      email={session.user.email ?? ""}
      initial={{
        nome: profile?.nome ?? "",
        data_nascimento: profile?.data_nascimento ?? "",
        sexo: profile?.sexo ?? "",
        altura_cm: profile?.altura_cm != null ? String(profile.altura_cm) : "",
      }}
    />
  );
}
