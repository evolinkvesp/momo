import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase-server";
import { AdminPedidosClient } from "@/components/AdminPedidosClient";

export const dynamic = "force-dynamic";
const ADMIN_EMAIL = "evolinkbr@gmail.com";

export default async function AdminPedidosPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.email !== ADMIN_EMAIL) redirect("/login");

  const admin = createServiceClient();

  const { data: pedidos } = await admin
    .from("pedidos")
    .select(`
      id, codigo, status, preco_total, cancelamento_motivo,
      observacoes_paciente, observacoes_fornecedor, created_at, updated_at,
      paciente:profiles!paciente_id(nome, email),
      fornecedor:fornecedores!fornecedor_id(nome_fantasia, razao_social, email_contato),
      produto:fornecedor_produtos!produto_id(tipo_produto, dose_mg)
    `)
    .order("created_at", { ascending: false });

  return <AdminPedidosClient pedidos={pedidos || []} />;
}
