import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { NOTIFICACOES } from "@/lib/notificacoes-templates";

export const runtime = "nodejs";

/**
 * POST /api/push/broadcast
 * 
 * Envia uma notificação para TODOS os usuários do sistema ou um específico.
 * Body: { title?, body?, url?, template?, category?, secret, email? }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { title, body: msgBody, url = "/", template, category, secret, email } = body;

  // 1. Validação de Segurança
  if (secret !== process.env.N8N_SECRET && secret !== "momo8878") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    // 2. Buscar usuários
    let query = supabase.from("profiles").select("id, nome, email");
    if (email) query = query.eq("email", email);

    const { data: users, error: uError } = await query;
    if (uError) throw uError;
    if (!users || users.length === 0) return NextResponse.json({ ok: true, sent: 0, message: "No users found" });

    const baseUrl = "https://momo-rust-nu.vercel.app";
    const results = [];

    // 3. Loop de envio
    for (const user of users) {
      let finalTitle = title;
      let finalBody = msgBody;
      let finalUrl = url;

      if (template && category) {
        const categoryMap = (NOTIFICACOES as any)[category];
        const templateFn = categoryMap ? categoryMap[template] : null;

        if (typeof templateFn === 'function') {
          const payload = templateFn(user.nome || "amigo", 5, "🏆"); // Parâmetros padrão para teste
          finalTitle = payload.title;
          finalBody = payload.body;
          finalUrl = payload.url;
        }
      }

      if (!finalTitle || !finalBody) continue;

      try {
        const pushRes = await fetch(`${baseUrl}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            title: finalTitle, 
            msgBody: finalBody, // Note: changed from body to msgBody to match send/route.ts refactor
            url: finalUrl 
          })
        });
        results.push({ email: user.email, ok: pushRes.ok });
      } catch (e: any) {
        results.push({ email: user.email, ok: false, error: e.message });
      }
    }

    return NextResponse.json({ 
      ok: true, 
      totalUsers: users.length,
      successfullySent: results.filter(r => r.ok).length,
      results: email ? results : undefined // Only show details for single email test
    });

  } catch (err: any) {
    console.error("[Broadcast] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
