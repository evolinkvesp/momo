import { NextResponse } from "next/server";
import { createRouteClient, createServiceClient } from "@/lib/supabase-server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, dias } = await req.json().catch(() => ({}));
  if (!action) return NextResponse.json({ error: "action required" }, { status: 400 });

  const admin = createServiceClient();
  const { data: profile } = await admin.from("profiles").select("id, nome, email").eq("id", params.id).single();
  if (!profile) return NextResponse.json({ error: "not found" }, { status: 404 });

  let update: Record<string, unknown> = {};
  if (action === "dar_vitalicio") {
    update = { acesso_vitalicio: true };
  } else if (action === "revogar_vitalicio") {
    update = { acesso_vitalicio: false };
  } else {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  await admin.from("profiles").update(update).eq("id", params.id);
  await admin.from("admin_logs").insert({
    admin_email: user.email, acao: action, entidade: "usuario", entidade_id: params.id,
    detalhes: { nome: profile.nome, email: profile.email, ...update },
  });

  return NextResponse.json({ ok: true });
}
