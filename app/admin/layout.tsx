import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { redirect } from "next/navigation";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { AdminNav } from "@/components/AdminNav";

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    redirect("/login");
  }

  return (
    <div data-portal="admin" className="min-h-screen bg-bg text-text transition-colors duration-300">
      <AdminNav />
      <main className="md:pl-60 min-h-screen">
        <div className="w-full px-6 pt-8 pb-32 md:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
