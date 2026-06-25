"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, MailCheck, ArrowRight } from 'lucide-react';
import { SocialProofBox } from '@/components/SocialProofBox';

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
      router.refresh();
      router.push('/');
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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FAFAFA] px-4 py-12 sm:px-6 lg:px-8 text-[#111]">
      
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
        <div 
          className="h-[600px] w-[600px] rounded-full opacity-[0.03]" 
          style={{ background: "radial-gradient(circle, #ff6500 0%, transparent 70%)", filter: "blur(80px)" }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px]" style={{ animation: "fadeUp 1s cubic-bezier(0.32,0.72,0,1) both" }}>
        
        {/* Brand Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div 
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white p-1 ring-1 ring-black/5"
            style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.04)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Momo"
              className="h-full w-full rounded-[calc(2rem-0.25rem)] object-cover"
            />
          </div>
          
          <div className="inline-flex items-center rounded-full bg-[#ff6500]/10 px-3 py-1 mb-4 ring-1 ring-[#ff6500]/20">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff6500]">
              Bem-vindo de volta
            </span>
          </div>

          <h1 
            className="text-4xl font-black tracking-tight text-black"
            style={{ fontFamily: "var(--font-syne, sans-serif)" }}
          >
            Entrar no Momo
          </h1>
          <p className="mt-3 text-sm font-medium text-black/50">
            Acompanhe sua jornada com Mounjaro.
          </p>
        </div>

        {/* Double-Bezel Card Container */}
        <div 
          className="rounded-[2.5rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5 backdrop-blur-xl"
          style={{ animation: "fadeUp 1s 0.15s cubic-bezier(0.32,0.72,0,1) both" }}
        >
          <div className="rounded-[calc(2.5rem-0.375rem)] bg-white px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_8px_32px_rgba(0,0,0,0.04)] sm:px-8">

            {/* Social Proof Before Login */}
            <div className="mb-8">
              <SocialProofBox type="trust" />
            </div>

            <form className="space-y-4" onSubmit={handleEmailLogin}>
              {error && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 ring-1 ring-red-100">
                  {error}
                </div>
              )}
              {confirmationSent && (
                <div className="rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-600 ring-1 ring-green-100">
                  Enviamos um novo link de confirmação para o seu e-mail.
                </div>
              )}

              {/* Email Input - Double Bezel */}
              <div className="group rounded-[1.25rem] bg-black/[0.03] p-1 ring-1 ring-black/5 transition-all duration-500 focus-within:bg-[#ff6500]/5 focus-within:ring-[#ff6500]/20">
                <div className="relative flex items-center rounded-[calc(1.25rem-0.25rem)] bg-white px-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-500 group-focus-within:bg-white/50">
                  <Mail className="h-[18px] w-[18px] text-black/30 transition-colors duration-500 group-focus-within:text-[#ff6500]" />
                  <input
                    type="email"
                    required
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full bg-transparent pl-3 text-[15px] font-medium text-black outline-none placeholder:text-black/30"
                  />
                </div>
              </div>

              {/* Password Input - Double Bezel */}
              <div className="space-y-2">
                <div className="group rounded-[1.25rem] bg-black/[0.03] p-1 ring-1 ring-black/5 transition-all duration-500 focus-within:bg-[#ff6500]/5 focus-within:ring-[#ff6500]/20">
                  <div className="relative flex items-center rounded-[calc(1.25rem-0.25rem)] bg-white px-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-500 group-focus-within:bg-white/50">
                    <Lock className="h-[18px] w-[18px] text-black/30 transition-colors duration-500 group-focus-within:text-[#ff6500]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full bg-transparent pl-3 pr-10 text-[15px] font-medium text-black outline-none placeholder:text-black/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-black/30 transition-all hover:bg-black/5 hover:text-black/60"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end px-1">
                  <Link 
                    href="/esqueceu-senha" 
                    className="text-xs font-bold text-black/40 transition-colors hover:text-[#ff6500]"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>

              {/* Primary Action - Button in Button */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-between rounded-full bg-[#ff6500] p-1.5 pl-6 text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-60"
                style={{ boxShadow: "0 8px 24px rgba(255,101,0,0.25)" }}
              >
                <span className="text-[15px] font-bold">
                  {loading ? 'Entrando...' : 'Entrar na conta'}
                </span>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[2px] group-hover:scale-105">
                  {loading ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </div>
              </button>

              {needsConfirmation && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendingConfirmation}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-50 text-sm font-bold text-[#ff6500] transition-all hover:bg-orange-100 active:scale-[0.98] disabled:opacity-60"
                >
                  <MailCheck className="h-4 w-4" />
                  {resendingConfirmation ? 'Reenviando...' : 'Reenviar confirmação'}
                </button>
              )}
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/5" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/20">ou</span>
              <div className="h-px flex-1 bg-black/5" />
            </div>

            {/* Secondary Action - Google */}
            <button
              onClick={handleGoogleLogin}
              className="group flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-black/5 bg-white text-[15px] font-bold text-black transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.02] hover:shadow-md active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
              </svg>
              Continuar com Google
            </button>

          </div>
        </div>

        {/* Footer Links */}
        <div 
          className="mt-8 flex flex-col items-center space-y-4"
          style={{ animation: "fadeUp 1s 0.25s cubic-bezier(0.32,0.72,0,1) both" }}
        >
          <p className="text-sm font-medium text-black/50">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="font-bold text-black transition-colors hover:text-[#ff6500]">
              Criar agora
            </Link>
          </p>

          <Link
            href="/cadastro/fornecedor"
            className="text-[10px] font-bold uppercase tracking-widest text-black/30 transition-colors hover:text-[#ff6500]"
          >
            Quero ser um fornecedor parceiro
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px) scale(0.98); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
      `}</style>
    </div>
  );
}

