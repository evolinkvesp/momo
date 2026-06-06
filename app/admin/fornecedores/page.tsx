import { redirect } from "next/navigation";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { AdminFornecedoresClient } from "@/components/AdminFornecedoresClient";

export const dynamic = "force-dynamic";
const ADMIN_EMAIL = "evolinkbr@gmail.com";

export default async function AdminFornecedoresPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.email !== ADMIN_EMAIL) redirect("/login");

  const admin = createServiceClient();

  const { data: fornecedores } = await admin
    .from("fornecedores")
    .select(`
      id, nome_fantasia, razao_social, cnpj, email_contato, telefone, whatsapp,
      tipo, endereco_cidade, endereco_estado, raio_entrega_km,
      status, avaliacao_media, total_pedidos, created_at,
      fornecedor_produtos(id, tipo_produto, dose_mg, preco, preco_promocional, estoque_disponivel, ativo)
    `)
    .order("created_at", { ascending: false });

  return <AdminFornecedoresClient fornecedores={fornecedores || []} />;
}
