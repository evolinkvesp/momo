"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowLeft, CheckCircle2, Droplets } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EsqueceuSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface rounded-[32px] p-8 shadow-card border border-surface-border"
      >
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-text-dim hover:text-ember transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-bold">Voltar ao login</span>
        </Link>

        {sent ? (
          <div className="text-center space-y-6 py-4">
            <div className="h-20 w-20 bg-success/10 text-success rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-text tracking-tight">Verifique seu e-mail</h1>
              <p className="text-sm text-muted leading-relaxed px-4">
                Enviamos um link de redefinição para <strong className="text-text">{email}</strong>. 
                Verifique sua caixa de entrada e spam.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember/10 mb-4">
                <Droplets className="h-6 w-6 text-ember fill-ember/20" />
              </div>
              <h1 className="text-2xl font-black text-text tracking-tight leading-tight">Recuperar acesso</h1>
              <p className="text-sm text-muted leading-relaxed">
                Digite seu e-mail para receber as instruções de redefinição de senha.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-4">Seu e-mail</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block h-[52px] w-full rounded-full border-none bg-surface-mid pl-11 pr-4 text-sm text-text shadow-sm transition-all focus:ring-2 focus:ring-ember/20 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-danger/5 border border-danger/20 p-4 text-sm text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-ember text-white rounded-full font-bold text-base shadow-lg shadow-ember/20 active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--color-ember), var(--color-ember-dim))", boxShadow: "var(--shadow-ember)" }}
              >
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
