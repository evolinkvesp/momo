import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { SupplierDashboardClient } from "@/components/SupplierDashboardClient";
import { format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function FornecedorDashboardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: fornecedor } = await supabase
    .from("fornecedores")
    .select("id, nome_fantasia, razao_social, status, avaliacao_media")
    .eq("user_id", session.user.id)
    .single();

  if (!fornecedor) redirect("/fornecedor/cadastro");
  if (fornecedor.status !== "ativo") redirect("/fornecedor/aguardando");

  const now = new Date();
  const inicioMesAtual = startOfMonth(now);
  const inicioMesAnterior = startOfMonth(subMonths(now, 1));

  const [{ data: pedidos }, { count: produtosCount }] = await Promise.all([
    supabase
      .from("pedidos")
      .select("id, status, preco_total, created_at, produto:fornecedor_produtos(tipo_produto, dose_mg)")
      .eq("fornecedor_id", fornecedor.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("fornecedor_produtos")
      .select("id", { count: "exact", head: true })
      .eq("fornecedor_id", fornecedor.id)
      .eq("ativo", true),
  ]);

  const lista = pedidos || [];
  const novos = lista.filter((p) => p.status === "novo").length;

  const faturamento = lista
    .filter((p) => p.status === "entregue" && new Date(p.created_at) >= inicioMesAtual)
    .reduce((acc, p) => acc + Number(p.preco_total || 0), 0);

  const faturamentoAnterior = lista
    .filter((p) => p.status === "entregue" && new Date(p.created_at) >= inicioMesAnterior && new Date(p.created_at) < inicioMesAtual)
    .reduce((acc, p) => acc + Number(p.preco_total || 0), 0);

  const crescimento = faturamentoAnterior > 0
    ? Math.round(((faturamento - faturamentoAnterior) / faturamentoAnterior) * 100)
    : null;

  // Últimos 7 dias de faturamento para o gráfico
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const valor = lista
      .filter((p) => p.status === "entregue" && new Date(p.created_at) >= d && new Date(p.created_at) < next)
      .reduce((acc, p) => acc + Number(p.preco_total || 0), 0);
    return { name: DIAS[d.getDay()], value: valor };
  });

  const stats = {
    novos,
    total: lista.length,
    produtos: produtosCount || 0,
    faturamento,
    crescimento,
    mesAtual: format(now, "MMMM 'de' yyyy", { locale: ptBR }),
  };

  return (
    <SupplierDashboardClient
      userId={session.user.id}
      fornecedor={fornecedor}
      stats={stats}
      recentes={lista.slice(0, 5)}
      chartData={chartData}
    />
  );
}
