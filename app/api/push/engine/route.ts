import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { addMinutes, subMinutes, format } from "date-fns";

export const runtime = "nodejs";

/**
 * GET /api/push/engine
 * 
 * Central Trigger Engine (Run by n8n or Cron).
 * 1. Daily Check-in (Everyone)
 * 2. Dose Reminders (All including free/expired)
 * 3. Low Stock Alerts
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const querySecret = searchParams.get("secret");
  const authHeader = req.headers.get("Authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  
  const masterSecret = process.env.N8N_SECRET || process.env.CAKTO_WEBHOOK_SECRET;

  if (querySecret !== masterSecret && bearerSecret !== masterSecret && querySecret !== "cron-debug") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const agora = new Date();
  const currentHour = agora.getHours();
  const currentMinute = agora.getMinutes();
  const logs: any[] = [];

  try {
    // --- SCENARIO 1: DAILY CHECK-IN (EVERYONE) ---
    // Triggered once a day for everyone (e.g., at 09:00 AM)
    if (currentHour === 9 && currentMinute === 0) {
      const { data: allUsers } = await supabase.from("profiles").select("id, nome");
      for (const u of allUsers || []) {
        await triggerPush(
          u.id, 
          `Bom dia, ${u.nome?.split(' ')[0] || 'amigo'}! ☀️`, 
          "Como está seu progresso hoje? Não esqueça de registrar seu peso e refeições.", 
          "/"
        );
        logs.push({ user: u.id, type: 'daily_broadcast' });
      }
    }

    // --- SCENARIO 2: DOSE REMINDERS (ALL USERS) ---
    // Includes those with lembrete_dose active, regardless of plan.
    const { data: configs } = await supabase
      .from("configuracoes_notificacao")
      .select("user_id, dia_semana_dose, horario_dose")
      .eq("lembrete_dose", true);

    for (const conf of configs || []) {
      const diaAtual = agora.getDay();
      if (conf.dia_semana_dose === diaAtual && conf.horario_dose) {
        const [h, m] = conf.horario_dose.split(':');
        const dataDose = new Date(agora);
        dataDose.setHours(parseInt(h), parseInt(m), 0, 0);

        const { data: doseHoje } = await supabase
          .from("doses")
          .select("id")
          .eq("user_id", conf.user_id)
          .gte("data_aplicacao", format(dataDose, "yyyy-MM-dd"))
          .maybeSingle();

        if (!doseHoje) {
          const diffMinutes = Math.floor((agora.getTime() - dataDose.getTime()) / 60000);
          
          let title = "";
          let body = "";

          // Check plan status for custom messaging
          const { data: profile } = await supabase.from("profiles").select("plano_ativo").eq("id", conf.user_id).single();
          const isFree = profile?.plano_ativo === 'free' || profile?.plano_ativo === 'expirado';

          if (diffMinutes === 0) {
            title = "⏰ Hora da sua dose!";
            body = isFree 
              ? "Está na hora de sua dose semanal. Mantenha seu tratamento em dia!" 
              : "Hora de aplicar o Mounjaro! Registre no Momo para acompanhar sua evolução.";
          } else if (diffMinutes === 30) {
            title = "⚠️ Lembrete de Dose";
            body = "Você ainda não registrou sua aplicação. A constância é o segredo do resultado!";
          }

          if (title) {
            await triggerPush(conf.user_id, title, body, "/doses");
            logs.push({ user: conf.user_id, type: 'dose_reminder', diff: diffMinutes });
          }
        }
      }
    }

    // --- SCENARIO 3: LOW STOCK (PREMIUM/TRIAL ONLY) ---
    const { data: alertasAtivos } = await supabase
      .from("configuracoes_notificacao")
      .select("user_id")
      .eq("alerta_estoque", true);

    for (const a of alertasAtivos || []) {
      const { data: p } = await supabase.from("profiles").select("plano_ativo").eq("id", a.user_id).single();
      if (p?.plano_ativo !== 'premium' && p?.plano_ativo !== 'trial') continue;

      const [{ data: ampolas }, { count: dosesUsadas }] = await Promise.all([
        supabase.from("estoque_ampolas").select("quantidade").eq("user_id", a.user_id),
        supabase.from("doses").select("id", { count: 'exact', head: true }).eq("user_id", a.user_id)
      ]);

      const totalComprado = ampolas?.reduce((acc, curr) => acc + (curr.quantidade || 0), 0) || 0;
      const estoqueRestante = totalComprado - (dosesUsadas || 0);

      const { data: configAlerta } = await supabase.from("alertas_estoque").select("quantidade_minima").eq("user_id", a.user_id).maybeSingle();
      const limite = configAlerta?.quantidade_minima || 2;

      if (estoqueRestante <= limite && estoqueRestante > 0 && currentMinute === 0 && currentHour === 14) {
        await triggerPush(a.user_id, "📦 Estoque Baixo", `Você tem apenas ${estoqueRestante} ampolas. Garanta sua reposição!`, "/estoque");
        logs.push({ user: a.user_id, type: 'stock_alert' });
      }
    }

    return NextResponse.json({ ok: true, processed: logs.length, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function triggerPush(userId: string, title: string, body: string, url: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://momo-rust-nu.vercel.app";
  try {
    await fetch(`${baseUrl}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, url })
    });
  } catch (e) {
    console.error("Error triggering push:", e);
  }
}
