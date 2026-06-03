"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { format, differenceInWeeks, differenceInDays, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, X, Download, Scale, HeartPulse, Activity, Trophy, TrendingDown, Star, AlertCircle, Droplets, CheckCircle2, ChevronDown, ChevronUp, TrendingUp, Minus, Target } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { PageHeader } from "@/components/PageHeader";
import toast from "react-hot-toast";

interface Medicao {
  id: string;
  data_medicao: string;
  peso_kg: number;
  imc: number;
  pressao_sistolica: number;
  pressao_diastolica: number;
  glicemia: number;
  circunferencia_abdominal_cm: number;
  humor: string;
  energia: string;
  observacoes: string;
}

interface Sintoma {
  id: string;
  data: string;
  tipo: string;
  intensidade: number;
  descricao: string;
  duracao_horas: number;
}

type Tab = "Peso" | "Pressão" | "Sintomas";

export function SaudeClient({ userId, profile, initialMedicoes, initialSintomas }: { 
  userId: string, 
  profile: any, 
  initialMedicoes: Medicao[], 
  initialSintomas: Sintoma[]
}) {
  const [medicoes, setMedicoes] = useState<Medicao[]>(initialMedicoes);
  const [sintomas, setSintomas] = useState<Sintoma[]>(initialSintomas);
  const [activeTab, setActiveTab] = useState<Tab>("Peso");
  
  const [showMedicaoForm, setShowMedicaoForm] = useState(false);
  const [showSintomaForm, setShowSintomaForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [periodoGrafico, setPeriodoGrafico] = useState<number>(30); // 30, 60, 90, 0 (all)

  // Form Medicao
  const [dataMedicao, setDataMedicao] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [peso, setPeso] = useState("");
  const [pressaoSis, setPressaoSis] = useState("");
  const [pressaoDia, setPressaoDia] = useState("");
  const [glicemia, setGlicemia] = useState("");
  const [circAbdominal, setCircAbdominal] = useState("");
  const [humor, setHumor] = useState("");
  const [energia, setEnergia] = useState("");
  const [obsMedicao, setObsMedicao] = useState("");

  // Form Sintoma
  const [dataSintoma, setDataSintoma] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [tipoSintoma, setTipoSintoma] = useState("");
  const [intensidade, setIntensidade] = useState("5");
  const [descricaoSintoma, setDescricaoSintoma] = useState("");
  const [duracao, setDuracao] = useState("");

  const handleMedicaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.from('medicoes_saude').insert({
        user_id: userId,
        data_medicao: new Date(dataMedicao).toISOString(),
        peso_kg: peso ? parseFloat(peso) : null,
        pressao_sistolica: pressaoSis ? parseInt(pressaoSis) : null,
        pressao_diastolica: pressaoDia ? parseInt(pressaoDia) : null,
        glicemia: glicemia ? parseInt(glicemia) : null,
        circunferencia_abdominal_cm: circAbdominal ? parseFloat(circAbdominal) : null,
        humor: humor || null,
        energia: energia || null,
        observacoes: obsMedicao || null
      }).select().single();
      if (error) throw error;
      setMedicoes([data, ...medicoes].sort((a, b) => new Date(b.data_medicao).getTime() - new Date(a.data_medicao).getTime()));
      setShowMedicaoForm(false);
      setPeso(""); setPressaoSis(""); setPressaoDia(""); setGlicemia(""); setCircAbdominal(""); setHumor(""); setEnergia(""); setObsMedicao("");
    } catch (error) { console.error(error); toast.error("Erro ao salvar medição."); } finally { setLoading(false); }
  };

  const handleSintomaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.from('sintomas').insert({
        user_id: userId,
        data: new Date(dataSintoma).toISOString(),
        tipo: tipoSintoma,
        intensidade: parseInt(intensidade),
        descricao: descricaoSintoma || null,
        duracao_horas: duracao ? parseInt(duracao) : null
      }).select().single();
      if (error) throw error;
      setSintomas([data, ...sintomas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      setShowSintomaForm(false);
    } catch (error) { console.error(error); toast.error("Erro ao salvar sintoma."); } finally { setLoading(false); }
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Tipo Registro,Data,Peso(kg),IMC,Pressao Sistolica,Pressao Diastolica,Glicemia,Circunferencia(cm),Humor,Energia,Tipo Sintoma,Intensidade,Duracao(h),Observacoes\n";
    medicoes.forEach(m => {
      csvContent += ["Medição", format(new Date(m.data_medicao), "dd/MM/yyyy HH:mm"), m.peso_kg || "", m.imc || "", m.pressao_sistolica || "", m.pressao_diastolica || "", m.glicemia || "", m.circunferencia_abdominal_cm || "", m.humor || "", m.energia || "", "", "", "", `"${m.observacoes || ""}"`].join(",") + "\n";
    });
    sintomas.forEach(s => {
      csvContent += ["Sintoma", format(new Date(s.data), "dd/MM/yyyy HH:mm"), "", "", "", "", "", "", "", "", s.tipo || "", s.intensidade || "", s.duracao_horas || "", `"${s.descricao || ""}"`].join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `momo_dados_saude_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pesoAtual = medicoes[0]?.peso_kg;
  const pesoInicial = medicoes[medicoes.length - 1]?.peso_kg;
  const deltaPeso = pesoAtual && pesoInicial ? (pesoAtual - pesoInicial) : 0;
  
  const imcAtual = medicoes[0]?.imc || 0;
  const classImc = imcAtual < 18.5 ? "Abaixo" : imcAtual < 25 ? "Normal" : imcAtual < 30 ? "Sobrepeso" : "Obesidade";

  const dataInicio = profile?.data_inicio_tratamento ? new Date(profile.data_inicio_tratamento) : null;
  const semanasTratamento = dataInicio ? differenceInWeeks(new Date(), dataInicio) : 0;
  const diasTratamento = dataInicio ? differenceInDays(new Date(), dataInicio) : 0;
  const mediaSemana = semanasTratamento > 0 ? (Math.abs(deltaPeso) / semanasTratamento).toFixed(1) : "0.0";

  const chartDataMedicoes = useMemo(() => {
    let data = [...medicoes].filter(m => m.peso_kg).reverse();
    if (periodoGrafico > 0) {
      const limitDate = subDays(new Date(), periodoGrafico);
      data = data.filter(m => new Date(m.data_medicao) >= limitDate);
    }
    return data.map(m => ({
      name: format(new Date(m.data_medicao), "dd/MM"),
      peso: m.peso_kg,
      pressaoSis: m.pressao_sistolica,
      pressaoDia: m.pressao_diastolica,
      fullDate: format(new Date(m.data_medicao), "dd 'de' MMM, yyyy", { locale: ptBR })
    }));
  }, [medicoes, periodoGrafico]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{payload[0].payload.fullDate}</p>
          <p className="text-lg font-black text-forest mt-1">{payload[0].value} kg</p>
        </div>
      );
    }
    return null;
  };

  const hasFirstWeight = medicoes.length > 0;
  const isOneMonth = diasTratamento >= 30;
  const isTenWeeks = semanasTratamento >= 10;
  const isLost5kg = deltaPeso <= -5;
  const isLost10kg = deltaPeso <= -10;
  const isImcOk = imcAtual > 0 && imcAtual < 30;

  return (
    <div className="space-y-6 pb-32">
      <PageHeader 
        title="Peso & Saúde" 
        action={<button onClick={exportCSV} className="text-slate-400"><Download className="h-5 w-5" /></button>}
      />

      <div className="flex gap-2 p-1 bg-slate-100 rounded-full">
        {(["Peso", "Pressão", "Sintomas"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === tab ? "bg-forest text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Peso" && (
        <div className="space-y-6 page-transition-enter">
          {/* Card Peso Atual */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peso Atual</p>
            <div className="flex items-end justify-center gap-1 mt-1">
              <span className="text-[40px] font-black tracking-tighter text-slate-900">{pesoAtual || "--"}</span>
              <span className="text-base font-bold text-slate-400 mb-2">kg</span>
            </div>
            
            {pesoInicial && (
              <div className="mt-3">
                {deltaPeso === 0 ? (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                    Mesmo peso inicial
                  </div>
                ) : deltaPeso < 0 ? (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                    <TrendingDown size={14} strokeWidth={3} />
                    {Math.abs(deltaPeso).toFixed(1)}kg desde o início
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">
                    <TrendingUp size={14} strokeWidth={3} />
                    +{Math.abs(deltaPeso).toFixed(1)}kg desde o início
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-[20px] shadow-sm border border-slate-50 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">IMC</p>
              <p className="text-base font-black text-slate-900 mt-0.5">{imcAtual ? imcAtual.toFixed(1) : "--"}</p>
              <p className="text-[10px] font-bold text-forest mt-0.5">{classImc}</p>
            </div>
            <div className="bg-white p-3 rounded-[20px] shadow-sm border border-slate-50 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Perdido</p>
              <p className="text-base font-black text-slate-900 mt-0.5">{deltaPeso < 0 ? Math.abs(deltaPeso).toFixed(1) : "0"}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">kg total</p>
            </div>
            <div className="bg-white p-3 rounded-[20px] shadow-sm border border-slate-50 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Média</p>
              <p className="text-base font-black text-slate-900 mt-0.5">{mediaSemana}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">kg / sem</p>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900">Evolução</h3>
              <div className="flex gap-1 bg-slate-50 p-1 rounded-full">
                {[
                  { label: "30d", val: 30 }, 
                  { label: "60d", val: 60 }, 
                  { label: "90d", val: 90 }, 
                  { label: "Tudo", val: 0 }
                ].map(p => (
                  <button 
                    key={p.label}
                    onClick={() => setPeriodoGrafico(p.val)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${
                      periodoGrafico === p.val ? "bg-white text-forest shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDataMedicoes}>
                  <defs>
                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1c4d2e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1c4d2e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  
                  {profile?.peso_meta && (
                    <ReferenceLine y={profile.peso_meta} stroke="#94a3b8" strokeDasharray="3 3" />
                  )}

                  <Area 
                    type="monotone" 
                    dataKey="peso" 
                    stroke="#1c4d2e" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPeso)" 
                    activeDot={{ r: 6, fill: '#1c4d2e', stroke: '#fff', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {profile?.peso_meta && (
              <div className="mt-4 flex items-center gap-2 justify-center">
                <div className="h-0.5 w-4 border-b-2 border-dashed border-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Meta: {profile.peso_meta}kg
                </p>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowMedicaoForm(true)}
            className="w-full h-[52px] bg-[#1c4d2e] text-white rounded-full font-bold text-sm shadow-lg shadow-forest/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Scale size={18} strokeWidth={2.5} />
            Pesar agora
          </button>

          {/* Conquistas Detalhadas */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Conquistas</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Primeira Pesagem */}
              <div className={`p-4 rounded-[20px] flex flex-col items-center justify-center text-center gap-2 transition-all ${hasFirstWeight ? "bg-amber-50" : "bg-slate-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${hasFirstWeight ? "bg-amber-100 text-amber-500" : "bg-slate-200 text-slate-400"}`}>
                  <Scale size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${hasFirstWeight ? "text-amber-700" : "text-slate-400"}`}>1ª Pesagem</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${hasFirstWeight ? "text-amber-600/80" : "text-slate-400"}`}>
                    {hasFirstWeight ? "Desbloqueada" : "Registre o peso"}
                  </p>
                </div>
              </div>

              {/* 5kg */}
              <div className={`p-4 rounded-[20px] flex flex-col items-center justify-center text-center gap-2 transition-all ${isLost5kg ? "bg-indigo-50" : "bg-slate-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isLost5kg ? "bg-indigo-100 text-indigo-500" : "bg-slate-200 text-slate-400"}`}>
                  <TrendingDown size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isLost5kg ? "text-indigo-700" : "text-slate-400"}`}>5kg perdidos</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${isLost5kg ? "text-indigo-600/80" : "text-slate-400"}`}>
                    {isLost5kg ? "Alcançada!" : `Faltam ${Math.max(0, 5 + deltaPeso).toFixed(1)}kg`}
                  </p>
                </div>
              </div>

              {/* 1 Mês */}
              <div className={`p-4 rounded-[20px] flex flex-col items-center justify-center text-center gap-2 transition-all ${isOneMonth ? "bg-pink-50" : "bg-slate-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isOneMonth ? "bg-pink-100 text-pink-500" : "bg-slate-200 text-slate-400"}`}>
                  <Trophy size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isOneMonth ? "text-pink-700" : "text-slate-400"}`}>1º Mês</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${isOneMonth ? "text-pink-600/80" : "text-slate-400"}`}>
                    {isOneMonth ? "Completado" : `${diasTratamento} de 30 dias`}
                  </p>
                </div>
              </div>

              {/* IMC < 30 */}
              <div className={`p-4 rounded-[20px] flex flex-col items-center justify-center text-center gap-2 transition-all ${isImcOk ? "bg-emerald-50" : "bg-slate-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isImcOk ? "bg-emerald-100 text-emerald-500" : "bg-slate-200 text-slate-400"}`}>
                  <Target size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isImcOk ? "text-emerald-700" : "text-slate-400"}`}>IMC &lt; 30</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${isImcOk ? "text-emerald-600/80" : "text-slate-400"}`}>
                    {isImcOk ? "Alcançado!" : `Atual: ${imcAtual.toFixed(1)}`}
                  </p>
                </div>
              </div>
              
              {/* 10kg */}
              <div className={`p-4 rounded-[20px] flex flex-col items-center justify-center text-center gap-2 transition-all ${isLost10kg ? "bg-blue-50" : "bg-slate-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isLost10kg ? "bg-blue-100 text-blue-500" : "bg-slate-200 text-slate-400"}`}>
                  <TrendingDown size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isLost10kg ? "text-blue-700" : "text-slate-400"}`}>10kg perdidos</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${isLost10kg ? "text-blue-600/80" : "text-slate-400"}`}>
                    {isLost10kg ? "Incrível!" : `Faltam ${Math.max(0, 10 + deltaPeso).toFixed(1)}kg`}
                  </p>
                </div>
              </div>
              
              {/* 10 semanas */}
              <div className={`p-4 rounded-[20px] flex flex-col items-center justify-center text-center gap-2 transition-all ${isTenWeeks ? "bg-purple-50" : "bg-slate-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isTenWeeks ? "bg-purple-100 text-purple-500" : "bg-slate-200 text-slate-400"}`}>
                  <Star size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isTenWeeks ? "text-purple-700" : "text-slate-400"}`}>10+ Semanas</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${isTenWeeks ? "text-purple-600/80" : "text-slate-400"}`}>
                    {isTenWeeks ? "Consistência!" : `Semana ${semanasTratamento} de 10`}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === "Pressão" && (
        <div className="space-y-6 page-transition-enter">
           <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-50">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Evolução da Pressão</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartDataMedicoes.filter(d => d.pressaoSis)}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                   <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} hide />
                   <Tooltip />
                   <Line type="monotone" dataKey="pressaoSis" stroke="#ef4444" strokeWidth={3} dot={false} />
                   <Line type="monotone" dataKey="pressaoDia" stroke="#3b82f6" strokeWidth={3} dot={false} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>
      )}

      {activeTab === "Sintomas" && (
        <div className="space-y-6 page-transition-enter">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "nausea", label: "Náusea", icon: <Droplets size={20} /> },
              { id: "fadiga", label: "Fadiga", icon: <Activity size={20} /> },
              { id: "dor_cabeca", label: "Cefaleia", icon: <AlertCircle size={20} /> },
              { id: "constipacao", label: "Constipação", icon: <Minus size={20} /> },
              { id: "tontura", label: "Tontura", icon: <Activity size={20} /> },
              { id: "insonia", label: "Insônia", icon: <Star size={20} /> }
            ].map(s => (
              <button 
                key={s.id}
                onClick={() => { setTipoSintoma(s.id); setShowSintomaForm(true); }}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-[24px] border border-slate-50 shadow-sm active:bg-forest active:text-white transition-colors group"
              >
                <div className="p-3 bg-slate-50 rounded-full group-active:bg-white/20 text-forest group-active:text-white transition-colors">
                  {s.icon}
                </div>
                <span className="text-sm font-bold">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(showMedicaoForm || showSintomaForm) && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowMedicaoForm(false); setShowSintomaForm(false); }} />
          <div className="relative z-[101] w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-xl animate-slide-up pb-10">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-6">{showMedicaoForm ? "Nova Medição" : "Registrar Sintoma"}</h2>
            
            {showMedicaoForm ? (
              <form onSubmit={handleMedicaoSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase ml-1">Peso (kg)</label>
                     <input type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} className="input-standard mt-1" placeholder="00.0" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase ml-1">Glicemia</label>
                     <input type="number" value={glicemia} onChange={e => setGlicemia(e.target.value)} className="input-standard mt-1" placeholder="mg/dL" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase ml-1">Sistólica</label>
                     <input type="number" value={pressaoSis} onChange={e => setPressaoSis(e.target.value)} className="input-standard mt-1" placeholder="120" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase ml-1">Diastólica</label>
                     <input type="number" value={pressaoDia} onChange={e => setPressaoDia(e.target.value)} className="input-standard mt-1" placeholder="80" />
                   </div>
                </div>
                <button type="submit" disabled={loading} className="w-full h-[52px] bg-[#1c4d2e] text-white rounded-full font-bold text-sm shadow-lg shadow-forest/20 mt-4 active:scale-[0.98] transition-all disabled:opacity-50">
                  {loading ? <LoadingSpinner size="sm" /> : "Salvar Medição"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSintomaSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Intensidade (1-10)</label>
                  <input type="range" min="1" max="10" value={intensidade} onChange={e => setIntensidade(e.target.value)} className="w-full accent-forest mt-2" />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                    <span>LEVE</span><span>MODERADO</span><span>INTENSO</span>
                  </div>
                </div>
                <textarea value={descricaoSintoma} onChange={e => setDescricaoSintoma(e.target.value)} className="input-standard mt-1" placeholder="Descrição (opcional)" rows={3} />
                <button type="submit" disabled={loading} className="w-full h-[52px] bg-[#1c4d2e] text-white rounded-full font-bold text-sm shadow-lg shadow-forest/20 mt-4 active:scale-[0.98] transition-all disabled:opacity-50">
                  {loading ? <LoadingSpinner size="sm" /> : "Salvar Sintoma"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
