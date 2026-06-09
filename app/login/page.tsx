"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, MailCheck } from 'lucide-react';

const getFriendlyLoginError = (error: { code?: string; message?: string; status?: number }) => {
  const code = error.code?.toLowerCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return { message: "Seu e-mail ainda não foi confirmado. Confirme a caixa de entrada e tente novamente.", needsConfirmation: true };
  }
  if (code === "invalid_credentials" || message.includes("invalid login credentials") || message.includes("login credentials") || error.status === 400) {
    return { message: "E-mail ou senha incorretos. Confira os dados e tente novamente.", needsConfirmation: false };
  }
  if (error.status === 429) {
    return { message: "Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.", needsConfirmation: false };
  }
  return { message: error.message ?? "Não foi possível entrar. Tente novamente em instantes.", needsConfirmation: false };
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsConfirmation(false);
    setConfirmationSent(false);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const friendlyError = getFriendlyLoginError(error);
      setError(friendlyError.message);
      setNeedsConfirmation(friendlyError.needsConfirmation);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) { setError("Digite seu e-mail para reenviar a confirmação."); return; }
    setResendingConfirmation(true);
    setError(null);
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${window.location.origin}/login` } });
    if (error) { setError(error.message); } else { setConfirmationSent(true); }
    setResendingConfirmation(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setError(error.message); }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden" style={{ background: "#080808" }}>

      {/* ── Hero ── */}
      <div className="relative flex flex-col items-center justify-end px-6 pb-16 pt-20 text-center" style={{ minHeight: "52vh" }}>

        {/* Deep ember ground glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(255,101,0,0.18) 0%, transparent 70%)",
          }}
        />
        {/* Secondary hot spot behind logo */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,101,0,0.10) 0%, transparent 70%)" }}
        />
        {/* Subtle vignette top */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, transparent 40%)" }}
        />

        {/* Logo + wordmark */}
        <div className="relative z-10 flex flex-col items-center" style={{ animation: "loginFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Momo"
            width={108}
            height={108}
            className="rounded-[28px] select-none"
            style={{
              boxShadow: "0 0 0 1px rgba(255,101,0,0.15), 0 12px 48px rgba(255,101,0,0.30), 0 4px 16px rgba(0,0,0,0.6)",
              animation: "logoFloat 4s ease-in-out infinite",
            }}
          />

          <div className="mt-5">
            <h1
              className="text-[52px] font-black leading-none tracking-[-3px] text-white"
              style={{ fontFamily: "var(--font-syne, sans-serif)", letterSpacing: "-0.06em" }}
            >
              momo
            </h1>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: "#ff6500" }}>
              sua melhor versão
            </p>
          </div>

          {/* Decorative ember bar */}
          <div className="mt-6 flex items-center gap-2">
            <div className="h-px w-10 rounded-full" style={{ background: "linear-gradient(to right, transparent, rgba(255,101,0,0.5))" }} />
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#ff6500", boxShadow: "0 0 6px rgba(255,101,0,0.8)" }} />
            <div className="h-px w-10 rounded-full" style={{ background: "linear-gradient(to left, transparent, rgba(255,101,0,0.5))" }} />
          </div>

          <p
            className="mt-5 max-w-[240px] text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)", animation: "loginFadeUp 0.7s 0.15s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            Acompanhamento inteligente para sua jornada com Mounjaro
          </p>
        </div>
      </div>

      {/* ── Form card ── */}
      <div
        className="relative z-20 flex flex-1 flex-col rounded-t-[40px] px-7 pt-10 pb-12"
        style={{
          background: "linear-gradient(180deg, #111111 0%, #0d0d0d 100%)",
          borderTop: "1px solid rgba(255,101,0,0.12)",
          animation: "loginFadeUp 0.8s 0.25s cubic-bezier(0.22,1,0.36,1) both",
          boxShadow: "0 -24px 60px rgba(255,101,0,0.05)",
        }}
      >
        {/* Top notch accent */}
        <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full" style={{ background: "rgba(255,101,0,0.25)" }} />

        <div className="mx-auto w-full max-w-sm">
          <h2
            className="text-xl font-black text-white"
            style={{ fontFamily: "var(--font-syne, sans-serif)", letterSpacing: "-0.02em" }}
          >
            Bem-vindo de volta
          </h2>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Entre na sua conta para continuar</p>

          <form className="mt-8 space-y-3" onSubmit={handleEmailLogin}>
            {error && (
              <div className="rounded-2xl p-4 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                {error}
              </div>
            )}
            {confirmationSent && (
              <div className="rounded-2xl p-4 text-sm" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                Enviamos um novo link de confirmação para o seu e-mail.
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
              <input
                type="email"
                required
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block h-[52px] w-full rounded-2xl pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-[rgba(255,255,255,0.2)]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,101,0,0.5)";
                  e.currentTarget.style.background = "rgba(255,101,0,0.04)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,101,0,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block h-[52px] w-full rounded-2xl pl-11 pr-12 text-sm text-white outline-none transition-all placeholder:text-[rgba(255,255,255,0.2)]"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,101,0,0.5)";
                    e.currentTarget.style.background = "rgba(255,101,0,0.04)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,101,0,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 transition-opacity"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2 flex justify-end px-1">
                <Link href="/esqueceu-senha" className="text-[12px] font-bold transition-opacity hover:opacity-100" style={{ color: "#ff6500", opacity: 0.85 }}>
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-[52px] w-full items-center justify-center rounded-2xl text-[15px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: loading
                  ? "rgba(255,101,0,0.5)"
                  : "linear-gradient(135deg, #ff6500, #cc4c00)",
                boxShadow: loading ? "none" : "0 8px 32px rgba(255,101,0,0.35)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>

            {needsConfirmation && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendingConfirmation}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all disabled:opacity-60"
                style={{
                  background: "rgba(255,101,0,0.08)",
                  border: "1px solid rgba(255,101,0,0.2)",
                  color: "#ff7a1a",
                }}
              >
                <MailCheck className="h-4 w-4" />
                {resendingConfirmation ? 'Reenviando...' : 'Reenviar confirmação de e-mail'}
              </button>
            )}
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>ou</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
            </svg>
            Entrar com Google
          </button>

          {/* Footer links */}
          <p className="mt-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="font-bold text-white transition-opacity hover:opacity-80">
              Cadastre-se
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link
              href="/cadastro/fornecedor"
              className="text-[11px] font-bold uppercase tracking-widest transition-colors"
              style={{ color: "rgba(255,101,0,0.5)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ff6500"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,101,0,0.5)"; }}
            >
              Quero ser um fornecedor parceiro
            </Link>
          </div>
        </div>
      </div>

      {/* Global keyframes injected inline */}
      <style>{`
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
