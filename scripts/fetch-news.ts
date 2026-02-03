import { writeFileSync } from "fs";
import { join } from "path";

const RSS_FEEDS = [
  // Diarios deportivos
  { name: "Marca", url: "https://e00-marca.uecdn.es/rss/portada.xml" },
  { name: "El Pais Deportes", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/deportes/portada" },
  // Equipos
  { name: "Sevilla FC News", url: "https://news.google.com/rss/search?q=Sevilla+FC&hl=es&gl=ES&ceid=ES:es" },
  { name: "Real Betis News", url: "https://news.google.com/rss/search?q=Real+Betis&hl=es&gl=ES&ceid=ES:es" },
  // Jugadores específicos
  { name: "Isco News", url: "https://news.google.com/rss/search?q=Isco+Betis&hl=es&gl=ES&ceid=ES:es" },
  { name: "Lo Celso News", url: "https://news.google.com/rss/search?q=Lo+Celso+Betis&hl=es&gl=ES&ceid=ES:es" },
  { name: "Lukebakio News", url: "https://news.google.com/rss/search?q=Lukebakio+Sevilla&hl=es&gl=ES&ceid=ES:es" },
  { name: "Saul News", url: "https://news.google.com/rss/search?q=Saul+Niguez+Sevilla&hl=es&gl=ES&ceid=ES:es" },
  { name: "Isaac Romero News", url: "https://news.google.com/rss/search?q=Isaac+Romero+Sevilla&hl=es&gl=ES&ceid=ES:es" },
];

const JUGADORES = ["Isco", "Lo Celso", "Lukebakio", "Saúl", "Isaac Romero"];

const PALABRAS_POSITIVAS = [
  "gol", "victoria", "fichaje", "renovación", "titular", "brillante",
  "estrella", "crack", "líder", "récord", "celebra", "convocado",
  "asistencia", "hat-trick", "doblete", "mejor", "destacado"
];

const PALABRAS_NEGATIVAS = [
  "lesión", "lesionado", "sanción", "expulsión", "baja", "suplente",
  "banco", "críticas", "error", "fallo", "derrota", "descartado",
  "operación", "rotura", "vendido", "salida"
];

interface Mencion {
  jugador: string;
  titulo: string;
  descripcion: string;
  fuente: string;
  url: string;
  fecha: string;
  sentimiento: {
    tipo: "positivo" | "negativo" | "neutral";
    score: number;
  };
}

function normalizar(texto: string): string {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function analizarSentimiento(texto: string): { tipo: "positivo" | "negativo" | "neutral"; score: number } {
  const textoLower = texto.toLowerCase();
  let score = 0;

  PALABRAS_POSITIVAS.forEach((p) => {
    if (textoLower.includes(p)) score += 1;
  });
  PALABRAS_NEGATIVAS.forEach((n) => {
    if (textoLower.includes(n)) score -= 1;
  });

  return {
    tipo: score > 0 ? "positivo" : score < 0 ? "negativo" : "neutral",
    score,
  };
}

function extractText(item: any, field: string): string {
  const value = item[field];
  if (!value) return "";
  if (Array.isArray(value)) return value[0] || "";
  if (typeof value === "object" && value._) return value._;
  return String(value);
}

async function parseXML(xmlText: string): Promise<any[]> {
  // Simple XML parser for RSS items
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];

    const getField = (field: string): string => {
      const regex = new RegExp(`<${field}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${field}>|<${field}[^>]*>([\\s\\S]*?)<\\/${field}>`, "i");
      const m = itemXml.match(regex);
      if (m) {
        return (m[1] || m[2] || "").trim();
      }
      return "";
    };

    items.push({
      title: getField("title"),
      description: getField("description"),
      link: getField("link"),
      pubDate: getField("pubDate"),
    });
  }

  return items;
}

async function fetchRSS(feed: { name: string; url: string }): Promise<any[]> {
  try {
    console.log(`  Fetching ${feed.name}...`);
    const response = await fetch(feed.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.log(`  ⚠ ${feed.name}: HTTP ${response.status}`);
      return [];
    }

    const text = await response.text();
    const items = await parseXML(text);
    console.log(`  ✓ ${feed.name}: ${items.length} artículos`);
    return items.map((item) => ({ ...item, fuente: feed.name }));
  } catch (error) {
    console.log(`  ✗ ${feed.name}: ${error}`);
    return [];
  }
}

async function main() {
  console.log("\n📡 AgentRadar - Fetch News Script\n");
  console.log("Descargando RSS feeds...\n");

  // Fetch all RSS feeds
  const allArticles: any[] = [];
  for (const feed of RSS_FEEDS) {
    const articles = await fetchRSS(feed);
    allArticles.push(...articles);
  }

  console.log(`\nTotal artículos: ${allArticles.length}`);
  console.log("\nBuscando menciones de jugadores...\n");

  // Filter mentions
  const menciones: Mencion[] = [];

  for (const articulo of allArticles) {
    const titulo = articulo.title || "";
    const descripcion = articulo.description || "";
    const textoCompleto = normalizar(titulo + " " + descripcion);

    for (const jugador of JUGADORES) {
      if (textoCompleto.includes(normalizar(jugador))) {
        // Clean HTML from description
        const cleanDesc = descripcion
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/https?:\/\/[^\s]+/g, "")
          .trim();

        // Extract real source from title (after " - ")
        const titleParts = titulo.split(" - ");
        const realSource = titleParts.length > 1 ? titleParts[titleParts.length - 1] : articulo.fuente;
        const cleanTitle = titleParts.slice(0, -1).join(" - ") || titulo;

        menciones.push({
          jugador,
          titulo: cleanTitle.substring(0, 150),
          descripcion: cleanDesc.substring(0, 100) || "",
          fuente: realSource.substring(0, 30),
          url: articulo.link,
          fecha: articulo.pubDate,
          sentimiento: analizarSentimiento(titulo + " " + descripcion),
        });
      }
    }
  }

  // Sort by date (newest first)
  menciones.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Group by player (max 20 per player to keep file size small)
  const byPlayer: Record<string, Mencion[]> = {};
  for (const jugador of JUGADORES) {
    byPlayer[jugador] = menciones
      .filter((m) => m.jugador === jugador)
      .slice(0, 20);
  }

  // Create output (only byPlayer, no duplicated menciones array)
  const output = {
    byPlayer,
    timestamp: new Date().toISOString(),
  };

  // Save to file
  const outputPath = join(process.cwd(), "src", "data", "noticias.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

  console.log("Menciones encontradas:");
  for (const jugador of JUGADORES) {
    const count = byPlayer[jugador].length;
    const positivas = byPlayer[jugador].filter((m) => m.sentimiento.tipo === "positivo").length;
    const negativas = byPlayer[jugador].filter((m) => m.sentimiento.tipo === "negativo").length;
    console.log(`  ${jugador}: ${count} (${positivas}+ / ${negativas}-)`);
  }

  console.log(`\n✅ Datos guardados en: src/data/noticias.json`);
  console.log(`   Total: ${menciones.length} menciones`);
  console.log(`   Timestamp: ${output.timestamp}\n`);
}

main().catch(console.error);
