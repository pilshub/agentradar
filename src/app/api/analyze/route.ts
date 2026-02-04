import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { titulo, descripcion, jugador, fuente } = await request.json();

    const prompt = `Eres un analista deportivo experto. Analiza esta noticia sobre el jugador ${jugador}:

Título: ${titulo}
Fuente: ${fuente}
Extracto: ${descripcion || "No disponible"}

Proporciona un análisis breve (máximo 3-4 frases) que incluya:
1. Resumen de la noticia
2. Impacto potencial para el jugador (positivo/negativo/neutral)
3. Relevancia para su carrera o equipo

Responde en español de forma concisa y profesional.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI error:", error);
      return NextResponse.json(
        { error: "Error al generar análisis" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || "No se pudo generar el análisis.";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
