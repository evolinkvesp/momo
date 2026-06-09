"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ArrowRight, Check, User, Activity, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const DOSES = ['2.5', '5', '7.5', '10', '12.5', '15'];
const DIAS_SEMANA = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
];

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    data_inicio_tratamento: '',
    dose_atual_mg: '2.5',
    altura_cm: '',
    peso_inicial: '',
    peso_meta: '',
    dia_aplicacao: '0',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.nome || !formData.email || !formData.password)) {
      toast.error('Preencha os dados básicos');
      return;
    }
    if (step === 2 && (!formData.data_inicio_tratamento || !formData.altura_cm || !formData.peso_inicial)) {
      toast.error('Preencha os dados do tratamento');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step === 1) { router.push('/login'); } else { setStep(step - 1); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nome: formData.nome,
          altura_cm: Number(formData.altura_cm),
          peso_inicial: Number(formData.peso_inicial),
          peso_meta: formData.peso_meta ? Number(formData.peso_meta) : null,
          data_inicio_tratamento: formData.data_inicio_tratamento,
          dose_atual_mg: Number(formData.dose_atual_mg),
          dia_aplicacao: Number(formData.dia_aplicacao),
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      toast.success('Conta criada com sucesso!');
      setTimeout(() => { router.push('/'); router.refresh(); }, 1500);
    }
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#0d0d0d" }}>
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ background: "#111111", borderBottom: "1px solid #1e1e1e" }}
      >
        <button
          onClick={prevStep}
          className="rounded-full p-2 transition-colors"
          style={{ background: "#1a1a1a", color: "#9ca3af", border: "1px solid #2d2d2d" }}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-white">Criar conta</h1>
        <div className="w-10" />
      </header>

      {/* Progress Bar */}
      <div className="flex px-6 pt-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
              style={
                step >= s
                  ? { background: "#ff6500", color: "#fff", boxShadow: "0 4px 12px rgba(255,101,0,0.35)" }
                  : { background: "#1a1a1a", color: "#555", border: "1px solid #2d2d2d" }
              }
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className="h-0.5 flex-1 transition-all duration-300"
                style={{ background: step > s ? "#ff6500" : "#1a1a1a" }}
              />
            )}
          </div>
        ))}
      </div>

      <main className="flex-1 px-6 pt-8 overflow-y-auto">
        <div className="mx-auto max-w-md pb-32">
          {error && (
            <div
              className="mb-6 rounded-xl p-4 text-sm text-red-400 animate-fade-up"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-up">
              <StepHeader icon={<User className="h-5 w-5" />} title="Dados pessoais" subtitle="Comece sua jornada" />
              <DarkInput label="Nome completo" name="nome" value={formData.nome} onChange={handleChange} placeholder="Como deseja ser chamado?" />
              <DarkInput label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" />
              <DarkInput label="Senha" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <StepHeader icon={<Activity className="h-5 w-5" />} title="Seu tratamento" subtitle="Personalize seu acompanhamento" />
              <DarkInput label="Início do tratamento" name="data_inicio_tratamento" type="date" value={formData.data_inicio_tratamento} onChange={handleChange} />

              <div>
                <label className="mb-2 block text-sm font-bold text-white">Dose atual (mg)</label>
                <div className="grid grid-cols-3 gap-2">
                  {DOSES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({ ...formData, dose_atual_mg: d })}
                      className="rounded-xl py-3 text-sm font-bold transition-all duration-200"
                      style={
                        formData.dose_atual_mg === d
                          ? { background: "#ff6500", color: "#fff", boxShadow: "0 4px 12px rgba(255,101,0,0.35)", transform: "scale(1.02)" }
                          : { background: "#1a1a1a", color: "#9ca3af", border: "1px solid #2d2d2d" }
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DarkInput label="Altura (cm)" name="altura_cm" type="number" value={formData.altura_cm} onChange={handleChange} placeholder="Ex: 175" />
                <DarkInput label="Peso inicial (kg)" name="peso_inicial" type="number" value={formData.peso_inicial} onChange={handleChange} placeholder="Ex: 95.5" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-up">
              <StepHeader icon={<Target className="h-5 w-5" />} title="Metas e rotina" subtitle="Onde você quer chegar?" />
              <DarkInput label="Peso meta (opcional)" name="peso_meta" type="number" value={formData.peso_meta} onChange={handleChange} placeholder="Ex: 70.0" />

              <div>
                <label className="mb-2 block text-sm font-bold text-white">Dia da aplicação</label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, dia_aplicacao: String(d.id) })}
                      className="flex-1 min-w-[60px] rounded-full py-2.5 text-xs font-bold transition-all duration-200"
                      style={
                        formData.dia_aplicacao === String(d.id)
                          ? { background: "#ff6500", color: "#fff", boxShadow: "0 4px 12px rgba(255,101,0,0.3)", transform: "scale(1.05)" }
                          : { background: "#1a1a1a", color: "#9ca3af", border: "1px solid #2d2d2d" }
                      }
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs" style={{ color: "#555" }}>Enviaremos lembretes neste dia para você não esquecer a dose.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer
        className="fixed bottom-0 left-0 right-0 p-6"
        style={{ background: "#111111", borderTop: "1px solid #1e1e1e" }}
      >
        <div className="mx-auto max-w-md">
          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold text-white transition-all hover:scale-[1.01] active:scale-95"
              style={{ background: "linear-gradient(135deg, #ff6500, #cc4c00)", boxShadow: "0 4px 20px rgba(255,101,0,0.4)" }}
            >
              Próximo
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #ff6500, #cc4c00)", boxShadow: "0 4px 20px rgba(255,101,0,0.4)" }}
            >
              {loading ? 'Criando conta...' : 'Concluir e entrar'}
              {!loading && <Check className="h-5 w-5" />}
            </button>
          )}
        </div>
        <p className="mt-4 text-center text-sm" style={{ color: "#555" }}>
          Já tem uma conta?{' '}
          <Link href="/login" className="font-bold hover:underline" style={{ color: "#ff6500" }}>
            Entrar
          </Link>
        </p>
      </footer>
    </div>
  );
}

function StepHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl shrink-0"
        style={{ background: "rgba(255,101,0,0.12)", color: "#ff6500", border: "1px solid rgba(255,101,0,0.2)" }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm" style={{ color: "#777" }}>{subtitle}</p>
      </div>
    </div>
  );
}

function DarkInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-white">{label}</label>
      <input
        {...props}
        className="block h-12 w-full rounded-xl px-4 text-sm text-white outline-none transition-all"
        style={{ background: "#1a1a1a", border: "1px solid #2d2d2d" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#ff6500"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,101,0,0.1)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#2d2d2d"; e.currentTarget.style.boxShadow = "none"; }}
      />
    </div>
  );
}
