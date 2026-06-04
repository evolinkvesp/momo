import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { RestricoesClient } from "./RestricoesClient";

export const dynamic = "force-dynamic";

export default async function RestricoesPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("restricoes_alimentares, dose_atual_mg")
    .eq("id", session.user.id)
    .single();

  return (
    <RestricoesClient
      userId={session.user.id}
      doseMg={profile?.dose_atual_mg ?? 2.5}
      initial={profile?.restricoes_alimentares ?? []}
    />
  );
}
