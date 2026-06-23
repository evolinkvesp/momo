export type TipoRefeicao = "cafe" | "almoco" | "jantar" | "lanche";

export interface Refeicao {
  id: string;
  nome: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  criado_em: string;
  tipo?: TipoRefeicao;
}

export interface FavoritoRefeicao {
  nome: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  tipo: TipoRefeicao;
}

export interface ReceitaIA {
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

export const TIPO_LABELS: Record<TipoRefeicao, string> = {
  cafe:   "☕ Café",
  almoco: "🍽️ Almoço",
  jantar: "🌙 Jantar",
  lanche: "🍎 Lanche",
};

export const CONFIANCA_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  alta:  { label: "Alta precisão",   color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
  media: { label: "Precisão média",  color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  baixa: { label: "Baixa precisão",  color: "text-red-500",   bg: "bg-red-500/10 border-red-500/20"   },
};

export function getFavoritos(): FavoritoRefeicao[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("momo-fav-refeicoes") || "[]"); }
  catch { return []; }
}

export function saveFavoritos(favs: FavoritoRefeicao[]) {
  localStorage.setItem("momo-fav-refeicoes", JSON.stringify(favs.slice(0, 10)));
}
