"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  UserPlus, 
  UserMinus, 
  Percent, 
  Target,
  AlertCircle,
  Clock,
  Activity,
  CheckCircle2
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

const COLORS = ["#1c4d2e", "#4ade80", "#94a3b8", "#fbbf24", "#ef4444"];

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
  alerts: { type: 'warning' | 'info' | 'danger'; text: string }[];
}

export function AdminDashboardClient({
  metrics,
  revenueChart,
  growthChart,
  planDistribution,
  recentCustomers,
  alerts,
}: AdminDashboardClientProps) {
  
  const cards = [
    { label: "MRR", value: formatBRL(metrics.mrr), sub: "Receita Recorrente", icon: DollarSign, color: "#4ade80" },
    { label: "Clientes Ativos", value: metrics.activeCustomers, sub: "Assinaturas Premium", icon: Users, color: "#60a5fa" },
    { label: "Novos (Mês)", value: metrics.newThisMonth, sub: "Cadastros recentes", icon: UserPlus, color: "#1c4d2e" },
    { label: "Cancelados (Mês)", value: metrics.canceledThisMonth, sub: "Churn absoluto", icon: UserMinus, color: "#ef4444" },
    { label: "Taxa de Churn", value: `${metrics.churnRate.toFixed(1)}%`, sub: "vs. base inicial", icon: Percent, color: "#f87171" },
    { label: "Conversão", value: `${metrics.conversionRate.toFixed(1)}%`, sub: "Trial para Premium", icon: Target, color: "#fbbf24" },
    { label: "Ticket Médio", value: formatBRL(metrics.ticketMedio), sub: "Por assinante", icon: TrendingUp, color: "#a78bfa" },
    { label: "Ativos (30d)", value: metrics.activeUsers30d, sub: "Engajamento real", icon: Activity, color: "#2dd4bf" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-black text-white tracking-tight leading-none">Métricas SaaS</h1>
          <p className="text-[rgba(255,255,255,0.35)] text-[13px] mt-2 font-medium italic">Dados reais extraídos diretamente do banco</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-[rgba(255,255,255,0.28)] uppercase tracking-widest">Última atualização</p>
          <p className="text-[12px] text-white font-bold">{format(new Date(), "HH:mm 'de' dd/MM/yy")}</p>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.map((alert, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                alert.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}
            >
              <AlertCircle size={16} className="shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wide">{alert.text}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div 
            key={card.label} 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.04 }} 
            className="a-card p-4 group hover:bg-[rgba(255,255,255,0.03)] transition-all cursor-default"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="h-[32px] w-[32px] rounded-[10px] flex items-center justify-center" style={{ background: `${card.color}18` }}>
                <card.icon size={16} strokeWidth={2.5} style={{ color: card.color }} />
              </div>
              <ArrowUpRight size={14} className="text-[rgba(255,255,255,0.1)] group-hover:text-[rgba(255,255,255,0.3)] transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-[rgba(255,255,255,0.28)] uppercase tracking-wide">{card.label}</p>
            <p className="text-[24px] font-black text-white tracking-tighter mt-1 leading-none">{card.value || "0"}</p>
            <p className="text-[11px] font-medium text-[rgba(255,255,255,0.28)] mt-2">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico de Receita */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 a-card p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="text-[14px] font-bold text-white">Evolução de Receita</h4>
              <p className="text-[11px] text-[rgba(255,255,255,0.28)] font-medium">Faturamento mensal consolidado (Premium)</p>
            </div>
            <div className="bg-[#1c4d2e]/20 text-[#4ade80] px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Recorrente</div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600 }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: "#4ade80", fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                  formatter={(v: any) => [formatBRL(v), "Receita"]}
                />
                <Area type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={3} fill="url(#revGrad)" activeDot={{ r: 6, fill: "#4ade80", stroke: "#0d0d0d", strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribuição de Planos */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="a-card p-6 flex flex-col">
          <h4 className="text-[14px] font-bold text-white mb-1">Distribuição de Planos</h4>
          <p className="text-[11px] text-[rgba(255,255,255,0.28)] font-medium mb-6">Base total de usuários</p>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {planDistribution.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[11px] font-bold text-[rgba(255,255,255,0.4)]">{p.name}</span>
                </div>
                <span className="text-[11px] font-black text-white">{p.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Uso do Sistema */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="a-card p-6">
          <h4 className="text-[14px] font-bold text-white mb-6 flex items-center gap-2">
            <Activity size={16} className="text-[#2dd4bf]" />
            Atividade de Uso
          </h4>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <p className="text-[10px] font-bold text-[rgba(255,255,255,0.28)] uppercase tracking-wide">Hoje</p>
              <p className="text-[20px] font-black text-white mt-1">{metrics.activeUsersToday}</p>
            </div>
            <div className="text-center border-x border-[rgba(255,255,255,0.05)]">
              <p className="text-[10px] font-bold text-[rgba(255,255,255,0.28)] uppercase tracking-wide">7 dias</p>
              <p className="text-[20px] font-black text-white mt-1">{metrics.activeUsers7d}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-[rgba(255,255,255,0.28)] uppercase tracking-wide">30 dias</p>
              <p className="text-[20px] font-black text-white mt-1">{metrics.activeUsers30d}</p>
            </div>
          </div>
          
          <h5 className="text-[11px] font-black text-[rgba(255,255,255,0.2)] uppercase tracking-[0.2em] mb-4">Crescimento de Cadastros</h5>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthChart}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}
                  itemStyle={{ color: "#1c4d2e", fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#1c4d2e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Tabela de Clientes Recentes */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="a-card p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[14px] font-bold text-white">Clientes Recentes</h4>
            <button className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest hover:opacity-80">Ver Todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[rgba(255,255,255,0.05)]">
                  <th className="pb-3 text-[10px] font-black text-[rgba(255,255,255,0.2)] uppercase tracking-wider">Cliente</th>
                  <th className="pb-3 text-[10px] font-black text-[rgba(255,255,255,0.2)] uppercase tracking-wider">Plano</th>
                  <th className="pb-3 text-[10px] font-black text-[rgba(255,255,255,0.2)] uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                {recentCustomers.map((customer, i) => (
                  <tr key={i} className="group">
                    <td className="py-3">
                      <p className="text-[12px] font-bold text-white group-hover:text-[#4ade80] transition-colors">{customer.nome}</p>
                      <p className="text-[10px] text-[rgba(255,255,255,0.3)]">{customer.email}</p>
                    </td>
                    <td className="py-3">
                      <span className="text-[11px] font-bold text-[rgba(255,255,255,0.5)] capitalize">{customer.plano}</span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${customer.status === 'ativo' ? 'bg-[#4ade80]' : 'bg-amber-400'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${customer.status === 'ativo' ? 'text-[#4ade80]' : 'text-amber-400'}`}>
                          {customer.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-[rgba(255,255,255,0.2)] mt-0.5">{format(new Date(customer.data), "dd MMM", { locale: ptBR })}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
