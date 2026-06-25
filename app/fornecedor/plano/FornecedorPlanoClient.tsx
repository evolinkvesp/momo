'use client'

import { useState } from 'react'
import { CreditCard, AlertTriangle, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

type Assinatura = {
  status: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  inadimplente_desde: string | null
} | null

type Fornecedor = {
  id: string
  razao_social: string
  nome_fantasia: string | null
}

type Props = {
  fornecedor: Fornecedor
  assinatura: Assinatura
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ativa: {
    label: 'Ativa',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    icon: <CheckCircle2 size={14} />,
  },
  inadimplente: {
    label: 'Inadimplente',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    icon: <AlertTriangle size={14} />,
  },
  cancelada: {
    label: 'Cancelada',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.1)',
    icon: <XCircle size={14} />,
  },
  pendente: {
    label: 'Pendente',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    icon: <Clock size={14} />,
  },
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function FornecedorPlanoClient({ fornecedor, assinatura }: Props) {
  const [loadingPortal, setLoadingPortal] = useState(false)

  const status = assinatura?.status ?? 'pendente'
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendente

  const handleManageSubscription = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/fornecedor/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Erro ao abrir portal de assinatura.')
        setLoadingPortal(false)
      }
    } catch {
      toast.error('Erro ao conectar com o serviço de pagamento.')
      setLoadingPortal(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col px-6 py-10"
      style={{ background: '#0d0d0d', color: '#f5f5f5', fontFamily: 'Outfit, sans-serif' }}
    >
      <div className="mx-auto w-full max-w-md pb-20 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-2">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shrink-0"
            style={{ background: 'rgba(255,101,0,0.1)', color: '#ff6500' }}
          >
            <CreditCard size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black">Meu Plano</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
              {fornecedor.nome_fantasia || fornecedor.razao_social}
            </p>
          </div>
        </div>

        {/* Inadimplente alert */}
        {status === 'inadimplente' && (
          <div
            className="rounded-2xl p-4 flex gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#ef4444' }}>Pagamento com problema</p>
              <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                Não conseguimos processar seu último pagamento. Atualize seu método de pagamento para evitar a suspensão do seu perfil na plataforma.
              </p>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        <div
          className="rounded-[24px] p-6 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: '#6b7280' }}
            >
              Status da Assinatura
            </p>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#9ca3af' }}>Plano</span>
              <span className="text-sm font-semibold">Fornecedor — R$99/mês</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#9ca3af' }}>Próximo vencimento</span>
              <span className="text-sm font-semibold">
                {formatDate(assinatura?.current_period_end ?? null)}
              </span>
            </div>

            {assinatura?.cancel_at_period_end && (
              <div
                className="rounded-xl px-3 py-2.5 text-xs"
                style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                Cancelamento agendado ao fim do período atual.
              </div>
            )}
          </div>

          <div
            className="h-px"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />

          <button
            onClick={handleManageSubscription}
            disabled={loadingPortal || !assinatura}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
            style={{
              background: loadingPortal
                ? 'rgba(255,101,0,0.3)'
                : 'linear-gradient(135deg, #ff6500, #cc5200)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(255,101,0,0.25)',
            }}
          >
            {loadingPortal ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Abrindo portal...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                Gerenciar assinatura
              </>
            )}
          </button>

          {!assinatura && (
            <p className="text-xs text-center" style={{ color: '#6b7280' }}>
              Nenhuma assinatura encontrada. Finalize o cadastro para ativar.
            </p>
          )}
        </div>

        {/* Info */}
        <div
          className="rounded-2xl p-4 flex gap-3"
          style={{ background: 'rgba(255,101,0,0.05)', border: '1px solid rgba(255,101,0,0.15)' }}
        >
          <CreditCard size={16} style={{ color: '#ff6500', flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
            Gerencie seu método de pagamento, visualize faturas e cancele sua assinatura diretamente pelo portal Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}
