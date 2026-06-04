import { NextResponse } from "next/server";
import { createRouteClient, createServiceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/**
 * POST /api/conta/excluir
 *
 * Permanently deletes the signed-in user's auth account. The user is resolved
 * from the session cookie (never trusted from the request body), so a caller
 * can only ever delete themselves. The actual deletion uses the privileged
 * service-role client (supabase.auth.admin.deleteUser); the ON DELETE CASCADE
 * foreign keys on every table remove the user's data along with the account.
 */
export async function POST() {
  const supabase = createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Exclusão de conta não está configurada no servidor." },
      { status: 500 },
    );
  }

  const admin = createServiceClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
