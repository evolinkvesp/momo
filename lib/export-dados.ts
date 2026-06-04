"use client";

/**
 * Client-side data export. Reads the signed-in user's records (RLS limits the
 * query to their own rows) and triggers a CSV download covering doses, health
 * measurements and symptoms.
 */

import { supabase } from "@/lib/supabase";

function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const v = cell == null ? "" : String(cell);
          // Quote when the value contains a comma, quote or newline.
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(","),
    )
    .join("\r\n");
}

export async function exportarDadosCsv(userId: string): Promise<void> {
  const [doses, medicoes, sintomas] = await Promise.all([
    supabase
      .from("doses")
      .select("data_aplicacao, dose_mg, local_aplicacao, lado_corpo")
      .eq("user_id", userId)
      .order("data_aplicacao", { ascending: false }),
    supabase
      .from("medicoes_saude")
      .select("data_medicao, peso_kg, imc, pressao_sistolica, pressao_diastolica, glicemia")
      .eq("user_id", userId)
      .order("data_medicao", { ascending: false }),
    supabase
      .from("sintomas")
      .select("data, tipo, intensidade, descricao")
      .eq("user_id", userId)
      .order("data", { ascending: false }),
  ]);

  const rows: (string | number | null | undefined)[][] = [];

  rows.push(["DOSES"]);
  rows.push(["Data", "Dose (mg)", "Local", "Lado do corpo"]);
  (doses.data ?? []).forEach((d) =>
    rows.push([d.data_aplicacao, d.dose_mg, d.local_aplicacao, d.lado_corpo]),
  );
  rows.push([]);

  rows.push(["MEDIÇÕES DE SAÚDE"]);
  rows.push(["Data", "Peso (kg)", "IMC", "Pressão sistólica", "Pressão diastólica", "Glicemia"]);
  (medicoes.data ?? []).forEach((m) =>
    rows.push([
      m.data_medicao,
      m.peso_kg,
      m.imc,
      m.pressao_sistolica,
      m.pressao_diastolica,
      m.glicemia,
    ]),
  );
  rows.push([]);

  rows.push(["SINTOMAS"]);
  rows.push(["Data", "Tipo", "Intensidade", "Descrição"]);
  (sintomas.data ?? []).forEach((s) =>
    rows.push([s.data, s.tipo, s.intensidade, s.descricao]),
  );

  // BOM so Excel reads UTF-8 accents correctly.
  const csv = "﻿" + toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `momo-meus-dados-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
