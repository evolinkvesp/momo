"use client";

import { useState } from "react";
import { Share2, Copy, Check, Link2, Users } from "lucide-react";

interface ConviteClientProps {
  referralCode: string;
  inviteCount: number;
}

const NEEDED = 3;
const EMBER = "#FF6500";

export function ConviteClient({ referralCode, inviteCount }: ConviteClientProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `https://www.usemomo.online/convite/${referralCode}`;
  const shareMessage = `Estou usando o Momo para acompanhar meu tratamento com Mounjaro — dose, peso, dieta e tudo mais. É gratuito! Entre pelo meu link: ${inviteUrl}`;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Momo — Acompanhamento de tratamento", text: shareMessage, url: inviteUrl });
      } catch {
        await copyToClipboard();
      }
    } else {
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const remaining = Math.max(0, NEEDED - inviteCount);

  return (
    <div className="space-y-4">
      {/* Convites aceitos */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Convites aceitos</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          {Array.from({ length: NEEDED }, (_, i) => {
            const filled = i < inviteCount;
            return (
              <div
                key={i}
                className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold transition-all duration-300"
                style={
                  filled
                    ? { background: EMBER, color: "#fff" }
                    : {
                        background: "#fff",
                        color: "#9CA3AF",
                        border: "1.5px solid #E5E7EB",
                      }
                }
              >
                {filled ? <Check className="h-5 w-5" /> : i + 1}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          {inviteCount >= NEEDED
            ? "Parabéns! Você completou os convites."
            : remaining === 1
            ? "Falta 1 amigo para completar"
            : `Faltam ${remaining} amigos para completar`}
        </p>
      </div>

      {/* Link de convite */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5">
        <div className="mb-3 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Seu link de convite</span>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <span className="flex-1 truncate text-sm text-gray-500">
            usemomo.online/convite/
            <strong style={{ color: EMBER }}>{referralCode}</strong>
          </span>
          <button
            onClick={copyToClipboard}
            className="shrink-0 rounded-lg p-1.5 transition-colors"
            style={{
              color: copied ? EMBER : "#9CA3AF",
              background: copied ? "rgba(255,101,0,0.06)" : "transparent",
            }}
            aria-label="Copiar link"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Botão compartilhar */}
      <button
        onClick={handleShare}
        className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full text-[0.95rem] font-bold text-white transition-all active:scale-95"
        style={{ background: EMBER }}
      >
        <Share2 className="h-4 w-4" />
        Compartilhar link
      </button>

      {/* Rodapé */}
      <div className="flex items-start justify-center gap-2 px-2 pt-1">
        <svg
          className="mt-0.5 shrink-0"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p className="text-center text-xs leading-relaxed text-gray-400">
          O convite só conta quando seu amigo criar a conta pelo seu link.
        </p>
      </div>
    </div>
  );
}
