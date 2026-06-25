"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronRight,
  Store,
  Building2,
  Bike,
  Clock,
  Star,
  BadgeCheck,
  Truck,
  ShieldCheck,
  Zap,
  Heart,
  Package,
} from "lucide-react";
import {
  nomeFornecedor,
  formatBRL,
  TIPO_FORNECEDOR_LABEL,
} from "@/lib/fornecedores";
import { motion, AnimatePresence } from "framer-motion";

export function FornecedoresSectionClient({
  fornecedores,
  cidade,
  estado,
}: {
  fornecedores: any[];
  cidade: string | null;
  estado: string | null;
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filters = [
    { label: "Todos", icon: null },
    { label: "Frete Grátis", key: "frete_gratis" },
    { label: "Mais vendidos", key: "mais_vendidos" },
    { label: "Melhor avaliação", key: "rating" },
  ];

  const filteredFornecedores = useMemo(() => {
    let result = fornecedores.filter((f) => {
      const matchSearch = (f.nome_fantasia || f.razao_social || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      let matchFilter = true;
      if (activeFilter === "Frete Grátis")
        matchFilter = f.entrega_gratis_acima != null;
      if (activeFilter === "Melhor avaliação")
        matchFilter = (f.avaliacao_media || 0) >= 4.5;

      return matchSearch && matchFilter;
    });

    if (activeFilter === "Mais vendidos") {
      result = [...result].sort(
        (a, b) => (b.total_pedidos || 0) - (a.total_pedidos || 0)
      );
    }
    if (activeFilter === "Melhor avaliação") {
      result = [...result].sort(
        (a, b) => (b.avaliacao_media || 0) - (a.avaliacao_media || 0)
      );
    }

    return result;
  }, [fornecedores, search, activeFilter]);

  return (
    <div className="space-y-0">
      {/* Search Bar — ML yellow style */}
      <div
        className="sticky top-0 z-10 -mx-6 px-4 py-3"
        style={{
          background: "linear-gradient(135deg, #ff6500, #e85d00)",
        }}
      >
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5 shadow-md">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar fornecedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        {cidade && (
          <div className="flex items-center gap-1 mt-2 px-1">
            <MapPin size={12} className="text-white/80" />
            <span className="text-[11px] font-medium text-white/80">
              Enviar para{" "}
              <span className="font-bold text-white underline underline-offset-2">
                {cidade}, {estado}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide -mx-6 px-6 bg-surface border-b border-surface-border">
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.label)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              activeFilter === f.label
                ? "bg-ember/10 text-ember border-ember/30"
                : "bg-transparent border-surface-border text-muted hover:bg-surface-mid"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="px-1 pt-3 pb-2">
        <p className="text-[12px] font-medium text-muted">
          {filteredFornecedores.length}{" "}
          {filteredFornecedores.length === 1 ? "resultado" : "resultados"}
        </p>
      </div>

      {/* Supplier Cards — ML Product Card Style */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredFornecedores.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-surface rounded-xl"
            >
              <MapPin
                className="mx-auto text-dim mb-4"
                size={40}
              />
              <p className="text-muted font-bold text-sm">
                Nenhum resultado encontrado
              </p>
              <p className="text-xs text-dim mt-1">
                {cidade
                  ? `Não encontramos fornecedores em ${cidade}`
                  : "Tente ajustar os filtros"}
              </p>
            </motion.div>
          ) : (
            filteredFornecedores.map((f, i) => (
              <motion.div
                layout
                key={f.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/estoque/fornecedor/${f.id}`}
                  className="flex bg-surface rounded-xl overflow-hidden border border-surface-border active:bg-surface-mid transition-colors"
                >
                  {/* Left — Image/Avatar */}
                  <div className="w-[110px] shrink-0 bg-surface-mid flex items-center justify-center relative">
                    {f.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.logo_url}
                        alt={f.nome_fantasia}
                        className="w-full h-full object-cover"
                        style={{ minHeight: 140 }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 p-4">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, #ff6500, #cc4c00)",
                          }}
                        >
                          {(f.nome_fantasia || f.razao_social || "F")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="text-[9px] font-bold text-dim uppercase tracking-wider">
                          {TIPO_FORNECEDOR_LABEL[f.tipo] || "Farmácia"}
                        </span>
                      </div>
                    )}
                    {/* Favoritar coração */}
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
                    >
                      <Heart
                        size={14}
                        className="text-gray-400"
                      />
                    </button>
                  </div>

                  {/* Right — Content */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-h-[140px]">
                    {/* Title */}
                    <div>
                      <h4 className="text-[13px] font-medium text-text leading-snug line-clamp-2">
                        {nomeFornecedor(f)}
                        {f.verificado && (
                          <BadgeCheck
                            size={14}
                            className="inline ml-1 text-blue-500 align-middle"
                          />
                        )}
                      </h4>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className="text-[11px] font-bold text-white px-1.5 py-0.5 rounded"
                          style={{
                            background:
                              (f.avaliacao_media || 5) >= 4.5
                                ? "#00a650"
                                : (f.avaliacao_media || 5) >= 4
                                ? "#ff8c00"
                                : "#999",
                          }}
                        >
                          {f.avaliacao_media?.toFixed(1) || "5.0"}
                        </span>
                        <span className="text-[10px] text-dim">
                          ({f.total_pedidos || 0}{" "}
                          {(f.total_pedidos || 0) === 1
                            ? "venda"
                            : "vendas"})
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-2">
                      {f.preco_minimo ? (
                        <>
                          <p className="text-[10px] text-dim">
                            A partir de
                          </p>
                          <p
                            className="text-[22px] font-light tracking-tight leading-none"
                            style={{ color: "var(--color-text)" }}
                          >
                            {formatBRL(f.preco_minimo)}
                          </p>
                          <p className="text-[11px] text-dim mt-0.5">
                            em até{" "}
                            <span className="font-bold text-text">
                              12x{" "}
                              {formatBRL(f.preco_minimo / 12)}
                            </span>
                          </p>
                        </>
                      ) : (
                        <p className="text-[13px] font-bold text-muted">
                          Consultar preços
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {f.entrega_gratis_acima != null && (
                        <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                          <Truck size={11} strokeWidth={2.5} />
                          Frete grátis
                        </span>
                      )}
                      {f.oferece_frete_full && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"
                          style={{
                            background: "rgba(0,166,80,0.1)",
                            color: "#00a650",
                          }}
                        >
                          <Zap size={9} /> FULL
                        </span>
                      )}
                      {f.endereco_cidade && (
                        <span className="text-[10px] text-dim flex items-center gap-0.5">
                          <MapPin size={10} />
                          {f.endereco_cidade}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Trust Footer */}
      {filteredFornecedores.length > 0 && (
        <div className="mt-6 py-6 border-t border-surface-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0,166,80,0.1)",
                  color: "#00a650",
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <p className="text-[10px] font-bold text-muted leading-tight">
                Compra
                <br />
                protegida
              </p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0,166,80,0.1)",
                  color: "#00a650",
                }}
              >
                <Truck size={20} />
              </div>
              <p className="text-[10px] font-bold text-muted leading-tight">
                Entrega
                <br />
                rápida
              </p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0,166,80,0.1)",
                  color: "#00a650",
                }}
              >
                <BadgeCheck size={20} />
              </div>
              <p className="text-[10px] font-bold text-muted leading-tight">
                Fornecedores
                <br />
                verificados
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
