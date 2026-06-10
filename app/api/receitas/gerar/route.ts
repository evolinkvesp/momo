import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createRouteClient } from "@/lib/supabase-server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = createRouteClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { fase, dose_mg, restricoes = [], forcar = false } = await req.json();

  // Return cached recipes if < 7 days old and not forcing
  if (!forcar) {
    const { data: cached } = await supabase
      .from("receitas_geradas")
      .select("receitas, gerado_em")
      .eq("user_id", user.id)
      .eq("fase", fase)
      .maybeSingle();

    if (cached?.receitas) {
      const ageDays = (Date.now() - new Date(cached.gerado_em).getTime()) / 86_400_000;
      if (ageDays < 7) {
        return NextResponse.json({ receitas: cached.receitas });
      }
    }
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const faseMap: Record<number, string> = {
    1: "Fase 1 - Adaptação (2.5-5mg): refeições pequenas, fácil digestão, evitar náusea, 1600-1800 kcal/dia",
    2: "Fase 2 - Aceleração (7.5-10mg): alta proteína, déficit calórico, 1400-1600 kcal/dia",
    3: "Fase 3 - Otimização (12.5-15mg): máximo resultado, preservar músculo, 1200-1400 kcal/dia",
  };
  const faseTexto = faseMap[fase] ?? faseMap[1];
  const restricoesTexto = restricoes.length > 0 ? restricoes.join(", ") : "nenhuma";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Você é nutricionista especializado em pacientes com Mounjaro (tirzepatida). Retorne apenas JSON válido.",
        },
        {
          role: "user",
          content: `Gere 8 receitas para paciente em: ${faseTexto}
Dose atual: ${dose_mg ?? "—"} mg
Restrições alimentares: ${restricoesTexto}

Retorne JSON com este formato exato:
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
Emojis por tipo: cafe=☕🥞🍳, almoco=🍗🥗🍲, jantar=🐟🥩🍜, lanche=🥜🍎🧀
Crie receitas reais, saborosas, típicas da culinária brasileira e adequadas ao Mounjaro.`,
        },
      ],
    });

    const content = response.choices[0].message.content ?? "{}";
    const data = JSON.parse(content);

    await supabase.from("receitas_geradas").upsert(
      { user_id: user.id, fase, receitas: data.receitas, gerado_em: new Date().toISOString() },
      { onConflict: "user_id,fase" }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Receitas] Error:", error?.message ?? error);
    return NextResponse.json({ error: "Erro ao gerar receitas" }, { status: 500 });
  }
}
