export const runtime = 'nodejs'

export async function GET(req: Request) {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET ?? ''
  const url = new URL(req.url)
  const qSecret = url.searchParams.get('secret') ?? ''
  return Response.json({
    envSecretLen: secret.length,
    envSecretFirst4: secret.slice(0, 4),
    qSecretLen: qSecret.length,
    match: secret === qSecret,
  })
}
