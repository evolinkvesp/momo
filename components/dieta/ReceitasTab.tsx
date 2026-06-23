"use client";

import { useEffect, useState } from "react";
import { Sparkles, ChevronRight, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { type FaseMounjaro } from "@/lib/diet-plans";
import { type ReceitaIA, detectarIngredientesIG } from "./types";
import { ReceitaDrawer } from "./ReceitaDrawer";
import { supabase } from "@/lib/supabase";

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
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [filtrando, setFiltrando] = useState(false);
  const [receitasFavoritas, setReceitasFavoritas] = useState<ReceitaIA[]>([]);

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

  async function carregarFavoritos(uid: string) {
    const { data, error } = await supabase
      .from('receitas_favoritas')
      .select('receita_id, receita_data')
      .eq('user_id', uid);
    if (error) {
      console.error('[ReceitasTab] carregarFavoritos:', error);
      return;
    }
    if (data) {
      setFavIds(new Set(data.map((f: { receita_id: string }) => f.receita_id)));
      setReceitasFavoritas(data.map((f: { receita_data: ReceitaIA }) => f.receita_data as ReceitaIA));
    }
  }

  async function toggleFavorito(receita: ReceitaIA) {
    if (!userId) return;
    const prevFavIds = new Set(favIds);
    const prevFavoritas = [...receitasFavoritas];
    if (favIds.has(receita.id)) {
      setFavIds(prev => { const s = new Set(prev); s.delete(receita.id); return s; });
      setReceitasFavoritas(prev => prev.filter(r => r.id !== receita.id));
      const { error } = await supabase.from('receitas_favoritas')
        .delete().eq('user_id', userId).eq('receita_id', receita.id);
      if (error) {
        setFavIds(prevFavIds);
        setReceitasFavoritas(prevFavoritas);
        toast.error('Erro ao salvar favorito. Tente novamente.');
      }
    } else {
      setFavIds(prev => new Set(Array.from(prev).concat(receita.id)));
      setReceitasFavoritas(prev => [...prev, receita]);
      const { error } = await supabase.from('receitas_favoritas').insert({
        user_id: userId,
        fase: fase,
        receita_id: receita.id,
        receita_data: receita,
      });
      if (error) {
        setFavIds(prevFavIds);
        setReceitasFavoritas(prevFavoritas);
        toast.error('Erro ao salvar favorito. Tente novamente.');
      }
    }
  }

  useEffect(() => { carregarReceitas(); }, []);

  useEffect(() => {
    if (userId) carregarFavoritos(userId);
  }, [userId]);

  function toggleRestricao(id: string) {
    setRestricoes((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  const receitasExibidas = filtrando ? receitasFavoritas : receitas;

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

      {/* Dietary restrictions + favorites filter */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Favorites pill */}
        <button
          onClick={() => setFiltrando(prev => !prev)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${
            filtrando
              ? "bg-ember/10 border-ember/30 text-ember"
              : "border-surface-border text-muted"
          }`}
        >
          <Heart size={11} fill={filtrando ? "currentColor" : "none"} />
          Favoritas
        </button>

        {!filtrando && (
          <>
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
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {receitasExibidas.length === 0 && !loading ? (
          <EmptyState
            icon={<Sparkles />}
            title={filtrando ? "Nenhuma receita favorita" : "Nenhuma receita"}
            description={filtrando ? "Marque receitas com ❤️ para salvá-las aqui." : "Gere sugestões personalizadas para seu tratamento."}
          />
        ) : (
          receitasExibidas.map((r) => (
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
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorito(r); }}
                className="p-2 text-ember transition-transform active:scale-90"
                aria-label={favIds.has(r.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart size={18} fill={favIds.has(r.id) ? "currentColor" : "none"} />
              </button>
              <ChevronRight size={18} className="text-dim" />
            </Card>
          ))
        )}
      </div>

      {selecionada && (
        <ReceitaDrawer
          receita={selecionada}
          onClose={() => setSelecionada(null)}
          favIds={favIds}
          onToggleFavorito={toggleFavorito}
        />
      )}
    </div>
  );
}
