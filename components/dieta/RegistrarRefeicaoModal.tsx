"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Camera,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { createPortal } from "react-dom";
import {
  type TipoRefeicao,
  type FavoritoRefeicao,
  CONFIANCA_CONFIG,
} from "./types";

const TIPOS_OPTIONS: { key: TipoRefeicao; label: string }[] = [
  { key: "cafe",   label: "☕ Café"    },
  { key: "almoco", label: "🍽️ Almoço" },
  { key: "jantar", label: "🌙 Jantar"  },
  { key: "lanche", label: "🍎 Lanche"  },
];

interface RegistrarRefeicaoModalProps {
  userId: string;
  favoritos: FavoritoRefeicao[];
  onClose: () => void;
  onSuccess: (r: any) => void;
}

export function RegistrarRefeicaoModal({
  userId,
  favoritos,
  onClose,
  onSuccess,
}: RegistrarRefeicaoModalProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoRefeicao>("almoco");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

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

  async function salvar(override?: { nome: string; calorias: number; proteinas: number; carboidratos: number; gorduras: number }) {
    const dados = override ?? result;
    if (!dados) return;
    setSaving(true);
    try {
      let foto_url: string | null = null;
      if (image && !override) {
        try {
          const blob = await fetch(image).then((r) => r.blob());
          const ext = blob.type.split("/")[1] || "jpg";
          const path = `${userId}/${Date.now()}.${ext}`;
          const { data: up } = await supabase.storage
            .from("refeicoes-fotos")
            .upload(path, blob, { contentType: blob.type, upsert: false });
          if (up) {
            const { data: urlData } = supabase.storage
              .from("refeicoes-fotos")
              .getPublicUrl(path);
            foto_url = urlData.publicUrl;
          }
        } catch {}
      }

      const { data, error } = await supabase
        .from("refeicoes_registradas")
        .insert({
          user_id: userId,
          descricao: dados.nome,
          calorias_estimadas: dados.calorias,
          proteinas_g: dados.proteinas,
          carboidratos_g: dados.carboidratos,
          gorduras_g: dados.gorduras,
          data: new Date().toISOString(),
          tipo,
          ...(foto_url ? { foto_url } : {}),
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

  if (!mounted) return null;

  const confiancaInfo = result?.confianca ? CONFIANCA_CONFIG[result.confianca] : null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        style={{ zIndex: "var(--z-overlay)" }}
      />
      <div
        className="relative w-full max-w-md bg-bg rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] flex flex-col"
        style={{ zIndex: "var(--z-modal)" }}
      >
        {/* Header + tipo selector — fixed */}
        <div className="p-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-black text-text">Registrar Refeição</h2>
            <button onClick={onClose} className="p-2 text-dim">
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Meal type pills */}
          <div className="flex gap-1.5">
            {TIPOS_OPTIONS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTipo(t.key)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                  tipo === t.key
                    ? "bg-ember/10 border-ember/30 text-ember"
                    : "border-surface-border text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-5">
          {!result ? (
            <>
              {/* Favoritos quick-add */}
              {favoritos.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                    ⭐ Favoritos
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                    {favoritos.slice(0, 6).map((fav, i) => (
                      <button
                        key={i}
                        onClick={() => salvar(fav)}
                        disabled={saving}
                        className="shrink-0 snap-start text-left p-3 bg-surface rounded-2xl border border-surface-border hover:border-ember/40 active:scale-95 transition-all disabled:opacity-50"
                        style={{ minWidth: 120 }}
                      >
                        <p className="text-xs font-bold text-text capitalize leading-tight truncate max-w-[108px]">
                          {fav.nome}
                        </p>
                        <p className="text-[10px] text-muted mt-0.5">{fav.calorias} kcal</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-2xl bg-surface-mid border-2 border-dashed border-surface-border flex flex-col items-center justify-center overflow-hidden cursor-pointer"
              >
                {image ? (
                  <img src={image} className="w-full h-full object-cover" alt="Prato" />
                ) : (
                  <>
                    <Camera size={32} className="text-muted mb-2" />
                    <p className="text-xs font-bold text-muted">Tirar foto do prato</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ou descreva sua refeição..."
                className="w-full h-24 bg-surface rounded-2xl p-4 text-sm outline-none border border-surface-border focus:border-ember resize-none"
              />

              <button
                onClick={analisar}
                disabled={analyzing}
                className="w-full h-14 bg-ember text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-ember disabled:opacity-50"
              >
                {analyzing ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <><Sparkles size={20} fill="currentColor" /> Estimar Macros</>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-5">
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
                {confiancaInfo && (
                  <div className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full border text-[10px] font-bold ${confiancaInfo.bg} ${confiancaInfo.color}`}>
                    <AlertCircle size={11} />
                    {confiancaInfo.label}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 h-14 bg-surface text-text rounded-2xl font-bold border border-surface-border"
                >
                  Refazer
                </button>
                <button
                  onClick={() => salvar()}
                  disabled={saving}
                  className="flex-1 h-14 bg-ember text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-ember disabled:opacity-50"
                >
                  {saving ? <LoadingSpinner size="sm" color="white" /> : "Confirmar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
