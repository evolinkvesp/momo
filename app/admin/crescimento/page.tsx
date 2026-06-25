import { redirect } from "next/navigation";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { AdminCrescimentoClient } from "@/components/AdminCrescimentoClient";
import {
  format,
  subDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export default async function AdminCrescimentoPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) redirect("/login");

  const admin = createServiceClient();
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sevenDaysAgo  = subDays(now, 7);

  const [
    { data: rawProfiles },
    { data: rawInvites },
    { data: rawDoses },
    { data: rawMedicoes },
    { data: rawPedidos },
  ] = await Promise.all([
    admin.from("profiles").select("id, created_at, nome, email"),
    admin.from("referral_invites").select("referrer_id, invited_id, criado_em"),
    admin.from("doses").select("user_id, data_aplicacao").limit(5000),
    admin.from("medicoes_saude").select("user_id, data_medicao").limit(5000),
    admin.from("pedidos").select("paciente_id, created_at").limit(5000),
  ]);

  const profiles  = rawProfiles  || [];
  const invites   = rawInvites   || [];
  const doses     = rawDoses     || [];
  const medicoes  = rawMedicoes  || [];
  const pedidos   = rawPedidos   || [];

  // ── Activation funnel ──
  const totalUsers   = profiles.length;
  const doseUsers    = new Set(doses.map(d => d.user_id)).size;
  const healthUsers  = new Set(medicoes.map(m => m.user_id)).size;
  const orderUsers   = new Set(pedidos.map(p => p.paciente_id)).size;

  const funnel = [
    { label: "Cadastros",          value: totalUsers,  pct: 100 },
    { label: "1ª Dose Aplicada",   value: doseUsers,   pct: totalUsers > 0 ? Math.round((doseUsers  / totalUsers) * 100) : 0 },
    { label: "1ª Med. de Saúde",   value: healthUsers, pct: totalUsers > 0 ? Math.round((healthUsers / totalUsers) * 100) : 0 },
    { label: "1º Pedido",          value: orderUsers,  pct: totalUsers > 0 ? Math.round((orderUsers  / totalUsers) * 100) : 0 },
  ];

  // ── Referral metrics ──
  const inviteCountByUser = new Map<string, number>();
  for (const inv of invites) {
    inviteCountByUser.set(inv.referrer_id, (inviteCountByUser.get(inv.referrer_id) || 0) + 1);
  }

  const usersWhoInvited = inviteCountByUser.size;
  const kFactor = totalUsers > 0 ? +(invites.length / totalUsers).toFixed(2) : 0;
  const gateRate = profiles.filter(p => parseISO(p.created_at) < sevenDaysAgo).length > 0
    ? Math.round((profiles.filter(p => parseISO(p.created_at) < sevenDaysAgo && (inviteCountByUser.get(p.id) || 0) >= 3).length
      / profiles.filter(p => parseISO(p.created_at) < sevenDaysAgo).length) * 100)
    : 0;

  const topReferrers = Array.from(inviteCountByUser.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId, count]) => {
      const profile = profiles.find(p => p.id === userId);
      return { id: userId, nome: profile?.nome || "Desconhecido", email: profile?.email || "", count };
    });

  // ── Gate status ──
  const oldProfiles = profiles.filter(p => parseISO(p.created_at) < sevenDaysAgo);
  const gateStats = {
    cleared: oldProfiles.filter(p => (inviteCountByUser.get(p.id) || 0) >= 3),
    atRisk:  oldProfiles.filter(p => { const c = inviteCountByUser.get(p.id) || 0; return c >= 1 && c < 3; }),
    blocked: oldProfiles.filter(p => (inviteCountByUser.get(p.id) || 0) === 0),
  };

  const atRiskUsers = gateStats.atRisk.map(p => ({
    id: p.id,
    nome: p.nome || "Sem nome",
    email: p.email || "",
    inviteCount: inviteCountByUser.get(p.id) || 0,
    daysOld: Math.floor((now.getTime() - parseISO(p.created_at).getTime()) / (1000 * 60 * 60 * 24)),
  }));

  // ── Weekly cohort (last 8 weeks) ──
  const activeUserIds30d = new Set([
    ...medicoes.filter(m => parseISO(m.data_medicao) >= thirtyDaysAgo).map(m => m.user_id),
    ...doses.filter(d => parseISO(d.data_aplicacao) >= thirtyDaysAgo).map(d => d.user_id),
  ]);

  const cohort = Array.from({ length: 8 }, (_, i) => {
    const start = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    const end   = endOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    const weekUsers = profiles.filter(p => {
      const d = parseISO(p.created_at);
      return d >= start && d <= end;
    });
    const active = weekUsers.filter(u => activeUserIds30d.has(u.id)).length;
    return {
      label: format(start, "dd/MM", { locale: ptBR }),
      novos: weekUsers.length,
      ativos: active,
    };
  });

  return (
    <AdminCrescimentoClient
      funnel={funnel}
      referralStats={{
        totalInvites: invites.length,
        usersWhoInvited,
        kFactor,
        gateRate,
        topReferrers,
      }}
      gateStats={{
        cleared: gateStats.cleared.length,
        atRisk: gateStats.atRisk.length,
        blocked: gateStats.blocked.length,
        atRiskUsers,
      }}
      cohort={cohort}
    />
  );
}
