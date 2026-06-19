"use client";

import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  TrendingUp,
  UserPlus,
  UserMinus,
  AlertTriangle,
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
  Percent,
  Clock,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

const ALERT_STYLES = {
  danger:  { border: "rgba(255,101,0,0.25)",  bg: "rgba(255,101,0,0.06)",  color: "#ff7a1a",  iconBg: "rgba(255,101,0,0.12)" },
  warning: { border: "rgba(251,191,36,0.22)",  bg: "rgba(251,191,36,0.05)", color: "#fbbf24",  iconBg: "rgba(251,191,36,0.10)" },
  info:    { border: "rgba(96,165,250,0.20)",  bg: "rgba(96,165,250,0.05)", color: "#60a5fa",  iconBg: "rgba(96,165,250,0.10)" },
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-24">

      {/* ── Header ── */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="h-2 w-2 rounded-full a-pulse"
              style={{ background: "#ff6500", boxShadow: "0 0 8px rgba(255,101,0,0.8)" }}
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.3em]"
              style={{ color: "rgba(255,101,0,0.7)" }}
            >
              Sistema Operacional
            </span>
          </div>
          <h1
            className="text-[36px] font-black leading-none tracking-[-0.04em] a-text-gradient"
            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
          >
            Command Center
          </h1>
          <p className="mt-1.5 text-[13px]" style={{ color: "rgba(255,255,255,0.28)" }}>
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Clock size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
            <span className="text-[12px] font-mono font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
              {format(new Date(), "HH:mm")}
            </span>
          </div>
          <button
            className="flex h-10 items-center gap-2 px-4 rounded-xl text-white text-[12px] font-bold transition-all hover:opacity-80 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #ff7a1a, #cc4c00)",
              boxShadow: "0 4px 20px rgba(255,101,0,0.30)",
            }}
          >
            <Zap size={13} fill="white" />
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
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
                  <AlertTriangle size={15} style={{ color: s.color }} />
                </div>
                <span className="text-[11px] font-bold leading-relaxed" style={{ color: s.color }}>
                  {alert.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={item}
            className="a-card-red p-6 relative overflow-hidden group"
            style={{ transition: "box-shadow 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 32px rgba(255,101,0,0.12)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
          >
            {/* Ghost icon */}
            <div className="absolute -right-3 -bottom-3 opacity-[0.025] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
              <card.icon size={96} />
            </div>

            <div className="flex items-center justify-between mb-5">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,101,0,0.10)", border: "1px solid rgba(255,101,0,0.20)" }}
              >
                <card.icon size={17} style={{ color: "#ff6500" }} strokeWidth={2.5} />
              </div>
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: card.trendUp ? "rgba(74,222,128,0.7)" : "rgba(255,101,0,0.6)" }}
              >
                {card.trend}
              </span>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.25)" }}>
              {card.label}
            </p>
            <p
              className="text-[30px] font-black tracking-[-0.04em] mt-1 text-white leading-none"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            >
              {card.value}
            </p>
            <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.30)" }}>
              {card.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Ticket Médio + Usuários Ativos — mini row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Ticket Médio", value: formatBRL(metrics.ticketMedio), icon: TrendingUp },
          { label: "Ativos 7d",    value: metrics.activeUsers7d,           icon: Activity },
          { label: "Ativos Hoje",  value: metrics.activeUsersToday,        icon: Zap },
        ].map((mini) => (
          <motion.div
            key={mini.label}
            variants={item}
            className="a-card p-5 flex items-center gap-4"
          >
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <mini.icon size={16} style={{ color: "rgba(255,255,255,0.35)" }} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.22)" }}>
                {mini.label}
              </p>
              <p className="text-[20px] font-black text-white leading-tight tracking-tight">{mini.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Revenue Area Chart */}
        <motion.div variants={item} className="lg:col-span-8 a-card p-7">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "rgba(255,101,0,0.7)" }}>
                Financeiro
              </p>
              <h4
                className="text-[18px] font-black text-white tracking-tight mt-1"
                style={{ fontFamily: "var(--font-syne, sans-serif)" }}
              >
                Performance de Receita
              </h4>
              <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                Faturamento bruto mensal consolidado
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,101,0,0.08)", border: "1px solid rgba(255,101,0,0.18)" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: "#ff6500" }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(255,101,0,0.8)" }}>
                Real
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="emberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#ff6500" stopOpacity={0.30} />
                    <stop offset="100%" stopColor="#ff6500" stopOpacity={0.00} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  axisLine={false} tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.18)", fontSize: 10, fontWeight: 700 }}
                  dy={14}
                />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.18)", fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,101,0,0.2)", strokeWidth: 2 }}
                  contentStyle={{
                    backgroundColor: "#0f0f0f",
                    border: "1px solid rgba(255,101,0,0.20)",
                    borderRadius: "14px",
                    padding: "12px 16px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                  }}
                  itemStyle={{ color: "#ff7a1a", fontSize: "12px", fontWeight: "800" }}
                  labelStyle={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", textTransform: "uppercase", marginBottom: "4px", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ff6500"
                  strokeWidth={3}
                  fill="url(#emberGradient)"
                  activeDot={{ r: 7, fill: "#ff6500", stroke: "#080808", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Plan Distribution Donut */}
        <motion.div variants={item} className="lg:col-span-4 a-card p-7 flex flex-col">
          <div className="mb-6">
            <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "rgba(255,101,0,0.7)" }}>
              Distribuição
            </p>
            <h4
              className="text-[18px] font-black text-white tracking-tight mt-1"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            >
              Planos
            </h4>
          </div>

          <div className="relative flex-1 flex items-center justify-center" style={{ minHeight: 200 }}>
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                Total
              </span>
              <span
                className="text-[38px] font-black text-white leading-none mt-1"
                style={{ fontFamily: "var(--font-syne, sans-serif)" }}
              >
                {planDistribution.reduce((acc, curr) => acc + curr.value, 0)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  innerRadius={68} outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  animationBegin={200}
                  animationDuration={1000}
                >
                  {planDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={EMBER_SHADES[index % EMBER_SHADES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f0f0f",
                    border: "1px solid rgba(255,101,0,0.20)",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {planDistribution.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EMBER_SHADES[i % EMBER_SHADES.length] }} />
                  <span className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {p.name}
                  </span>
                </div>
                <span className="text-[14px] font-black text-white">{p.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Engagement + Customers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Engagement BarChart */}
        <motion.div variants={item} className="a-card p-7">
          <div className="flex items-center gap-3 mb-7">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,101,0,0.10)", border: "1px solid rgba(255,101,0,0.20)" }}
            >
              <Activity size={17} style={{ color: "#ff6500" }} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-white tracking-tight">Engajamento</h4>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>Usuários ativos (doses + peso)</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { label: "Hoje",   val: metrics.activeUsersToday, dim: "rgba(255,101,0,0.9)" },
              { label: "7 dias", val: metrics.activeUsers7d,    dim: "rgba(255,101,0,0.65)" },
              { label: "30 dias",val: metrics.activeUsers30d,   dim: "rgba(255,101,0,0.40)" },
            ].map((eng) => (
              <div
                key={eng.label}
                className="flex flex-col items-center justify-center py-4 rounded-2xl text-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(255,255,255,0.20)" }}>
                  {eng.label}
                </p>
                <p className="text-[26px] font-black text-white tracking-tight leading-none">{eng.val}</p>
                <div className="h-0.5 w-6 rounded-full mt-3" style={{ background: eng.dim }} />
              </div>
            ))}
          </div>

          <div className="h-[130px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthChart} barCategoryGap="35%">
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.025)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date" axisLine={false} tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.18)", fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,101,0,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#0f0f0f",
                    border: "1px solid rgba(255,101,0,0.20)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                  }}
                  itemStyle={{ color: "#ff7a1a", fontSize: "12px", fontWeight: "800" }}
                  labelStyle={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}
                />
                <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={20}>
                  {growthChart.map((_, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={index === growthChart.length - 1 ? "#ff6500" : "rgba(255,101,0,0.30)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Customers */}
        <motion.div variants={item} className="a-card overflow-hidden flex flex-col">
          <div
            className="px-7 py-5 flex justify-between items-center"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "rgba(255,101,0,0.7)" }}>
                Assinantes
              </p>
              <h4 className="text-[15px] font-black text-white tracking-tight mt-0.5">Últimos Registros</h4>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.25)" }}>
              Ver todos <ChevronRight size={12} />
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {recentCustomers.map((customer, i) => (
              <div
                key={i}
                className="px-7 py-4 flex items-center justify-between cursor-pointer group transition-colors"
                style={{ "--hover-bg": "rgba(255,255,255,0.015)" } as React.CSSProperties}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.015)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0"
                    style={{ background: "rgba(255,101,0,0.10)", color: "#ff6500", border: "1px solid rgba(255,101,0,0.18)" }}
                  >
                    {customer.nome.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white leading-tight group-hover:text-[#ff7a1a] transition-colors">
                      {customer.nome}
                    </p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {customer.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                    style={
                      customer.status === "ativo" || customer.status === "premium"
                        ? { background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.18)", color: "#4ade80" }
                        : { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.18)", color: "#fbbf24" }
                    }
                  >
                    {customer.status}
                  </span>
                  <p className="text-[10px] mt-1.5 font-bold" style={{ color: "rgba(255,255,255,0.18)" }}>
                    {format(new Date(customer.data), "dd MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-7 py-4 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.15)" }}>
              <ShieldCheck size={11} />
              Transações processadas via AbacatePay
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
