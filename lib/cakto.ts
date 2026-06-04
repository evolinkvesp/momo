const CAKTO_BASE = 'https://api.cakto.com.br'

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getCaktoToken(): Promise<string> {
  // Usar token em cache se ainda válido (com margem de 5min)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token
  }

  const res = await fetch(`${CAKTO_BASE}/public_api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CAKTO_CLIENT_ID!,
      client_secret: process.env.CAKTO_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) throw new Error(`Cakto auth failed: ${res.statusText}`)
  
  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000
  }
  return cachedToken.token
}

export async function caktoFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getCaktoToken()
  const res = await fetch(`${CAKTO_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Cakto API error ${res.status}: ${JSON.stringify(err)}`)
  }
  return res.json()
}
