'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  plan?: 'mensal' | 'trimestral'
}

export function StripeCheckout({ plan = 'mensal' }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setClientSecret(null)
    setError(null)

    fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret)
        else setError(data.error || 'Não foi possível iniciar o pagamento.')
      })
      .catch(() => setError('Erro ao conectar com o servidor.'))
  }, [plan])

  if (error) return <p className="py-4 text-center text-sm text-danger">{error}</p>

  if (!clientSecret) return (
    <div className="flex justify-center py-8">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4"
        style={{ borderColor: 'rgba(255,101,0,0.2)', borderTopColor: '#ff6500' }}
      />
    </div>
  )

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}
