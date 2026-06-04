"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * Inline paywall shown in place of a premium feature once the user's
 * trial/subscription has expired.
 */
export function PaywallCard({
  recurso = "Recurso Premium",
  descricao,
}: {
  recurso?: string;
  descricao: string;
}) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "2px dashed #e5e7eb",
        borderRadius: 20,
        padding: 32,
        textAlign: "center",
      }}
      className="flex flex-col items-center"
    >
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        <Lock size={32} color="#9ca3af" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{recurso}</h3>
      <p className="mt-1 max-w-[260px] text-sm font-medium text-gray-500">{descricao}</p>
      <Link
        href="/plano"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-forest px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.97]"
      >
        Assinar Momo — R$ 29,90/mês
      </Link>
    </div>
  );
}
