"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, Building2, ShoppingBag, TrendingUp, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

const TIPO_COLOR: Record<string, string> = {
  fornecedor: "#fbbf24",
  pedido:     "#60a5fa",
  usuario:    "#4ade80",
};

const TIPO_LABEL: Record<string, string> = {
  fornecedor: "Fornecedor",
  pedido:     "Pedido",
  usuario:    "Usuário",
};

interface Metrics {
  activeUsers: number;
  premiumCount: number;
  mrr: number;
  pendingSuppliers: number;
  todayOrders: number;
  newUsersWeek: number;
}

export function AdminDashboardClient({
  metrics,
  growthData,
  revenueData,
  recentActivity,
}: {
  metrics: Metrics;
  growthData: { date: string; value: number }[];
  revenueData: { date: string; value: number }[];
  recentActivity: { tipo: string; titulo: string; subtitulo: string; data: string }[];
}) {
  const cards = [
    { label: "Usuários ativos",    value: metrics.activeUsers.toLocaleString("pt-BR"),  sub: `+${metrics.newUsersWeek} esta semana`,       icon: Users,      color: "#4ade80" },
    { label: "MRR",                value: formatBRL(metrics.mrr),                        sub: `${metrics.premiumCount} assinantes`,          icon: DollarSign, color: "#60a5fa" },
    { label: "Fornec. pendentes",  value: metrics.pendingSuppliers.toString(),            sub: "Aguardando aprovação",                         icon: Building2,  color: metrics.pendingSuppliers > 0 ? "#ef4444" : "#4ade80" },
    { label: "Pedidos hoje",       value: metrics.todayOrders.toLocaleString("pt-BR"),   sub: "Nas últimas 24h",                              icon: ShoppingBag, color: "#fbbf24" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-black text-white tracking-tight">Dashboard</h1>
        <p className="text-[rgba(255,255,255,0.35)] text-[13px] mt-0.5">Visão geral do Momo</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="a-card p-4">
            <div className="h-[30px] w-[30px] rounded-[10px] flex items-center justify-center mb-3" style={{ background: `${card.color}18` }}>
              <card.icon size={16} strokeWidth={2.5} style={{ color: card.color }} />
            </div>
            <p className="text-[10px] font-bold text-[rgba(255,255,255,0.28)] uppercase tracking-wide">{card.label}</p>
            <p className="text-[22px] font-black text-white tracking-tight mt-0.5 leading-none">{card.value}</p>
            <p className="text-[11px] text-[rgba(255,255,255,0.28)] mt-1.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="a-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-[13px] font-bold text-white">Crescimento de Usuários</h4>
              <p className="text-[11px] text-[rgba(255,255,255,0.28)]">Últimos 30 dias</p>
            </div>
            <TrendingUp size={15} className="text-[#4ade80]" />
          </div>
          <div className="h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }} dy={8} interval={4} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px", color: "#fff" }} itemStyle={{ color: "#4ade80" }} />
                <Area type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} fill="url(#growthGrad)" activeDot={{ r: 4, fill: "#4ade80", stroke: "#0d0d0d", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="a-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-[13px] font-bold text-white">Faturamento Diário</h4>
              <p className="text-[11px] text-[rgba(255,255,255,0.28)]">Últimos 30 dias</p>
            </div>
            <ArrowUpRight size={15} className="text-[#60a5fa]" />
          </div>
          <div className="h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={6}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }} dy={8} interval={4} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [formatBRL(v), "Receita"]} contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px", color: "#fff" }} itemStyle={{ color: "#60a5fa" }} />
                <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Activity */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="a-card-lg p-5">
        <h4 className="text-[13px] font-bold text-white mb-4">Atividade Recente</h4>
        {recentActivity.length === 0 ? (
          <p className="text-[rgba(255,255,255,0.2)] text-[13px] text-center py-8">Nenhuma atividade</p>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {recentActivity.map((item, i) => {
              const color = TIPO_COLOR[item.tipo] || "#ffffff";
              return (
                <div key={i} className="flex items-center gap-3 py-3">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{item.titulo}</p>
                    <p className="text-[11px] text-[rgba(255,255,255,0.35)] truncate">{item.subtitulo}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
                      {TIPO_LABEL[item.tipo] || item.tipo}
                    </span>
                    <p className="text-[10px] text-[rgba(255,255,255,0.25)] mt-0.5">
                      {format(new Date(item.data), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
