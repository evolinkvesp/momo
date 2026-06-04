import { caktoFetch } from '@/lib/cakto'

export async function POST(req: Request) {
  // Buscar produtos cadastrados na Cakto
  const produtos = await caktoFetch('/public_api/products/')
  const productIds = produtos.results.map((p: any) => p.id)

  // Criar webhook para todos os eventos relevantes
  const webhook = await caktoFetch('/public_api/webhook/', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Momo App — Eventos de Pagamento',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cakto/webhook`,
      products: productIds,
      events: [
        'purchase_approved',
        'purchase_refused',
        'refund',
        'subscription_created',
        'subscription_canceled',
        'subscription_renewed',
        'subscription_renewal_refused',
      ],
    }),
  })

  return Response.json({ 
    sucesso: true, 
    webhook_id: webhook.id,
    secret: webhook.fields?.secret 
  })
}
