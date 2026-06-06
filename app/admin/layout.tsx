import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase-server";
import { AdminNav } from "@/components/AdminNav";
import "./admin.css";

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
};

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "evolinkbr@gmail.com";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || session.user.email !== ADMIN_EMAIL) {
    redirect("/login");
  }

  const admin = createServiceClient();
  const { count: pendingCount } = await admin
    .from("fornecedores")
    .select("id", { count: "exact", head: true })
    .eq("status", "pendente");

  return (
    <div data-portal="admin" className="min-h-screen bg-[#0d0d0d] text-white">
      <AdminNav pendingCount={pendingCount || 0} />
      <main className="md:pl-60 pb-[100px] md:pb-12">
        <div className="max-w-6xl mx-auto px-5 pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
