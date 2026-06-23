"use client";

import { useEffect, useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { type FaseMounjaro } from "@/lib/diet-plans";
import { type ReceitaIA, detectarIngredientesIG } from "./types";
import { ReceitaDrawer } from "./ReceitaDrawer";

const RESTRICOES_OPTIONS = [
  { id: "sem_gluten",   label: "Sem glúten"  },
  { id: "sem_lactose",  label: "Sem lactose" },
  { id: "vegetariano",  label: "Vegetariano" },
  { id: "vegano",       label: "Vegano"      },
];

interface ReceitasTabProps {
  userId: string;
  fase: FaseMounjaro;
  doseMg: number;
}

export function ReceitasTab({ userId, fase, doseMg }: ReceitasTabProps) {
  const [receitas, setReceitas] = useState<ReceitaIA[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecionada, setSelecionada] = useState<ReceitaIA | null>(null);
  const [restricoes, setRestricoes] = useState<string[]>([]);

  async function carregarReceitas(forcar = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/receitas/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fase, dose_mg: doseMg, forcar, restricoes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setReceitas((data.receitas ?? []) as ReceitaIA[]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar receitas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarReceitas(); }, []);

  function toggleRestricao(id: string) {
    setRestricoes((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-text">Receitas IA</h3>
          <p className="text-xs text-muted">Sugestões para a Fase {fase}</p>
        </div>
        <button
          onClick={() => carregarReceitas(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-ember/10 text-ember rounded-full text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" /> : <><Sparkles size={14} /> Atualizar</>}
        </button>
      </div>

      {/* Dietary restrictions */}
      <div className="flex flex-wrap gap-2 items-center">
        {RESTRICOES_OPTIONS.map((opt) => {
          const active = restricoes.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggleRestricao(opt.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                active
                  ? "bg-ember/10 border-ember/30 text-ember"
                  : "border-surface-border text-muted"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
        {restricoes.length > 0 && (
          <button
            onClick={() => carregarReceitas(true)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-ember text-white active:scale-95 transition-all"
          >
            Aplicar filtros →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {receitas.length === 0 && !loading ? (
          <EmptyState
            icon={<Sparkles />}
            title="Nenhuma receita"
            description="Gere sugestões personalizadas para seu tratamento."
          />
        ) : (
          receitas.map((r) => (
            <Card
              key={r.id}
              onClick={() => setSelecionada(r)}
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-hover transition-all"
            >
              <div className="h-14 w-14 rounded-2xl bg-ember/10 flex items-center justify-center text-3xl">
                {r.emoji}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-text leading-tight">{r.nome}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-muted uppercase">🔥 {r.calorias} kcal</span>
                  <span className="text-[10px] font-bold text-muted uppercase">💪 {r.proteinas}g Prot</span>
                </div>
                {detectarIngredientesIG(r).length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold mt-1"
                    style={{ background: 'rgba(255,101,0,0.1)', color: 'var(--color-ember)' }}>
                    ⚠️ Alto IG
                  </span>
                )}
              </div>
              <ChevronRight size={18} className="text-dim" />
            </Card>
          ))
        )}
      </div>

      {selecionada && (
        <ReceitaDrawer receita={selecionada} onClose={() => setSelecionada(null)} />
      )}
    </div>
  );
}
