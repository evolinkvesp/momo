"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ShareProgressData {
  pesoPerdido: number;
  semanas: number;
  imc: number;
  pesoInicial: number | null;
  pesoAtual: number | null;
  mediaSemana: number;
  serie: number[];
  nome?: string;
  pesoMeta?: number | null;
}

type TemplateType = "weight" | "goal" | "week" | "record" | "beforeafter";

// ── Constants ──────────────────────────────────────────────────────────────────

const CARD_W = 360;
const CARD_H = 640;
const EXPORT_SCALE = 3; // 360×3=1080  640×3=1920

const TEMPLATES: { key: TemplateType; emoji: string; label: string }[] = [
  { key: "weight",      emoji: "🔥", label: "Peso perdido"   },
  { key: "goal",        emoji: "🏆", label: "Meta atingida"  },
  { key: "week",        emoji: "✅", label: "Semana"         },
  { key: "record",      emoji: "⚡", label: "Recorde"        },
  { key: "beforeafter", emoji: "✨", label: "Antes e depois" },
];

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

// ── Story Card (360×640) — transparent PNG, exported by html2canvas at 3× ──────

interface CardProps {
  template: TemplateType;
  data: ShareProgressData;
  displayPeso: number;
  mesAno: string;
}

const StoryCard = forwardRef<HTMLDivElement, CardProps>(
  function StoryCard({ template, data, displayPeso, mesAno }, ref) {
    const dias = Math.round(data.semanas * 7);

    return (
      <div ref={ref} style={{ width: CARD_W, height: CARD_H, position: "relative", overflow: "hidden", fontFamily: "Syne,sans-serif", background: "transparent" }}>

        {/* Content */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "36px 28px 32px" }}>

          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, marginBottom: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.05em", opacity: 0.88, textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>momo</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", fontFamily: "Outfit,sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{mesAno}</span>
          </div>

          {/* Template area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>

            {/* Hero glow behind the main number */}
            {template === "weight" && (
              <div style={{
                position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)",
                width: 320, height: 320, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(255,101,0,0.32) 0%,rgba(255,101,0,0.10) 45%,transparent 72%)",
                pointerEvents: "none",
              }} />
            )}

            {template === "weight"      && <TplWeight data={data} displayPeso={displayPeso} dias={dias} />}
            {template === "goal"        && <TplGoal   data={data} dias={dias} />}
            {template === "week"        && <TplWeek   data={data} dias={dias} />}
            {template === "record"      && <TplRecord data={data} />}
            {template === "beforeafter" && <TplBA     data={data} dias={dias} />}
          </div>

          {/* Footer */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ height: 1, background: "linear-gradient(90deg,rgba(255,101,0,0.8),rgba(255,101,0,0.25),transparent)", marginBottom: 12 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,101,0,0.85)", letterSpacing: "0.05em", textShadow: "0 0 20px rgba(255,101,0,0.6)" }}>momo.app</span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontFamily: "Outfit,sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Mounjaro Tracker</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// ── Template: Peso Perdido ─────────────────────────────────────────────────────

function TplWeight({ data, displayPeso, dias }: { data: ShareProgressData; displayPeso: number; dias: number }) {
  const numStr = displayPeso.toFixed(1);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 0.84, marginBottom: 10 }}>
        <span style={{ fontSize: 90, fontWeight: 900, color: "#ff6500", lineHeight: 0.84, letterSpacing: "-5px", textShadow: "0 0 60px rgba(255,101,0,0.55)" }}>−</span>
        <span style={{ fontSize: 90, fontWeight: 900, color: "#fff",    lineHeight: 0.84, letterSpacing: "-5px", textShadow: "0 2px 40px rgba(0,0,0,0.8), 0 0 80px rgba(255,255,255,0.08)" }}>{numStr}</span>
        <span style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "-1px", marginTop: 18, textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>kg</span>
      </div>

      <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 30, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
        perdidos no tratamento
      </div>

      {data.pesoInicial != null && data.pesoAtual != null && (
        <div style={{ marginBottom: 22 }}>
          <Timeline from={data.pesoInicial} to={data.pesoAtual} />
        </div>
      )}

      <DaysPill dias={dias} />
    </div>
  );
}

// ── Template: Meta Atingida ────────────────────────────────────────────────────

function TplGoal({ data, dias }: { data: ShareProgressData; dias: number }) {
  const metaKg = data.pesoMeta ?? data.pesoAtual;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 44, marginBottom: 18, lineHeight: 1 }}>🏆</div>

      <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, fontWeight: 700, color: "#ff6500", letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 12, textShadow: "0 0 20px rgba(255,101,0,0.5)" }}>
        Meta atingida
      </div>

      {metaKg != null && (
        <>
          <div style={{ fontSize: 72, fontWeight: 900, color: "#fff", letterSpacing: "-4px", lineHeight: 0.88, marginBottom: 8, textShadow: "0 2px 40px rgba(0,0,0,0.8)" }}>
            {metaKg.toFixed(1)}
          </div>
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em", marginBottom: 28 }}>
            kg — peso conquistado
          </div>
        </>
      )}

      {data.pesoInicial != null && data.pesoAtual != null && (
        <div style={{ marginBottom: 22 }}>
          <Timeline from={data.pesoInicial} to={data.pesoAtual} />
        </div>
      )}

      <DaysPill dias={dias} accent />
    </div>
  );
}

// ── Template: Semana Concluída ─────────────────────────────────────────────────

function TplWeek({ data, dias }: { data: ShareProgressData; dias: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, fontWeight: 700, color: "#ff6500", letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 14, textShadow: "0 0 20px rgba(255,101,0,0.5)" }}>
        ✅ Semana concluída
      </div>
      <div style={{ fontSize: 82, fontWeight: 900, color: "#fff", letterSpacing: "-5px", lineHeight: 0.84, marginBottom: 10, textShadow: "0 2px 40px rgba(0,0,0,0.8)" }}>
        {data.semanas}
      </div>
      <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 26 }}>
        semanas de tratamento
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatCell value={`−${data.mediaSemana.toFixed(1)}kg`} label="média / semana" />
        <StatCell value={`${dias}`} label="dias de jornada" />
        {data.pesoAtual != null && <StatCell value={`${data.pesoAtual.toFixed(1)}kg`} label="peso atual" />}
        {data.imc > 0 && <StatCell value={data.imc.toFixed(1)} label="IMC" />}
      </div>
    </div>
  );
}

// ── Template: Recorde Pessoal ──────────────────────────────────────────────────

function TplRecord({ data }: { data: ShareProgressData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, fontWeight: 700, color: "#ff6500", letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 14, textShadow: "0 0 20px rgba(255,101,0,0.5)" }}>
        ⚡ Recorde pessoal
      </div>
      <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: "0.06em" }}>
        média semanal
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 0.84, marginBottom: 10 }}>
        <span style={{ fontSize: 80, fontWeight: 900, color: "#ff6500", lineHeight: 0.84, letterSpacing: "-5px", textShadow: "0 0 60px rgba(255,101,0,0.55)" }}>−{data.mediaSemana.toFixed(1)}</span>
        <span style={{ fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "-1px", marginTop: 14 }}>kg</span>
      </div>
      <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.38)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 26 }}>
        por semana no tratamento
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatCell value={`−${data.pesoPerdido.toFixed(1)}kg`} label="total perdido" />
        <StatCell value={`${data.semanas}`} label="semanas" />
      </div>
    </div>
  );
}

// ── Template: Antes e Depois ───────────────────────────────────────────────────

function TplBA({ data, dias }: { data: ShareProgressData; dias: number }) {
  const antes  = data.pesoInicial ?? 0;
  const depois = data.pesoAtual   ?? 0;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, fontWeight: 700, color: "#ff6500", letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 22, textShadow: "0 0 20px rgba(255,101,0,0.5)" }}>
        Transformação
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", gap: 8, alignItems: "end", marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>antes</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: "rgba(255,255,255,0.5)", letterSpacing: "-2px", lineHeight: 1, textShadow: "0 1px 20px rgba(0,0,0,0.6)" }}>{antes.toFixed(1)}</div>
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 3 }}>kg</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 14 }}>
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
            <path d="M1 7h20M15 1l6 6-6 6" stroke="#ff6500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 9, color: "#ff6500", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>depois</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1, textShadow: "0 2px 30px rgba(0,0,0,0.8)" }}>{depois.toFixed(1)}</div>
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>kg</div>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 0.88, marginBottom: 6 }}>
          <span style={{ fontSize: 58, fontWeight: 900, color: "#ff6500", letterSpacing: "-3px", lineHeight: 0.88, textShadow: "0 0 50px rgba(255,101,0,0.5)" }}>−</span>
          <span style={{ fontSize: 58, fontWeight: 900, color: "#fff",    letterSpacing: "-3px", lineHeight: 0.88, textShadow: "0 2px 30px rgba(0,0,0,0.8)" }}>{data.pesoPerdido.toFixed(1)}</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginTop: 13, letterSpacing: "-1px" }}>kg</span>
        </div>
        <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          de transformação real
        </div>
      </div>

      <DaysPill dias={dias} />
    </div>
  );
}

// ── Shared card sub-components ─────────────────────────────────────────────────

function Timeline({ from, to }: { from: number; to: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div>
        <div style={{ fontFamily: "Syne,sans-serif", fontSize: 19, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}>
          {from.toFixed(1)}
        </div>
        <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>
          início
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,101,0,0.85))" }} />
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
          <path d="M1 5h8M5 1l4 4-4 4" stroke="#ff6500" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: "Syne,sans-serif", fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 1px 20px rgba(0,0,0,0.6)" }}>
          {to.toFixed(1)}
        </div>
        <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 8, color: "#ff6500", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>
          agora
        </div>
      </div>
    </div>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.45)",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 14, padding: "12px 14px",
      backdropFilter: "blur(0px)",
    }}>
      <div style={{ fontFamily: "Syne,sans-serif", fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 5, textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}>
        {value}
      </div>
      <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 9, color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

function DaysPill({ dias, accent = false }: { dias: number; accent?: boolean }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 9,
      background: accent ? "rgba(255,101,0,0.18)" : "rgba(0,0,0,0.42)",
      border: `1px solid ${accent ? "rgba(255,101,0,0.4)" : "rgba(255,255,255,0.16)"}`,
      borderRadius: 999, paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
    }}>
      <span style={{ fontFamily: "Syne,sans-serif", fontSize: 18, fontWeight: 800, color: accent ? "#ff7a1a" : "#fff", letterSpacing: "-0.03em", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
        {dias}
      </span>
      <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, color: accent ? "rgba(255,150,50,0.75)" : "rgba(255,255,255,0.42)", letterSpacing: "0.04em" }}>
        dias de jornada
      </span>
    </div>
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
