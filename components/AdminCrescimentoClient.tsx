"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, GitBranch, ShieldCheck, ShieldAlert, ShieldX,
  Users, Award, AlertTriangle, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

const EMBER = "#ff6500";
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number,number,number,number] } } };

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-surface-border)",
    borderRadius: "16px",
    padding: "12px 16px",
  },
  itemStyle: { color: EMBER, fontSize: "13px", fontWeight: "700" },
  labelStyle: { color: "var(--color-text-muted)", fontSize: "11px", fontWeight: "600" },
};

interface Props {
  funnel: { label: string; value: number; pct: number }[];
  referralStats: {
    totalInvites: number;
    usersWhoInvited: number;
    kFactor: number;
    gateRate: number;
    topReferrers: { id: string; nome: string; email: string; count: number }[];
  };
  gateStats: {
    cleared: number;
    atRisk: number;
    blocked: number;
    atRiskUsers: { id: string; nome: string; email: string; inviteCount: number; daysOld: number }[];
  };
  cohort: { label: string; novos: number; ativos: number }[];
}

export function AdminCrescimentoClient({ funnel, referralStats, gateStats, cohort }: Props) {
  const totalGate = gateStats.cleared + gateStats.atRisk + gateStats.blocked;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-[#ff6500] animate-pulse shadow-[0_0_8px_rgba(255,101,0,0.8)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6500]">Análise de Crescimento</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text">Crescimento</h1>
        <p className="mt-1 text-sm text-text-muted">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </motion.div>

      {/* ── Funil de Ativação ── */}
      <motion.div variants={item} className="rounded-[24px] p-6 sm:p-8 bg-surface border border-surface-border">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#ff6500]/10 border border-[#ff6500]/20 text-[#ff6500]">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">Funil de Ativação</h2>
            <p className="text-sm text-text-muted">Onde os usuários chegam — e onde desistem</p>
          </div>
        </div>

        <div className="space-y-3">
          {funnel.map((step, i) => (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white shrink-0"
                    style={{ background: i === 0 ? EMBER : "var(--color-surface-mid)", border: i !== 0 ? "1px solid var(--color-surface-border)" : "none", color: i !== 0 ? "var(--color-text-muted)" : "white" }}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-text">{step.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-text">{step.value.toLocaleString("pt-BR")}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border min-w-[52px] text-center ${
                    step.pct >= 60 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : step.pct >= 30 ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    : "bg-[#ff6500]/10 border-[#ff6500]/20 text-[#ff6500]"
                  }`}>
                    {step.pct}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-mid overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${step.pct}%`, background: i === 0 ? EMBER : step.pct >= 60 ? "#22c55e" : step.pct >= 30 ? "#f59e0b" : EMBER }}
                />
              </div>
              {i < funnel.length - 1 && funnel[i + 1].pct < funnel[i].pct && (
                <p className="text-[11px] text-text-dim mt-1 ml-9">
                  ↘ {funnel[i].pct - funnel[i + 1].pct}pp de queda para a próxima etapa
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Referral Program ── */}
      <motion.div variants={item} className="rounded-[24px] p-6 sm:p-8 bg-surface border border-surface-border">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#ff6500]/10 border border-[#ff6500]/20 text-[#ff6500]">
            <GitBranch size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">Programa de Referral</h2>
            <p className="text-sm text-text-muted">Tração viral — quanto cada usuário traz de volta</p>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Convites",      value: referralStats.totalInvites },
            { label: "Usuários Convidaram", value: referralStats.usersWhoInvited },
            {
              label: "K-Factor",
              value: referralStats.kFactor.toFixed(2),
              note: referralStats.kFactor >= 1 ? "viral ✓" : referralStats.kFactor >= 0.3 ? "crescendo" : "baixo",
              noteColor: referralStats.kFactor >= 1 ? "text-emerald-500" : referralStats.kFactor >= 0.3 ? "text-amber-500" : "text-[#ff6500]",
            },
            {
              label: "Taxa Gate (≥3)",
              value: `${referralStats.gateRate}%`,
              note: referralStats.gateRate >= 50 ? "bom" : "melhorar",
              noteColor: referralStats.gateRate >= 50 ? "text-emerald-500" : "text-amber-500",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 bg-surface-mid border border-surface-border text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">{s.label}</p>
              <p className="text-2xl font-bold text-text tracking-tight">{s.value}</p>
              {s.note && <p className={`text-[10px] font-bold mt-1 ${s.noteColor}`}>{s.note}</p>}
            </div>
          ))}
        </div>

        {/* Top referrers */}
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-3">Top Convidadores</h3>
        {referralStats.topReferrers.length === 0 ? (
          <div className="rounded-2xl p-8 bg-surface-mid border border-surface-border text-center">
            <p className="text-sm text-text-dim">Nenhum convite enviado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border rounded-2xl overflow-hidden border border-surface-border">
            {referralStats.topReferrers.map((ref, i) => (
              <div key={ref.id} className="flex items-center justify-between px-5 py-3.5 bg-surface hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-text-dim w-5 text-right shrink-0">#{i + 1}</span>
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center text-sm font-bold bg-[#ff6500]/10 text-[#ff6500] border border-[#ff6500]/20 shrink-0">
                    {ref.nome.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text leading-tight">{ref.nome}</p>
                    <p className="text-xs text-text-muted">{ref.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {i === 0 && <Award size={14} className="text-amber-400" />}
                  <span className="text-sm font-black text-text">{ref.count}</span>
                  <span className="text-xs text-text-dim">convites</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Gate Status ── */}
      <motion.div variants={item} className="rounded-[24px] p-6 sm:p-8 bg-surface border border-surface-border">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#ff6500]/10 border border-[#ff6500]/20 text-[#ff6500]">
            <ShieldAlert size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">Gate de Convites</h2>
            <p className="text-sm text-text-muted">Usuários com +7 dias — quem precisa de atenção</p>
          </div>
        </div>

        {/* Gate 3 cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Liberados",   value: gateStats.cleared, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", note: "≥ 3 convites" },
            { label: "Em Risco",    value: gateStats.atRisk,  icon: ShieldAlert,  color: "text-amber-500",  bg: "bg-amber-500/10",   border: "border-amber-500/20",  note: "1–2 convites" },
            { label: "Bloqueados",  value: gateStats.blocked, icon: ShieldX,      color: "text-red-500",    bg: "bg-red-500/10",     border: "border-red-500/20",    note: "0 convites" },
          ].map((g) => (
            <div key={g.label} className={`rounded-2xl p-5 border ${g.bg} ${g.border} text-center`}>
              <g.icon size={22} className={`mx-auto mb-3 ${g.color}`} />
              <p className="text-2xl font-black text-text">{g.value}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${g.color}`}>{g.label}</p>
              <p className="text-[10px] text-text-dim mt-0.5">{g.note}</p>
            </div>
          ))}
        </div>

        {/* At-risk users */}
        {gateStats.atRiskUsers.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-500" />
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">
                Em Risco — ação recomendada
              </h3>
            </div>
            <div className="divide-y divide-surface-border rounded-2xl overflow-hidden border border-amber-500/20">
              {gateStats.atRiskUsers.slice(0, 8).map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3.5 bg-surface hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center text-sm font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                      {u.nome.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text leading-tight">{u.nome}</p>
                      <p className="text-xs text-text-muted">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-xs font-bold text-amber-500">{u.inviteCount}/3 convites</p>
                      <p className="text-[11px] text-text-dim">{u.daysOld} dias de conta</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {gateStats.atRiskUsers.length > 8 && (
              <p className="text-xs text-text-dim text-center mt-3">
                + {gateStats.atRiskUsers.length - 8} outros em risco
              </p>
            )}
          </>
        )}
      </motion.div>

      {/* ── Coorte Semanal ── */}
      <motion.div variants={item} className="rounded-[24px] p-6 sm:p-8 bg-surface border border-surface-border">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#ff6500]/10 border border-[#ff6500]/20 text-[#ff6500]">
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">Coorte Semanal</h2>
            <p className="text-sm text-text-muted">Novos usuários por semana vs. ainda ativos (30d)</p>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cohort} barCategoryGap="25%" barGap={4}>
              <CartesianGrid vertical={false} stroke="var(--color-surface-border)" strokeDasharray="4 4" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontWeight: 600 }} width={30} />
              <Tooltip cursor={{ fill: "var(--color-surface-mid)" }} contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} labelStyle={tooltipStyle.labelStyle} />
              <Bar dataKey="novos" name="Novos" radius={[5, 5, 0, 0]} barSize={18}>
                {cohort.map((_, i) => (
                  <Cell key={i} fill={i === cohort.length - 1 ? EMBER : "rgba(255,101,0,0.35)"} />
                ))}
              </Bar>
              <Bar dataKey="ativos" name="Ainda Ativos" radius={[5, 5, 0, 0]} barSize={18} fill="#22c55e" fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ background: EMBER }} />
            <span className="text-xs font-semibold text-text-muted">Novos cadastros</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-emerald-500" />
            <span className="text-xs font-semibold text-text-muted">Ainda ativos (30d)</span>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
