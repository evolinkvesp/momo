import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ConviteClient } from "./ConviteClient";

export const dynamic = "force-dynamic";

export default async function ConvitePage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const [profileResult, countResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", session.user.id)
      .single(),

    supabase
      .from("referral_invites")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", session.user.id),
  ]);

  const referralCode = profileResult.data?.referral_code ?? "";
  const inviteCount = countResult.count ?? 0;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      {/* Top orange logo */}
      <div className="flex flex-col items-center px-6 pt-12 pb-6 text-center">
        <img
          src="/logo-momo.png"
          alt="Momo"
          className="mb-5 h-16 w-16 rounded-full"
        />

        {/* Badge */}
        <div className="mb-4 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span
            className="text-[11px] font-black uppercase tracking-[0.15em]"
            style={{ color: "#FF6500" }}
          >
            Desbloqueie o acesso
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[2rem] font-black leading-tight tracking-tight text-gray-900">
          Continue usando o Momo{" "}
          <span style={{ color: "#FF6500" }}>de graça</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 max-w-xs text-[0.9rem] leading-relaxed text-gray-500">
          Convide 3 amigos que usam Mounjaro e continue com acesso completo — sem pagar nada.
        </p>
      </div>

      {/* Main content */}
      <main className="flex-1 px-5 pb-10">
        <div className="mx-auto max-w-md space-y-4">
          {referralCode ? (
            <ConviteClient referralCode={referralCode} inviteCount={inviteCount} />
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">
                Seu código está sendo gerado. Tente em instantes.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
