import { redirect } from "next/navigation";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "evolinkbr@gmail.com";

function buildGrowthData(records: { created_at: string }[], days = 30) {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "dd/MM");
    map.set(d, 0);
  }
  for (const r of records) {
    const d = format(new Date(r.created_at), "dd/MM");
    if (map.has(d)) map.set(d, (map.get(d) || 0) + 1);
  }
  return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
}

function buildRevenueData(records: { criado_em: string }[], days = 30) {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "dd/MM");
    map.set(d, 0);
  }
  for (const r of records) {
    const d = format(new Date(r.criado_em), "dd/MM");
    if (map.has(d)) map.set(d, parseFloat(((map.get(d) || 0) + 29.9).toFixed(2)));
  }
  return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
}

export default async function AdminDashboardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.email !== ADMIN_EMAIL) redirect("/login");

  const admin = createServiceClient();
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  const sevenDaysAgo = subDays(new Date(), 7).toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: activeUsers },
    { count: premiumCount },
    { count: newUsersWeek },
    { count: pendingSuppliers },
    { count: todayOrders },
    { data: recentProfiles },
    { data: recentAssinaturas },
    { data: recentFornecedores },
    { data: recentPedidos },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).in("plano_ativo", ["premium", "trial"]),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("plano_ativo", "premium"),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    admin.from("fornecedores").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    admin.from("pedidos").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    admin.from("profiles").select("created_at").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }),
    admin.from("assinaturas").select("criado_em").eq("status", "ativa").gte("criado_em", thirtyDaysAgo),
    admin.from("fornecedores").select("id, nome_fantasia, razao_social, status, created_at").order("created_at", { ascending: false }).limit(6),
    admin.from("pedidos").select("id, codigo, status, created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  const growthData = buildGrowthData(recentProfiles || []);
  const revenueData = buildRevenueData(recentAssinaturas || []);

  const activity: { tipo: string; titulo: string; subtitulo: string; data: string }[] = [];
  for (const f of (recentFornecedores || [])) {
    activity.push({
      tipo: "fornecedor",
      titulo: f.status === "pendente" ? "Fornecedor pendente" : "Novo fornecedor",
      subtitulo: f.nome_fantasia || f.razao_social,
      data: f.created_at,
    });
  }
  for (const p of (recentPedidos || [])) {
    activity.push({
      tipo: "pedido",
      titulo: `Pedido ${p.status}`,
      subtitulo: p.codigo,
      data: p.created_at,
    });
  }
  activity.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <AdminDashboardClient
      metrics={{
        activeUsers: activeUsers || 0,
        premiumCount: premiumCount || 0,
        mrr: (premiumCount || 0) * 29.9,
        pendingSuppliers: pendingSuppliers || 0,
        todayOrders: todayOrders || 0,
        newUsersWeek: newUsersWeek || 0,
      }}
      growthData={growthData}
      revenueData={revenueData}
      recentActivity={activity.slice(0, 10)}
    />
  );
}
