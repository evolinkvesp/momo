"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Pill } from "lucide-react";
import { createPortal } from "react-dom";
import { type ReceitaIA } from "./types";

interface ReceitaDrawerProps {
  receita: ReceitaIA;
  onClose: () => void;
}

export function ReceitaDrawer({ receita, onClose }: ReceitaDrawerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

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
        className="relative w-full max-w-md bg-bg rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 flex flex-col max-h-[90vh]"
        style={{ zIndex: "var(--z-modal)" }}
      >
        <div className="relative p-6 bg-surface-mid text-center">
          <button onClick={onClose} className="absolute right-6 top-6 p-2 text-dim">
            <ChevronDown size={24} />
          </button>
          <div className="h-20 w-20 rounded-3xl bg-ember/10 flex items-center justify-center text-4xl mx-auto mb-4">
            {receita.emoji}
          </div>
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
                <li
                  key={i}
                  className="flex gap-3 text-sm text-text bg-surface p-3 rounded-xl border border-surface-border"
                >
                  <div className="h-5 w-5 rounded-full bg-ember/10 text-ember flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </div>
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
          {receita.dica_mounjaro && (
            <div
              className="rounded-2xl p-4 border"
              style={{
                background: "var(--color-ember-glow)",
                borderColor: "var(--color-ember-glow-strong)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Pill size={14} style={{ color: "var(--color-ember)" }} />
                <p
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--color-ember)" }}
                >
                  Dica Mounjaro
                </p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {receita.dica_mounjaro}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
