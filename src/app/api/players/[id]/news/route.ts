import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/players/[id]/news - Noticias del jugador con filtros
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataPath = path.join(process.cwd(), "src", "data", `${id}-complete.json`);

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ success: false, error: "Player not found" }, { status: 404, headers: corsHeaders });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    let news = [...data.news.all];

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get("region");
    const sentiment = searchParams.get("sentiment");
    const days = searchParams.get("days");
    const limit = searchParams.get("limit");
    const rumorsOnly = searchParams.get("rumorsOnly") === "true";
    const country = searchParams.get("country");
    const language = searchParams.get("language");

    // Filter by region
    if (region) {
      news = news.filter(n => n.region === region);
    }

    // Filter by country
    if (country) {
      news = news.filter(n => n.pais === country);
    }

    // Filter by language
    if (language) {
      news = news.filter(n => n.idioma === language);
    }

    // Filter by sentiment
    if (sentiment) {
      news = news.filter(n => n.sentimiento?.tipo === sentiment);
    }

    // Filter by days
    if (days) {
      const cutoff = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
      news = news.filter(n => new Date(n.fecha) >= cutoff);
    }

    // Filter rumors only
    if (rumorsOnly) {
      news = news.filter(n => n.esRumor);
    }

    // Sort by date (newest first)
    news.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Apply limit
    if (limit) {
      news = news.slice(0, parseInt(limit));
    }

    // Group by region for summary
    const byRegion: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    const bySentiment: Record<string, number> = { positivo: 0, negativo: 0, neutral: 0 };

    for (const n of data.news.all) {
      byRegion[n.region] = (byRegion[n.region] || 0) + 1;
      byCountry[n.pais] = (byCountry[n.pais] || 0) + 1;
      const sent = n.sentimiento?.tipo || "neutral";
      bySentiment[sent] = (bySentiment[sent] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      count: news.length,
      totalAvailable: data.news.all.length,
      filters: {
        availableRegions: Object.keys(byRegion),
        availableCountries: Object.keys(byCountry),
      },
      summary: {
        byRegion,
        byCountry,
        bySentiment,
      },
      news: news.map(n => ({
        id: n.id,
        titulo: n.titulo,
        descripcion: n.descripcion,
        fuente: n.fuente,
        url: n.url,
        fecha: n.fecha,
        imagen: n.imagen,
        sentimiento: n.sentimiento,
        esRumor: n.esRumor,
        alcance: n.alcance,
        idioma: n.idioma,
        region: n.region,
        pais: n.pais,
        topics: n.topics,
      })),
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load news" }, { status: 500, headers: corsHeaders });
  }
}
