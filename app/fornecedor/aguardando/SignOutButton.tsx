"use client";

import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[rgba(255,255,255,0.5)] transition-transform active:scale-95" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <LogOut size={16} />
      Sair
    </button>
  );
}
