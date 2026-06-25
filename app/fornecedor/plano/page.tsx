import { redirect } from 'next/navigation'
import { createRouteClient, createServiceClient } from '@/lib/supabase-server'
import { FornecedorPlanoClient } from './FornecedorPlanoClient'

export const dynamic = 'force-dynamic'

export default async function FornecedorPlanoPage() {
  const supabaseAuth = createRouteClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = createServiceClient()

  const { data: fornecedor } = await supabase
    .from('fornecedores')
    .select('id, razao_social, nome_fantasia')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!fornecedor) {
    redirect('/fornecedor/cadastro')
  }

  const { data: assinatura } = await supabase
    .from('fornecedor_assinaturas')
    .select('status, current_period_end, cancel_at_period_end, inadimplente_desde')
    .eq('fornecedor_id', fornecedor.id)
    .maybeSingle()

  return (
    <FornecedorPlanoClient
      fornecedor={fornecedor}
      assinatura={assinatura ?? null}
    />
  )
}
