"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Utensils,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card } from "@/components/Card";
import { MacroRing } from "@/components/MacroRing";
import { EmptyState } from "@/components/EmptyState";
import { usePlano } from "@/hooks/usePlano";
import { BlurPaywall } from "@/components/BlurPaywall";
import {
  PLANOS,
  faseFromDose,
  type FaseMounjaro,
} from "@/lib/diet-plans";

type Tab = "Dashboard" | "Receitas";

interface Refeicao {
  id: string;
  nome: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  criado_em: string;
}

export function DietaClient({
  userId,
  doseMg,
  refeicoesIniciais,
}: {
  userId: string;
  doseMg: number;
  refeicoesIniciais: any[];
}) {
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>(
    refeicoesIniciais.map((r: any) => ({
      id: r.id,
      nome: r.descricao || r.nome,
      calorias: r.calorias_estimadas || r.calorias || 0,
      proteinas: r.proteinas_g || r.proteinas || 0,
      carboidratos: r.carboidratos_g || r.carboidratos || 0,
      gorduras: r.gorduras_g || r.gorduras || 0,
      criado_em: r.data || r.criado_em,
    }))
  );
  const [registering, setRegistering] = useState(false);
  const [showPlanoDetalhamento, setShowPlanoDetalhamento] = useState(false);

  const { isExpirado } = usePlano();
  const fase = faseFromDose(doseMg);
  const plano = PLANOS[fase];

  const totaisHoje = refeicoes.reduce(
    (acc, curr) => ({
      calorias: acc.calorias + curr.calorias,
      proteinas: acc.proteinas + curr.proteinas,
      carboidratos: acc.carboidratos + curr.carboidratos,
      gorduras: acc.gorduras + curr.gorduras,
    }),
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  const progressoPct = Math.min(
    100,
    Math.round((totaisHoje.calorias / (plano?.caloriasMax || 2000)) * 100)
  );

  async function removerRefeicao(id: string) {
    const { error } = await supabase.from("refeicoes_registradas").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover.");
    } else {
      setRefeicoes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Removida.");
    }
  }

  return (
    <div className="space-y-6 pb-32">
      <PageHeader title="Minha Dieta" showBack={false} />

      <BlurPaywall ativo={isExpirado} mensagem="Acompanhe sua dieta no plano Premium">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-mid rounded-2xl">
          {(["Dashboard", "Receitas"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === t ? "bg-ember text-white shadow-ember" : "text-muted"
              }`}
            >
              {t === "Dashboard" ? "Resumo" : "Receitas"}
            </button>
          ))}
        </div>

        <div className="animate-fade-up mt-6">
          {tab === "Dashboard" ? (
            <div className="space-y-6">
              {/* Macro Dashboard */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                      Fase {fase}
                    </p>
                    <h2 className="text-xl font-black text-text">{plano?.nome}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                      Calorias
                    </p>
                    <p className="text-lg font-black text-text">
                      {totaisHoje.calorias}{" "}
                      <span className="text-sm font-medium text-dim">
                        / {plano?.caloriasMax} kcal
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-around items-center gap-4 py-2">
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-full border-4 border-ember/20 flex items-center justify-center text-[11px] font-black text-ember">
                      {totaisHoje.proteinas}g
                    </div>
                    <p className="text-[10px] font-bold uppercase text-muted mt-2">Prot</p>
                  </div>
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-full border-4 border-green-500/20 flex items-center justify-center text-[11px] font-black text-green-500">
                      {totaisHoje.carboidratos}g
                    </div>
                    <p className="text-[10px] font-bold uppercase text-muted mt-2">Carb</p>
                  </div>
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-full border-4 border-amber-500/20 flex items-center justify-center text-[11px] font-black text-amber-500">
                      {totaisHoje.gorduras}g
                    </div>
                    <p className="text-[10px] font-bold uppercase text-muted mt-2">Gord</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted">
                    <span>Progresso do dia</span>
                    <span className="text-ember">{progressoPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ember transition-all duration-500"
                      style={{ width: `${progressoPct}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Plano Detalhamento */}
              <Card className="overflow-hidden">
                <button
                  onClick={() => setShowPlanoDetalhamento(!showPlanoDetalhamento)}
                  className="w-full p-4 flex items-center justify-between hover:bg-surface-hover transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-ember/10 flex items-center justify-center text-ember">
                      <Utensils size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text">Guia Nutricional</p>
                      <p className="text-[10px] text-muted">O que comer na Fase {fase}</p>
                    </div>
                  </div>
                  {showPlanoDetalhamento ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {showPlanoDetalhamento && (
                  <div className="p-4 border-t border-surface-border bg-surface-mid/50 space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                        Foco da Fase
                      </h4>
                      <p className="text-xs text-text font-medium leading-relaxed">
                        {plano?.resumo}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-2">
                          Recomendados
                        </h4>
                        <ul className="space-y-1">
                          {plano?.alimentosRecomendados.slice(0, 4).map((a) => (
                            <li key={a} className="text-[10px] text-muted flex items-center gap-1">
                              <Check size={10} className="text-green-500" /> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2">
                          Evitar
                        </h4>
                        <ul className="space-y-1">
                          {plano?.alimentosEvitar.slice(0, 4).map((a) => (
                            <li key={a} className="text-[10px] text-muted flex items-center gap-1">
                              <span className="text-red-500">•</span> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <button
                onClick={() => setRegistering(true)}
                className="w-full h-14 bg-ember text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-ember active:scale-95 transition-all"
              >
                <Sparkles size={20} fill="currentColor" />
                Registrar Refeição (IA)
              </button>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted ml-1">Refeições de Hoje</h3>
                {refeicoes.length === 0 ? (
                  <EmptyState
                    icon={<Utensils />}
                    title="Nada ainda"
                    description="Registre sua refeição com foto ou texto para estimar macros."
                  />
                ) : (
                  refeicoes.map((r) => (
                    <Card key={r.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-text capitalize">{r.nome}</h4>
                        <p className="text-[11px] text-muted mt-0.5">
                          {r.calorias} kcal · P: {r.proteinas}g · C: {r.carboidratos}g · G: {r.gorduras}g
                        </p>
                      </div>
                      <button
                        onClick={() => removerRefeicao(r.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-dim hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : (
            <ReceitasIA userId={userId} fase={fase} />
          )}
        </div>
      </BlurPaywall>

      {registering && (
        <RegistrarRefeicaoIA
          userId={userId}
          onClose={() => setRegistering(false)}
          onSuccess={(r) => {
            setRefeicoes((prev) => [
              {
                id: r.id,
                nome: r.descricao,
                calorias: r.calorias_estimadas,
                proteinas: r.proteinas_g,
                carboidratos: r.carboidratos_g,
                gorduras: r.gorduras_g,
                criado_em: r.data
              },
              ...prev
            ]);
            setRegistering(false);
          }}
        />
      )}
    </div>
  );
}

function RegistrarRefeicaoIA({
  userId,
  onClose,
  onSuccess,
}: {
  userId: string;
  onClose: () => void;
  onSuccess: (r: any) => void;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function analisar() {
    if (!text && !image) return toast.error("Adicione uma foto ou descrição.");
    setAnalyzing(true);
    try {
      const res = await fetch("/api/diet/analyze", {
        method: "POST",
        body: JSON.stringify({ text, image }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Erro ao analisar.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function salvar() {
    if (!result) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("refeicoes_registradas")
        .insert({
          user_id: userId,
          descricao: result.nome,
          calorias_estimadas: result.calorias,
          proteinas_g: result.proteinas,
          carboidratos_g: result.carboidratos,
          gorduras_g: result.gorduras,
          data: new Date().toISOString(),
          tipo: "almoco" // default
        })
        .select()
        .single();
      if (error) throw error;
      onSuccess(data);
      toast.success("Salvo!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-bg rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-text">Registrar Refeição</h2>
            <button onClick={onClose} className="p-2 text-dim"><ChevronDown size={24} /></button>
          </div>

          {!result ? (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-2xl bg-surface-mid border-2 border-dashed border-surface-border flex flex-col items-center justify-center overflow-hidden cursor-pointer"
              >
                {image ? (
                  <img src={image} className="w-full h-full object-cover" alt="Meal" />
                ) : (
                  <>
                    <Camera size={32} className="text-muted mb-2" />
                    <p className="text-xs font-bold text-muted">Tirar foto do prato</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ou descreva sua refeição..."
                className="w-full h-24 bg-surface rounded-2xl p-4 text-sm outline-none border border-surface-border focus:border-ember"
              />

              <button
                onClick={analisar}
                disabled={analyzing}
                className="w-full h-14 bg-ember text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-ember disabled:opacity-50"
              >
                {analyzing ? <LoadingSpinner size="sm" color="white" /> : <><Sparkles size={20} fill="currentColor" /> Estimar Macros</>}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-6 bg-surface-mid rounded-[24px]">
                <h3 className="text-xl font-black text-text mb-4 capitalize">{result.nome}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { l: "Kcal", v: result.calorias },
                    { l: "Prot", v: `${result.proteinas}g` },
                    { l: "Carb", v: `${result.carboidratos}g` },
                    { l: "Gord", v: `${result.gorduras}g` },
                  ].map((s) => (
                    <div key={s.l} className="p-2 bg-surface rounded-xl border border-surface-border text-center">
                      <p className="text-[9px] font-bold text-muted uppercase">{s.l}</p>
                      <p className="text-sm font-black text-text">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setResult(null)} className="flex-1 h-14 bg-surface text-text rounded-2xl font-bold border border-surface-border">Refazer</button>
                <button onClick={salvar} disabled={saving} className="flex-1 h-14 bg-ember text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-ember">{saving ? <LoadingSpinner size="sm" color="white" /> : "Confirmar"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReceitaIA {
  id: string;
  nome: string;
  tipo: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  tempo_preparo: number;
  dificuldade: string;
  emoji: string;
  dica_mounjaro?: string;
  ingredientes: string[];
  modo_preparo: string[];
}

function ReceitasIA({ userId, fase }: { userId: string; fase: FaseMounjaro }) {
  const [receitas, setReceitas] = useState<ReceitaIA[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecionada, setSelecionada] = useState<ReceitaIA | null>(null);

  async function carregarReceitas(forcar = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/receitas/gerar", {
        method: "POST",
        body: JSON.stringify({ userId, fase }),
      });
      const data = await res.json();
      setReceitas((data.receitas ?? []) as ReceitaIA[]);
    } catch {
      toast.error("Erro ao carregar receitas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarReceitas(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-text">Receitas IA</h3>
          <p className="text-xs text-muted">Sugestões para a Fase {fase}</p>
        </div>
        <button onClick={() => carregarReceitas(true)} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-ember/10 text-ember rounded-full text-xs font-bold active:scale-95 transition-all">
          {loading ? <LoadingSpinner size="sm" /> : <><Sparkles size={14} /> Atualizar</>}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {receitas.length === 0 && !loading ? (
          <EmptyState icon={<Sparkles />} title="Nenhuma receita" description="Gere sugestões personalizadas para seu tratamento." />
        ) : (
          receitas.map((r) => (
            <Card key={r.id} onClick={() => setSelecionada(r)} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-hover transition-all">
              <div className="h-14 w-14 rounded-2xl bg-ember/10 flex items-center justify-center text-3xl">{r.emoji}</div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-text leading-tight">{r.nome}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-muted uppercase">🔥 {r.calorias} kcal</span>
                  <span className="text-[10px] font-bold text-muted uppercase">💪 {r.proteinas}g Prot</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-dim" />
            </Card>
          ))
        )}
      </div>

      {selecionada && <ReceitaDrawer receita={selecionada} onClose={() => setSelecionada(null)} />}
    </div>
  );
}

function ReceitaDrawer({ receita, onClose }: { receita: ReceitaIA; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-bg rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 flex flex-col max-h-[90vh]">
        <div className="relative p-6 bg-surface-mid text-center">
          <button onClick={onClose} className="absolute right-6 top-6 p-2 text-dim"><ChevronDown size={24} /></button>
          <div className="h-20 w-20 rounded-3xl bg-ember/10 flex items-center justify-center text-4xl mx-auto mb-4">{receita.emoji}</div>
          <h2 className="text-xl font-black text-text">{receita.nome}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: "Kcal", v: receita.calorias },
              { l: "Prot", v: `${receita.proteinas}g` },
              { l: "Carb", v: `${receita.carboidratos}g` },
              { l: "Gord", v: `${receita.gorduras}g` },
            ].map((s) => (
              <div key={s.l} className="p-2 bg-surface rounded-xl border border-surface-border text-center">
                <p className="text-[9px] font-bold text-muted uppercase">{s.l}</p>
                <p className="text-sm font-black text-text">{s.v}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-3 ml-1">Ingredientes</h3>
            <ul className="space-y-2">
              {receita.ingredientes.map((ing, i) => (
                <li key={i} className="flex gap-3 text-sm text-text bg-surface p-3 rounded-xl border border-surface-border">
                  <div className="h-5 w-5 rounded-full bg-ember/10 text-ember flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                  {ing}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-3 ml-1">Preparo</h3>
            <div className="space-y-4">
              {receita.modo_preparo.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="text-ember font-black text-lg italic opacity-30">{i + 1}</div>
                  <p className="text-sm text-text leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
