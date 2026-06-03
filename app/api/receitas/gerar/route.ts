import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabase-server'

// Generating 8 full recipes with Claude can take a while.
export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = createRouteClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { fase, dose_mg, restricoes = [] } = await req.json()

  const client = new Anthropic()

  const faseMap: Record<number, string> = {
    1: 'Fase 1 - Adaptação (2.5-5mg): refeições pequenas, fácil digestão, evitar náusea, 1600-1800 kcal/dia',
    2: 'Fase 2 - Aceleração (7.5-10mg): alta proteína, déficit calórico, 1400-1600 kcal/dia',
    3: 'Fase 3 - Otimização (12.5-15mg): máximo resultado, preservar músculo, 1200-1400 kcal/dia'
  }
  const faseTexto = faseMap[fase] || 'Fase 1 - Adaptação'

  const restricoesTexto = restricoes.length > 0 ? restricoes.join(', ') : 'nenhuma'

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Você é nutricionista especializado em pacientes com Mounjaro (tirzepatida).

Gere 8 receitas para paciente em: ${faseTexto}
Dose atual: ${dose_mg ?? '—'} mg
Restrições alimentares: ${restricoesTexto}

Retorne SOMENTE JSON válido, sem texto antes ou depois, sem markdown:
{
  "receitas": [
    {
      "id": "rec_001",
      "nome": "Nome da receita",
      "tipo": "cafe",
      "emoji": "🍳",
      "tempo_preparo": 15,
      "calorias": 350,
      "proteinas": 28,
      "carboidratos": 20,
      "gorduras": 10,
      "dificuldade": "facil",
      "dica_mounjaro": "Dica curta específica para quem usa Mounjaro",
      "ingredientes": ["200g frango desfiado", "2 ovos", "sal a gosto"],
      "modo_preparo": ["Aqueça a frigideira.", "Adicione os ingredientes.", "Cozinhe por 10 min."],
      "beneficios": ["Rico em proteína", "Baixo carboidrato"]
    }
  ]
}

Tipos possíveis: cafe, almoco, jantar, lanche
Emojis sugeridos por tipo: cafe=☕🥞🍳, almoco=🍗🥗🍲, jantar=🐟🥩🍜, lanche=🥜🍎🧀
Crie receitas reais, saborosas, típicas da culinária brasileira e adequadas ao Mounjaro.`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const clean = text.replace(/```json|```/g, '').trim()

  try {
    const data = JSON.parse(clean)

    // Salvar no Supabase como cache por 7 dias
    await supabase.from('receitas_geradas').upsert({
      user_id: user.id,
      fase,
      receitas: data.receitas,
      gerado_em: new Date().toISOString()
    }, { onConflict: 'user_id,fase' })

    return Response.json(data)
  } catch {
    return Response.json({ error: 'Erro ao processar receitas' }, { status: 500 })
  }
}
