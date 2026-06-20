"use client";

import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  TrendingUp,
  UserMinus,
  AlertTriangle,
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
  Percent,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

// Ember orange palette for charts
const EMBER_SHADES = ["#ff6500", "#ff7a1a", "#cc4c00", "rgba(255,101,0,0.45)", "rgba(255,101,0,0.25)"];

interface Metrics {
  mrr: number;
  activeCustomers: number;
  newThisMonth: number;
  canceledThisMonth: number;
  churnRate: number;
  conversionRate: number;
  ticketMedio: number;
  activeUsers30d: number;
  activeUsers7d: number;
  activeUsersToday: number;
}

interface AdminDashboardClientProps {
  metrics: Metrics;
  revenueChart: { date: string; value: number }[];
  growthChart: { date: string; value: number }[];
  planDistribution: { name: string; value: number }[];
  recentCustomers: any[];
  alerts: { type: "warning" | "info" | "danger"; text: string }[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

const ALERT_STYLES = {
  danger:  { border: "border-red-500/20",    bg: "bg-red-500/10",    color: "text-red-500",    iconBg: "bg-red-500/20" },
  warning: { border: "border-amber-500/20",  bg: "bg-amber-500/10",  color: "text-amber-500",  iconBg: "bg-amber-500/20" },
  info:    { border: "border-blue-500/20",   bg: "bg-blue-500/10",   color: "text-blue-500",   iconBg: "bg-blue-500/20" },
};

export function AdminDashboardClient({
  metrics,
  revenueChart,
  growthChart,
  planDistribution,
  recentCustomers,
  alerts,
}: AdminDashboardClientProps) {

  const kpiCards = [
    {
      label: "MRR",
      value: formatBRL(metrics.mrr),
      sub: "Receita recorrente mensal",
      icon: DollarSign,
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Assinantes Ativos",
      value: metrics.activeCustomers,
      sub: "Planos premium ativos",
      icon: Users,
      trend: `+${metrics.newThisMonth} este mês`,
      trendUp: true,
    },
    {
      label: "Conversão",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      sub: "Trial → Premium",
      icon: Percent,
      trend: "acumulado",
      trendUp: metrics.conversionRate > 20,
    },
    {
      label: "Churn Rate",
      value: `${metrics.churnRate.toFixed(1)}%`,
      sub: "Cancelamentos no mês",
      icon: UserMinus,
      trend: metrics.canceledThisMonth === 0 ? "Nenhum cancelamento" : `${metrics.canceledThisMonth} cancelados`,
      trendUp: false,
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 md:space-y-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-[#ff6500] animate-pulse shadow-[0_0_8px_rgba(255,101,0,0.8)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6500]">
              Sistema Operacional
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text">
            Command Center
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-surface-border">
            <Clock size={14} className="text-text-muted" />
            <span className="text-sm font-mono font-medium text-text">
              {format(new Date(), "HH:mm")}
            </span>
          </div>
          <button className="flex h-10 items-center gap-2 px-5 rounded-full text-white text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-95 bg-gradient-to-br from-[#ff7a1a] to-[#cc4c00] shadow-[0_4px_16px_rgba(255,101,0,0.30)]">
            <Zap size={14} fill="white" />
            Exportar
          </button>
        </div>
      </motion.div>

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.map((alert, i) => {
            const s = ALERT_STYLES[alert.type];
            return (
              <motion.div
                key={i}
                variants={item}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${s.bg} ${s.border}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${s.iconBg}`}>
                  <AlertTriangle size={16} className={s.color} />
                </div>
                <span className={`text-xs font-semibold leading-relaxed ${s.color}`}>
                  {alert.text}
                </span>
                {alert.type === 'danger' && (
                  <Link href="/admin/financeiro" className={`ml-auto text-xs font-bold underline ${s.color}`}>
                    Ver pedidos
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── KPI Cards Bento ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={item}
            className="group relative overflow-hidden rounded-[24px] p-6 bg-surface border border-surface-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff6500] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none text-text">
              <card.icon size={120} />
            </div>

            <div className="flex items-center justify-between mb-6 relative">
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-[#ff6500]/10 border border-[#ff6500]/20">
                <card.icon size={18} className="text-[#ff6500]" strokeWidth={2.5} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${card.trendUp ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-[#ff6500] bg-[#ff6500]/10 border-[#ff6500]/20"}`}>
                {card.trend}
              </span>
            </div>

            <div className="relative">
              <p className="text-xs font-semibold text-text-muted mb-1">
                {card.label}
              </p>
              <p className="text-3xl font-bold tracking-tight text-text leading-none">
                {card.value}
              </p>
              <p className="text-xs text-text-dim mt-2 font-medium">
                {card.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Sub Metrics row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Ticket Médio", value: formatBRL(metrics.ticketMedio), icon: TrendingUp },
          { label: "Ativos 7d",    value: metrics.activeUsers7d,           icon: Activity },
          { label: "Ativos Hoje",  value: metrics.activeUsersToday,        icon: Zap },
        ].map((mini) => (
          <motion.div
            key={mini.label}
            variants={item}
            className="rounded-[20px] p-5 flex items-center gap-4 bg-surface border border-surface-border transition-colors hover:bg-surface-hover"
          >
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 bg-surface-mid border border-surface-border text-text-muted">
              <mini.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
                {mini.label}
              </p>
              <p className="text-xl font-bold text-text leading-tight tracking-tight">{mini.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Revenue Area Chart */}
        <motion.div variants={item} className="lg:col-span-8 rounded-[24px] p-6 sm:p-8 bg-surface border border-surface-border">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="text-lg font-bold text-text tracking-tight">
                Performance de Receita
              </h4>
              <p className="text-sm text-text-muted mt-1">
                Faturamento bruto mensal consolidado
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ff6500]/10 border border-[#ff6500]/20">
              <span className="h-2 w-2 rounded-full bg-[#ff6500]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6500]">
                Realizado
              </span>
            </div>
          </div>

          <div className="h-[240px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="emberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#ff6500" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#ff6500" stopOpacity={0.00} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-surface-border)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  axisLine={false} tickLine={false}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontWeight: 600 }}
                  dy={14}
                />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(v) => `R$${v}`}
                  width={60}
                />
                <Tooltip
                  cursor={{ stroke: "var(--color-surface-border)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-surface-border)",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    boxShadow: "var(--shadow-card)",
                  }}
                  itemStyle={{ color: "#ff6500", fontSize: "14px", fontWeight: "700" }}
                  labelStyle={{ color: "var(--color-text-muted)", fontSize: "11px", textTransform: "uppercase", marginBottom: "4px", fontWeight: "600" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ff6500"
                  strokeWidth={3}
                  fill="url(#emberGradient)"
                  activeDot={{ r: 6, fill: "#ff6500", stroke: "var(--color-surface)", strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Plan Distribution Donut */}
        <motion.div variants={item} className="lg:col-span-4 rounded-[24px] p-6 sm:p-8 bg-surface border border-surface-border flex flex-col">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-text tracking-tight">
              Planos
            </h4>
            <p className="text-sm text-text-muted mt-1">
              Distribuição de assinaturas ativas
            </p>
          </div>

          <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Total
              </span>
              <span className="text-4xl font-bold text-text mt-1">
                {planDistribution.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  innerRadius={74} outerRadius={96}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  animationBegin={200}
                  animationDuration={1000}
                  cornerRadius={6}
                >
                  {planDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={EMBER_SHADES[index % EMBER_SHADES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-surface-border)",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-card)",
                  }}
                  itemStyle={{ color: "var(--color-text)", fontWeight: "600" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5 mt-6">
            {planDistribution.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-surface-mid border border-surface-border">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EMBER_SHADES[i % EMBER_SHADES.length] }} />
                  <span className="text-sm font-semibold text-text-muted">
                    {p.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-text">{p.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Engagement + Customers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Engagement BarChart */}
        <motion.div variants={item} className="rounded-[24px] p-6 sm:p-8 bg-surface border border-surface-border">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#ff6500]/10 border border-[#ff6500]/20 text-[#ff6500]">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-text tracking-tight">Engajamento</h4>
              <p className="text-sm text-text-muted">Usuários ativos na plataforma (inserções)</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Hoje",   val: metrics.activeUsersToday, dim: "bg-[#ff6500]" },
              { label: "7 dias", val: metrics.activeUsers7d,    dim: "bg-[#ff6500]/60" },
              { label: "30 dias",val: metrics.activeUsers30d,   dim: "bg-[#ff6500]/30" },
            ].map((eng) => (
              <div key={eng.label} className="flex flex-col items-center justify-center py-5 rounded-2xl text-center bg-surface-mid border border-surface-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                  {eng.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-text tracking-tight leading-none">{eng.val}</p>
                <div className={`h-1 w-6 rounded-full mt-3 ${eng.dim}`} />
              </div>
            ))}
          </div>

          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthChart} barCategoryGap="30%">
                <CartesianGrid vertical={false} stroke="var(--color-surface-border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date" axisLine={false} tickLine={false}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-surface-mid)" }}
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-surface-border)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    boxShadow: "var(--shadow-card)",
                  }}
                  itemStyle={{ color: "#ff6500", fontSize: "14px", fontWeight: "700" }}
                  labelStyle={{ color: "var(--color-text-muted)", fontSize: "11px", fontWeight: "600" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                  {growthChart.map((_, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={index === growthChart.length - 1 ? "#ff6500" : "rgba(255,101,0,0.25)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Customers */}
        <motion.div variants={item} className="rounded-[24px] bg-surface border border-surface-border flex flex-col overflow-hidden">
          <div className="px-6 md:px-8 py-6 flex justify-between items-center border-b border-surface-border">
            <div>
              <h4 className="text-lg font-bold text-text tracking-tight">Últimos Assinantes</h4>
              <p className="text-sm text-text-muted mt-0.5">Registros recentes na plataforma</p>
            </div>
            <Link href="/admin/usuarios" className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-[#ff6500] transition-colors">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-surface-border flex-1">
            {recentCustomers.map((customer, i) => (
              <div key={i} className="px-6 md:px-8 py-4 flex items-center justify-between group hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-bold bg-[#ff6500]/10 text-[#ff6500] border border-[#ff6500]/20 shrink-0">
                    {customer.nome.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text leading-tight group-hover:text-[#ff6500] transition-colors">
                      {customer.nome}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {customer.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        customer.status === "ativo" || customer.status === "premium"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      }`}>
                      {customer.status}
                    </span>
                    <p className="text-[11px] mt-2 font-medium text-text-dim">
                      {format(new Date(customer.data), "dd MMM, yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <Link 
                    href={`/admin/usuarios?search=${encodeURIComponent(customer.email)}`}
                    className="h-8 w-8 rounded-full bg-surface-mid border border-surface-border flex items-center justify-center text-text-muted hover:text-white hover:bg-[#ff6500] hover:border-[#ff6500] transition-all opacity-0 group-hover:opacity-100"
                    title="Ver perfil do usuário"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 md:px-8 py-5 border-t border-surface-border bg-surface-mid mt-auto">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-dim">
              <ShieldCheck size={14} />
              Transações processadas via Stripe
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
