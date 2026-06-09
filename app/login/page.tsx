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
    <div className="flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
      {/* Top splash area */}
      <div
        className="relative flex flex-col items-center justify-center px-6 pt-20 pb-24 text-center overflow-hidden"
        style={{ minHeight: "45vh" }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--color-ember-glow-strong) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="z-10 flex flex-col items-center gap-3 animate-fade-up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Momo"
            width={88}
            height={88}
            className="rounded-[24px]"
            style={{ boxShadow: "var(--shadow-ember)" }}
          />
          <div className="mt-1 text-center">
            <h1 className="text-5xl font-black tracking-tighter text-text" style={{ fontFamily: "var(--font-syne, sans-serif)" }}>
              Momo
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] mt-1 text-ember">
              Sua melhor versão
            </p>
          </div>
        </div>

        <p
          className="z-10 mt-6 max-w-[260px] text-base leading-relaxed animate-fade-up [animation-delay:200ms] text-muted"
        >
          Acompanhamento inteligente para sua jornada com Mounjaro
        </p>

        <div className="z-10 mt-4 flex gap-1.5 animate-fade-up [animation-delay:400ms]">
          <div className="h-1.5 w-5 rounded-full bg-ember" />
          <div className="h-1.5 w-2 rounded-full bg-ember/40" />
          <div className="h-1.5 w-2 rounded-full bg-ember/20" />
        </div>
      </div>

      {/* Card */}
      <div
        className="relative z-20 -mt-8 flex flex-1 flex-col rounded-t-[36px] px-8 pt-10 pb-16 animate-fade-up [animation-delay:500ms] shadow-2xl"
        style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-surface-border)" }}
      >
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-2xl font-bold text-text">Bem-vindo de volta</h2>
          <p className="text-sm mt-1 text-text-dim">Entre na sua conta para continuar</p>

          <form className="mt-8 space-y-4" onSubmit={handleEmailLogin}>
            {error && (
              <div className="rounded-xl p-4 text-sm text-danger animate-fade-up bg-danger/5 border border-danger/20">
                {error}
              </div>
            )}
            {confirmationSent && (
              <div className="rounded-xl p-4 text-sm animate-fade-up bg-success/5 border border-success/20 text-success">
                Enviamos um novo link de confirmação para o seu e-mail.
              </div>
            )}

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-dim">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block h-[52px] w-full rounded-full pl-11 pr-4 py-3 text-sm text-text outline-none transition-all"
                style={{
                  background: "var(--color-surface-mid)",
                  border: "1px solid var(--color-surface-border)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-ember)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-ember-glow)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-surface-border)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div className="space-y-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-dim">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block h-[52px] w-full rounded-full pl-11 pr-12 py-3 text-sm text-text outline-none transition-all"
                  style={{
                    background: "var(--color-surface-mid)",
                    border: "1px solid var(--color-surface-border)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-ember)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-ember-glow)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-surface-border)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 transition-colors text-text-dim"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-end px-2">
                <Link href="/esqueceu-senha" className="text-[13px] font-bold hover:underline text-ember">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-[52px] w-full items-center justify-center rounded-full text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--color-ember), var(--color-ember-dim))",
                boxShadow: "var(--shadow-ember)",
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {needsConfirmation && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendingConfirmation}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-all disabled:opacity-70"
                style={{ background: "var(--color-ember-glow)", color: "var(--color-ember-light)", border: "1px solid rgba(255,101,0,0.2)" }}
              >
                <MailCheck className="h-4 w-4" />
                {resendingConfirmation ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
              </button>
            )}
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest text-text-dim">
                <span className="px-4" style={{ background: "var(--color-surface)" }}>ou</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-6 flex h-[52px] w-full items-center justify-center gap-3 rounded-full text-sm font-semibold text-text transition-all active:scale-[0.98]"
              style={{ background: "var(--color-surface-mid)", border: "1px solid var(--color-surface-border)" }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
              </svg>
              Entrar com Google
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-text-dim">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="font-bold hover:underline text-ember">
              Cadastre-se
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link href="/cadastro/fornecedor" className="text-xs font-bold uppercase tracking-widest transition-colors text-text-dim hover:text-ember">
              Quero ser um fornecedor parceiro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
