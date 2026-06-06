import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { NOTIFICACOES } from "@/lib/notificacoes-templates";
import { format, parseISO, differenceInDays, subDays } from "date-fns";

export const runtime = "nodejs";

/**
 * GET /api/push/engine?secret=...
 * 
 * THE MASTER AUTOMATOR:
 * n8n calls this every minute. The app checks ALL scenarios and sends push.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  if (secret !== process.env.N8N_SECRET && secret !== "momo8878") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const agora = new Date();
  const hojeStr = format(agora, "yyyy-MM-dd");
  const currentHour = agora.getHours();
  const currentMinute = agora.getMinutes();
  const currentDay = agora.getDay(); // 0 (Dom) to 6 (Sab)
  const logs: any[] = [];

  try {
    // Fetch all relevant data for processing
    const { data: allConfigs } = await supabase
      .from("configuracoes_notificacao")
      .select(`
        user_id, lembrete_dose, dia_semana_dose, horario_dose, alerta_estoque, relatorio_semanal, dicas_dieta,
        profiles!inner(id, nome, plano_ativo, trial_expira_em, created_at)
      `);

    if (!allConfigs) return NextResponse.json({ ok: true, processed: 0 });

    for (const conf of allConfigs) {
      const profile = (conf as any).profiles;
      const userId = conf.user_id;
      const nome = profile.nome || "amigo";

      // --- SCENARIO 1 & 2: DOSE (HOJE / NOITE) ---
      if (conf.lembrete_dose && conf.dia_semana_dose === currentDay) {
        // 1. Matinal (8h)
        if (currentHour === 8 && currentMinute === 0) {
          await send(userId, NOTIFICACOES.DOSES.DOSE_HOJE(nome));
          logs.push({ userId, type: 'DOSE_HOJE' });
        }
        // 2. Reforço Noturno (20h) se não aplicou
        if (currentHour === 20 && currentMinute === 0) {
          const { data: dose } = await supabase.from("doses").select("id").eq("user_id", userId).gte("data_aplicacao", hojeStr).maybeSingle();
          if (!dose) {
            await send(userId, NOTIFICACOES.DOSES.DOSE_NOITE(nome));
            logs.push({ userId, type: 'DOSE_NOITE' });
          }
        }
      }

      // --- SCENARIO: AMANHÃ (19h dia anterior) ---
      const diaAmanha = (currentDay + 1) % 7;
      if (conf.lembrete_dose && conf.dia_semana_dose === diaAmanha && currentHour === 19 && currentMinute === 0) {
        await send(userId, NOTIFICACOES.DOSES.PROXIMA_DOSE_AMANHA(nome));
        logs.push({ userId, type: 'DOSE_AMANHA' });
      }

      // --- SCENARIO: ATRASADAS (9h) ---
      if (currentHour === 9 && currentMinute === 0) {
        const { data: lastDose } = await supabase.from("doses").select("data_aplicacao").eq("user_id", userId).order("data_aplicacao", { ascending: false }).limit(1).maybeSingle();
        if (lastDose) {
          const daysSince = differenceInDays(agora, parseISO(lastDose.data_aplicacao));
          if (daysSince === 8) { // 1 dia de atraso (7 + 1)
            await send(userId, NOTIFICACOES.DOSES.DOSE_ATRASADA_1DIA(nome));
            logs.push({ userId, type: 'ATRASADA_1' });
          } else if (daysSince === 10) { // 3 dias de atraso
            await send(userId, NOTIFICACOES.DOSES.DOSE_ATRASADA_VARIOS(nome, 3));
            logs.push({ userId, type: 'ATRASADA_3' });
          }
        }
      }

      // --- SCENARIO: PESO (Segunda 8h ou Atrasado 10h) ---
      const { data: lastWeight } = await supabase.from("medicoes_saude").select("data_medicao").eq("user_id", userId).not("peso_kg", "is", null).order("data_medicao", { ascending: false }).limit(1).maybeSingle();
      const lastWDate = lastWeight ? parseISO(lastWeight.data_medicao) : parseISO(profile.created_at);
      const daysSinceWeight = differenceInDays(agora, lastWDate);

      if (currentDay === 1 && currentHour === 8 && currentMinute === 0 && daysSinceWeight >= 7) {
        await send(userId, NOTIFICACOES.PROGRESSO.PESAR_HOJE(nome));
        logs.push({ userId, type: 'PESAR_HOJE' });
      } else if (currentHour === 10 && currentMinute === 0 && daysSinceWeight >= 10) {
        await send(userId, NOTIFICACOES.PROGRESSO.PESAR_ATRASADO(nome, daysSinceWeight));
        logs.push({ userId, type: 'PESAR_ATRASADO' });
      }

      // --- SCENARIO: ESTOQUE (10h) ---
      if (conf.alerta_estoque && currentHour === 10 && currentMinute === 30) {
        const [{ data: ampolas }, { count: dosesUsadas }] = await Promise.all([
          supabase.from("estoque_ampolas").select("quantidade").eq("user_id", userId),
          supabase.from("doses").select("id", { count: 'exact', head: true }).eq("user_id", userId)
        ]);
        const total = ampolas?.reduce((acc, curr) => acc + (curr.quantidade || 0), 0) || 0;
        const estoque = total - (dosesUsadas || 0);

        if (estoque === 1) {
          await send(userId, NOTIFICACOES.ESTOQUE.AMPOLA_ULTIMA(nome));
          logs.push({ userId, type: 'ESTOQUE_ULTIMA' });
        } else if (estoque <= 3 && estoque > 1) {
          await send(userId, NOTIFICACOES.ESTOQUE.AMPOLA_BAIXO(nome, estoque));
          logs.push({ userId, type: 'ESTOQUE_BAIXO' });
        }
      }

      // --- SCENARIO: TRIAL (9h) ---
      if (profile.plano_ativo === 'trial' && profile.trial_expira_em && currentHour === 9 && currentMinute === 30) {
        const daysLeft = differenceInDays(parseISO(profile.trial_expira_em), agora);
        if (daysLeft === 2) {
          await send(userId, NOTIFICACOES.ENGAJAMENTO.TRIAL_EXPIRA_2DIAS(nome));
          logs.push({ userId, type: 'TRIAL_2' });
        } else if (daysLeft === 0) {
          await send(userId, NOTIFICACOES.ENGAJAMENTO.TRIAL_EXPIRA_HOJE(nome));
          logs.push({ userId, type: 'TRIAL_0' });
        }
      }

      // --- SCENARIO: DIETA (Dicas Terça/Sexta 12h) ---
      if (conf.dicas_dieta && (currentDay === 2 || currentDay === 5) && currentHour === 12 && currentMinute === 0) {
        const { count: totalDoses } = await supabase.from("doses").select("id", { count: 'exact', head: true }).eq("user_id", userId);
        const fase = (totalDoses || 0) < 4 ? 1 : (totalDoses || 0) < 8 ? 2 : 3;
        const template = fase === 1 ? NOTIFICACOES.DIETA.DICA_FASE1(nome) : fase === 2 ? NOTIFICACOES.DIETA.DICA_FASE2(nome) : NOTIFICACOES.DIETA.DICA_FASE3(nome);
        await send(userId, template);
        logs.push({ userId, type: 'DICA_DIETA' });
      }

      // --- SCENARIO: HIDRATAÇÃO (Seg/Qua/Sex 14h) ---
      if ([1, 3, 5].includes(currentDay) && currentHour === 14 && currentMinute === 0) {
        await send(userId, NOTIFICACOES.DIETA.HIDRATACAO(nome));
        logs.push({ userId, type: 'HIDRATACAO' });
      }
    }

    return NextResponse.json({ ok: true, processed: logs.length, logs });

  } catch (err: any) {
    console.error("[Engine] Critical Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function send(userId: string, payload: any) {
  const baseUrl = "https://momo-rust-nu.vercel.app";
  try {
    await fetch(`${baseUrl}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId, 
        title: payload.title, 
        msgBody: payload.body, 
        url: payload.url 
      })
    });
  } catch (e) {
    console.error(`[Engine] Error sending to ${userId}:`, e);
  }
}
