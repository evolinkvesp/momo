import { caktoFetch } from '@/lib/cakto'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page') || '1'
  const status = searchParams.get('status') || ''

  const params = new URLSearchParams({ page, limit: '20' })
  if (status) params.set('status', status)

  const data = await caktoFetch(
    `/public_api/orders/?${params.toString()}`
  )
  return Response.json(data)
}
