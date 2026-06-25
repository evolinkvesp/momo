import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createServiceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/**
 * POST /api/referral/accept
 *
 * Called after a new user signs up via a referral link.
 * Body: { code: string }
 *
 * Resolves the authenticated user (invited_id) from the session cookie,
 * looks up the referrer by profiles.referral_code, and upserts a row in
 * referral_invites. A unique constraint on invited_id ensures idempotency.
 */
export async function POST(req: NextRequest) {
  const routeClient = createRouteClient();
  const {
    data: { user },
  } = await routeClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let code: string | undefined;
  try {
    const body = await req.json();
    code = body?.code;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código de convite inválido" }, { status: 400 });
  }

  const db = createServiceClient();

  // Find referrer by referral_code
  const { data: referrer, error: referrerError } = await db
    .from("profiles")
    .select("id")
    .eq("referral_code", code)
    .single();

  if (referrerError || !referrer) {
    return NextResponse.json({ error: "Código de convite não encontrado" }, { status: 404 });
  }

  // Prevent self-referral
  if (referrer.id === user.id) {
    return NextResponse.json({ error: "Você não pode convidar a si mesmo" }, { status: 400 });
  }

  // Upsert — ignores conflict if invited_id already has a referral registered
  const { error: upsertError } = await db
    .from("referral_invites")
    .upsert(
      { referrer_id: referrer.id, invited_id: user.id },
      { onConflict: "invited_id", ignoreDuplicates: true },
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
