"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, AlertCircle, ChevronLeft, MoreVertical } from "lucide-react";
import { PaywallCard } from "@/components/PaywallCard";
import { usePlano } from "@/hooks/usePlano";
import { m, AnimatePresence } from "framer-motion";
import { useFabVisibility } from "@/components/FabVisibilityContext";
import dynamic from "next/dynamic";
import { SkeletonText } from "@/components/ui/Skeleton";
import { useRouter } from "next/navigation";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <SkeletonText lines={3} />,
  ssr: false,
});

const suggestions = [
  "Quais proteínas comer na janta?",
  "Como evitar náusea matinal?",
  "Dicas para beber mais água",
  "Posso beber álcool?",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AssistentePage() {
  const { setFabHidden } = useFabVisibility();
  const { isExpirado } = usePlano();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou seu assistente de acompanhamento. Posso ajudar com dúvidas sobre nutrição, bem-estar e como otimizar seus resultados com o Mounjaro. Como posso te ajudar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFabHidden(true);
    return () => setFabHidden(false);
  }, [setFabHidden]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = res.ok ? await res.json() : null;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data?.text || "Não consegui gerar uma resposta agora. Tente novamente.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Não consegui conectar. Tente novamente." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  if (isExpirado) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] flex-col pb-36">
        <ChatHeader onBack={() => router.back()} />
        <div className="mt-6">
          <PaywallCard
            recurso="Assistente IA Premium"
            descricao="Assine para conversar com o assistente sem limite de perguntas."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100svh - 96px)" }}>
      {/* Header estilo WhatsApp */}
      <ChatHeader onBack={() => router.back()} />

      {/* Aviso médico */}
      <div
        className="mx-0 mb-3 flex gap-2.5 rounded-2xl px-3.5 py-2.5"
        style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)" }}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-[11px] font-semibold leading-tight" style={{ color: "rgba(180,120,0,0.9)" }}>
          Respostas geradas por IA — siga sempre as orientações do seu médico.
        </p>
      </div>

      {/* Área de mensagens */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-surface-border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="space-y-2 px-1 py-3 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <m.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar IA */}
                {msg.role === "assistant" && (
                  <div
                    className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #ff6500, #c94500)",
                      boxShadow: "0 2px 10px rgba(255,101,0,0.35)",
                    }}
                  >
                    <Bot size={13} strokeWidth={2.5} color="white" />
                  </div>
                )}

                {/* Bolha */}
                <div
                  className="relative max-w-[80%] px-4 py-3"
                  style={
                    msg.role === "user"
                      ? {
                          background: "linear-gradient(135deg, #ff6500 0%, #d95000 100%)",
                          borderRadius: "20px 20px 5px 20px",
                          boxShadow: "0 2px 14px rgba(255,101,0,0.3)",
                          color: "white",
                        }
                      : {
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-surface-border)",
                          borderRadius: "20px 20px 20px 5px",
                          boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                        }
                  }
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <p style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text)", marginBottom: 4 }}>{children}</p>
                        ),
                        h2: ({ children }) => (
                          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text)", marginBottom: 4 }}>{children}</p>
                        ),
                        h3: ({ children }) => (
                          <p style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-muted)", marginBottom: 4 }}>{children}</p>
                        ),
                        p: ({ children }) => (
                          <p style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.65, marginBottom: 6 }}>{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong style={{ fontWeight: 700, color: "var(--color-text)" }}>{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul style={{ paddingLeft: 0, margin: "6px 0", listStyle: "none" }}>{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol style={{ paddingLeft: 0, margin: "6px 0", listStyle: "none" }}>{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 14, color: "var(--color-text)" }}>
                            <span style={{ color: "#ff6500", flexShrink: 0, marginTop: 2 }}>•</span>
                            <span>{children}</span>
                          </li>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-[14px] font-medium leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </m.div>
            ))}
          </AnimatePresence>

          {/* Digitando... */}
          {isLoading && (
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2"
            >
              <div
                className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(135deg, #ff6500, #c94500)",
                  boxShadow: "0 2px 10px rgba(255,101,0,0.35)",
                }}
              >
                <Bot size={13} strokeWidth={2.5} color="white" />
              </div>
              <div
                className="px-4 py-3"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-surface-border)",
                  borderRadius: "20px 20px 20px 5px",
                }}
              >
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full subtle-bounce"
                      style={{ background: "#ff6500", animationDelay: `${i * 0.18}s`, opacity: 0.8 }}
                    />
                  ))}
                </div>
              </div>
            </m.div>
          )}
        </div>
      </div>

      {/* Input fixo */}
      <div
        className="fixed bottom-[70px] left-0 right-0 z-[45]"
        style={{
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-surface-border)",
          paddingTop: 10,
          paddingBottom: 12,
        }}
      >
        <div className="mx-auto w-full max-w-md px-4">
          {/* Sugestões */}
          {messages.length <= 1 && !isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-2.5 scrollbar-hide">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all active:scale-95"
                  style={{
                    background: "rgba(255,101,0,0.08)",
                    border: "1px solid rgba(255,101,0,0.22)",
                    color: "#ff6500",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="h-12 flex-1 rounded-full px-5 text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ember/20"
              style={{
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-surface-border)",
                color: "var(--color-text)",
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #ff6500, #d95000)"
                  : "var(--color-surface-mid)",
                boxShadow: input.trim() ? "0 4px 16px rgba(255,101,0,0.38)" : "none",
                border: "1.5px solid var(--color-surface-border)",
              }}
            >
              <Send
                size={18}
                strokeWidth={2.5}
                style={{ color: input.trim() ? "white" : "var(--color-text-dim)" }}
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ChatHeader({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="mb-3 flex items-center gap-3 rounded-[24px] px-4 py-3.5"
      style={{
        background: "linear-gradient(135deg, #1a0800 0%, #2d1200 60%, #1a0800 100%)",
        boxShadow: "0 4px 20px rgba(255,101,0,0.18)",
      }}
    >
      <button
        onClick={onBack}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <ChevronLeft size={18} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
      </button>

      <div className="relative">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(255,101,0,0.2)", border: "2px solid rgba(255,101,0,0.45)" }}
        >
          <Bot size={20} strokeWidth={2} color="#ff6500" />
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full"
          style={{ background: "#22c55e", border: "2px solid #1a0800", boxShadow: "0 0 6px #22c55e" }}
        />
      </div>

      <div className="flex-1">
        <p className="text-[15px] font-bold leading-tight text-white">Assistente Momo</p>
        <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>
          Nutrição · Bem-estar · Mounjaro
        </p>
      </div>

      <div
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
        style={{ background: "rgba(34,197,94,0.15)" }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full bg-green-400"
          style={{ boxShadow: "0 0 5px #22c55e" }}
        />
        <span className="text-[10px] font-bold text-green-400">Online</span>
      </div>
    </div>
  );
}
