"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  StoryCard,
  TEMPLATES,
  CARD_W,
  CARD_H,
  type ShareProgressData,
  type TemplateType,
} from "./StoryCard";

// Re-export para backward compat (DashboardClient, SaudeClient importam daqui)
export type { ShareProgressData } from "./StoryCard";

// ── Constants ──────────────────────────────────────────────────────────────────

const EXPORT_SCALE = 3; // 360×3=1080  640×3=1920

// ── Helper ─────────────────────────────────────────────────────────────────────

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Drawer ─────────────────────────────────────────────────────────────────────

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  data: ShareProgressData;
}

export function ShareProgressDrawer({ open, onClose, data }: DrawerProps) {
  const [mounted, setMounted]     = useState(false);
  const [visible, setVisible]     = useState(false);
  const [busy, setBusy]           = useState(false);
  const [scale, setScale]         = useState(1);
  const [template, setTemplate]   = useState<TemplateType>("weight");
  const [displayPeso, setDisplay] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef<number>(0);

  useEffect(() => setMounted(true), []);

  // open/close + counter animation
  useEffect(() => {
    if (!open) { setVisible(false); setDisplay(0); return; }
    const raf = requestAnimationFrame(() => setVisible(true));

    const target = data.pesoPerdido;
    const dur    = 1500;
    const t0     = performance.now();
    const tick   = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setDisplay((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(rafRef.current); };
  }, [open, data.pesoPerdido]);

  // scale preview to fit container
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const w = wrapRef.current?.clientWidth ?? 320;
      setScale(Math.min(1, w / CARD_W));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  const mesAno   = cap(format(new Date(), "MMMM yyyy", { locale: ptBR }));
  const mesLower = format(new Date(), "MMMM", { locale: ptBR });

  async function snapAndWait() {
    cancelAnimationFrame(rafRef.current);
    setDisplay(data.pesoPerdido);
    await new Promise<void>(r => setTimeout(r, 90));
  }

  async function getCanvas() {
    if (!cardRef.current) return null;
    const h2c = (await import("html2canvas")).default;
    return h2c(cardRef.current, { backgroundColor: null, scale: EXPORT_SCALE, useCORS: true, logging: false });
  }

  function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise(r => canvas.toBlob(r, "image/png"));
  }

  async function handleSave() {
    if (busy) return;
    setBusy(true);
    try {
      await snapAndWait();
      const canvas = await getCanvas();
      if (!canvas) throw new Error();
      const blob = await toBlob(canvas);
      if (!blob) throw new Error();
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `momo-conquista-${mesLower}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PNG salvo! Cole no Story como figurinha 🎯");
    } catch {
      toast.error("Não foi possível gerar a imagem.");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (busy) return;
    setBusy(true);
    try {
      await snapAndWait();
      const canvas = await getCanvas();
      const blob   = canvas ? await toBlob(canvas) : null;
      if (blob && navigator.canShare) {
        const file = new File([blob], "momo-conquista.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "Minha conquista no Momo", files: [file] });
          return;
        }
      }
      const txt = `🔥 Perdi ${data.pesoPerdido.toFixed(1)}kg com Mounjaro em ${data.semanas} semanas! Acompanho pelo Momo 🌿`;
      await navigator.clipboard.writeText(txt);
      toast.success("Texto copiado! 📋");
    } catch (err: any) {
      if (err?.name !== "AbortError") toast.error("Não foi possível compartilhar.");
    } finally {
      setBusy(false);
    }
  }

  function handleWhatsApp() {
    const t =
      `🔥 *Meu progresso com Mounjaro*\n\n` +
      `📉 Perdi *${data.pesoPerdido.toFixed(1)}kg* em *${data.semanas} semanas*\n` +
      `📊 Média: *${data.mediaSemana.toFixed(1)}kg/semana*\n` +
      (data.imc > 0 ? `⚖️ IMC atual: *${data.imc.toFixed(1)}*\n` : "") +
      `\nAcompanho tudo pelo Momo 🌿`;
    window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, "_blank");
  }

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes _spUp {
          from { transform: translateY(100%); opacity:0; }
          to   { transform: translateY(0);    opacity:1; }
        }
      `}</style>

      <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: "var(--z-modal)" }}>

        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            zIndex: "var(--z-overlay)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
          onClick={onClose}
        />

        {/* Sheet */}
        <div style={{
          position: "relative",
          width: "100%", maxWidth: 480, maxHeight: "96vh",
          display: "flex", flexDirection: "column",
          borderRadius: "32px 32px 0 0",
          overflow: "hidden",
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "none",
          zIndex: "var(--z-modal)",
          animation: "_spUp 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}>

          {/* Ember line */}
          <div style={{ height: 2, background: "linear-gradient(90deg,#ff6500,rgba(255,101,0,0.35),transparent)", flexShrink: 0 }} />

          {/* Header */}
          <div style={{ flexShrink: 0, padding: "12px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", margin: "0 auto 14px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "Syne,sans-serif", letterSpacing: "-0.04em" }}>
                  Compartilhar conquista
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "Outfit,sans-serif" }}>
                  PNG transparente — cole como figurinha no Story
                </p>
              </div>
              <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scrollable */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 48px" }}>

            {/* Preview — dark wrapper so white text is visible, card itself is transparent */}
            <div ref={wrapRef} style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
              <div style={{
                width:  CARD_W * scale,
                height: CARD_H * scale,
                overflow: "hidden",
                borderRadius: 22 * scale,
                background: "linear-gradient(135deg,#0d0d0d 0%,#1a0a00 100%)",
                boxShadow: "0 36px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.07)",
              }}>
                <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                  <StoryCard
                    ref={cardRef}
                    template={template}
                    data={data}
                    displayPeso={displayPeso}
                    mesAno={mesAno}
                  />
                </div>
              </div>
            </div>

            {/* Template picker */}
            <SheetLabel>Formato</SheetLabel>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
              {TEMPLATES.map(tp => (
                <SheetPill key={tp.key} active={template === tp.key} onClick={() => setTemplate(tp.key)}>
                  {tp.emoji} {tp.label}
                </SheetPill>
              ))}
            </div>

            {/* Actions */}
            <button
              onClick={handleSave}
              disabled={busy}
              style={{
                width: "100%", height: 54, borderRadius: 999, marginBottom: 10,
                background: "linear-gradient(135deg,#ff6500,#cc3f00)",
                border: "none", color: "#fff",
                fontSize: 13, fontWeight: 800, fontFamily: "Outfit,sans-serif", letterSpacing: "0.04em",
                cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 8px 28px rgba(255,101,0,0.4)",
                transition: "transform 0.15s",
              }}
              onPointerDown={e => { if (!busy) e.currentTarget.style.transform = "scale(0.97)"; }}
              onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <Download size={16} /> Salvar PNG transparente
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={handleShare}
                disabled={busy}
                style={{
                  height: 46, borderRadius: 999,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "Outfit,sans-serif",
                  cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "transform 0.15s",
                }}
                onPointerDown={e => { if (!busy) e.currentTarget.style.transform = "scale(0.97)"; }}
                onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Share2 size={14} /> Compartilhar
              </button>
              <button
                onClick={handleWhatsApp}
                disabled={busy}
                style={{
                  height: 46, borderRadius: 999,
                  background: "#25D366", border: "none",
                  color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "Outfit,sans-serif",
                  cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  boxShadow: "0 4px 14px rgba(37,211,102,0.25)",
                  transition: "transform 0.15s",
                }}
                onPointerDown={e => { if (!busy) e.currentTarget.style.transform = "scale(0.97)"; }}
                onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <WaIcon /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ── Drawer UI ──────────────────────────────────────────────────────────────────

function SheetLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 10px", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(255,255,255,0.26)", fontFamily: "Outfit,sans-serif" }}>
      {children}
    </p>
  );
}

function SheetPill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
        padding: "9px 14px", borderRadius: 999,
        fontSize: 12, fontWeight: 700, fontFamily: "Outfit,sans-serif",
        whiteSpace: "nowrap", cursor: "pointer",
        border: active ? "1.5px solid rgba(255,101,0,0.5)" : "1.5px solid rgba(255,255,255,0.08)",
        background: active ? "rgba(255,101,0,0.13)" : "rgba(255,255,255,0.04)",
        color: active ? "#ff7a1a" : "rgba(255,255,255,0.36)",
        transition: "all 0.18s ease",
      }}
    >
      {children}
    </button>
  );
}

// ── WhatsApp icon ──────────────────────────────────────────────────────────────

function WaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.59 5.319l-.999 3.648 3.909-.766zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
