import { redirect } from "next/navigation";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { AdminNotificacoesClient } from "@/components/AdminNotificacoesClient";

export const dynamic = "force-dynamic";
const ADMIN_EMAIL = "evolinkbr@gmail.com";

export default async function AdminNotificacoesPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.email !== ADMIN_EMAIL) redirect("/login");

  const admin = createServiceClient();

  const { data: historico } = await admin
    .from("notification_history")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(20);

  return <AdminNotificacoesClient historico={historico || []} />;
}
