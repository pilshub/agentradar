import { writeFileSync } from "fs";
import { join } from "path";

const RSS_FEEDS = [
  // Diarios deportivos generales
  { name: "Marca", url: "https://e00-marca.uecdn.es/rss/portada.xml" },
  { name: "AS", url: "https://feeds.as.com/mrss-s/pages/as/site/as.com/portada" },
  { name: "El Pais Deportes", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/deportes/portada" },

  // Equipos - búsquedas generales
  { name: "Sevilla FC News", url: "https://news.google.com/rss/search?q=Sevilla+FC&hl=es&gl=ES&ceid=ES:es" },
  { name: "Real Betis News", url: "https://news.google.com/rss/search?q=Real+Betis&hl=es&gl=ES&ceid=ES:es" },

  // === REAL BETIS - Jugadores ===
  { name: "Isco News", url: "https://news.google.com/rss/search?q=Isco+Betis&hl=es&gl=ES&ceid=ES:es" },
  { name: "Lo Celso News", url: "https://news.google.com/rss/search?q=Lo+Celso+Betis&hl=es&gl=ES&ceid=ES:es" },
  { name: "Chimy Avila News", url: "https://news.google.com/rss/search?q=Chimy+Avila+Betis&hl=es&gl=ES&ceid=ES:es" },
  { name: "Abde News", url: "https://news.google.com/rss/search?q=Abde+Ezzalzouli+Betis&hl=es&gl=ES&ceid=ES:es" },
  { name: "Rui Silva News", url: "https://news.google.com/rss/search?q=Rui+Silva+Betis&hl=es&gl=ES&ceid=ES:es" },
  { name: "Marc Bartra News", url: "https://news.google.com/rss/search?q=Marc+Bartra+Betis&hl=es&gl=ES&ceid=ES:es" },
  { name: "William Carvalho News", url: "https://news.google.com/rss/search?q=William+Carvalho+Betis&hl=es&gl=ES&ceid=ES:es" },
  { name: "Johnny Cardoso News", url: "https://news.google.com/rss/search?q=Johnny+Cardoso+Betis&hl=es&gl=ES&ceid=ES:es" },

  // === SEVILLA FC - Jugadores ===
  { name: "Lukebakio News", url: "https://news.google.com/rss/search?q=Lukebakio+Sevilla&hl=es&gl=ES&ceid=ES:es" },
  { name: "Saul News", url: "https://news.google.com/rss/search?q=Saul+Niguez+Sevilla&hl=es&gl=ES&ceid=ES:es" },
  { name: "Isaac Romero News", url: "https://news.google.com/rss/search?q=Isaac+Romero+Sevilla&hl=es&gl=ES&ceid=ES:es" },
  { name: "Jesus Navas News", url: "https://news.google.com/rss/search?q=Jesus+Navas+Sevilla&hl=es&gl=ES&ceid=ES:es" },
  { name: "En-Nesyri News", url: "https://news.google.com/rss/search?q=En-Nesyri+Sevilla&hl=es&gl=ES&ceid=ES:es" },
  { name: "Gudelj News", url: "https://news.google.com/rss/search?q=Gudelj+Sevilla&hl=es&gl=ES&ceid=ES:es" },
  { name: "Loic Bade News", url: "https://news.google.com/rss/search?q=Loic+Bade+Sevilla&hl=es&gl=ES&ceid=ES:es" },
  { name: "Djibril Sow News", url: "https://news.google.com/rss/search?q=Djibril+Sow+Sevilla&hl=es&gl=ES&ceid=ES:es" },
];

// All players to track (must match names in players.ts)
const JUGADORES = [
  // Betis
  "Isco", "Lo Celso", "Chimy Ávila", "Abde", "Rui Silva", "Marc Bartra", "William Carvalho", "Johnny Cardoso",
  // Sevilla
  "Lukebakio", "Saúl", "Isaac Romero", "Jesús Navas", "En-Nesyri", "Gudelj", "Loïc Badé", "Djibril Sow"
];

// Alternative name variants for matching
const NAME_VARIANTS: Record<string, string[]> = {
  "Chimy Ávila": ["Chimy", "Avila", "Ezequiel Avila"],
  "Abde": ["Ezzalzouli", "Abdessamad"],
  "Saúl": ["Saul", "Niguez", "Ñiguez"],
  "Jesús Navas": ["Jesus Navas", "Navas"],
  "En-Nesyri": ["Nesyri", "Youssef En-Nesyri", "En Nesyri"],
  "Loïc Badé": ["Loic Bade", "Bade", "Badé"],
  "Lo Celso": ["Giovani Lo Celso", "LoCelso"],
  "Rui Silva": ["Silva"],
  "Marc Bartra": ["Bartra"],
  "William Carvalho": ["Carvalho"],
  "Johnny Cardoso": ["Cardoso"],
  "Lukebakio": ["Dodi Lukebakio"],
  "Isaac Romero": ["Romero"],
  "Gudelj": ["Nemanja Gudelj"],
  "Djibril Sow": ["Sow"],
};

const PALABRAS_POSITIVAS = [
  "gol", "victoria", "fichaje", "renovación", "titular", "brillante",
  "estrella", "crack", "líder", "récord", "celebra", "convocado",
  "asistencia", "hat-trick", "doblete", "mejor", "destacado", "héroe",
  "gran partido", "decisivo", "figura", "MVP", "ovación"
];

const PALABRAS_NEGATIVAS = [
  "lesión", "lesionado", "sanción", "expulsión", "baja", "suplente",
  "banco", "críticas", "error", "fallo", "derrota", "descartado",
  "operación", "rotura", "vendido", "salida", "fracaso", "decepción",
  "sustituido", "enfadado", "conflicto", "multa"
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

async function parseXML(xmlText: string): Promise<any[]> {
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

function matchesPlayer(texto: string, jugador: string): boolean {
  const textoNorm = normalizar(texto);

  // Check main name
  if (textoNorm.includes(normalizar(jugador))) return true;

  // Check variants
  const variants = NAME_VARIANTS[jugador] || [];
  for (const variant of variants) {
    if (textoNorm.includes(normalizar(variant))) return true;
  }

  return false;
}

function cleanDescription(descripcion: string): string {
  return descripcion
    .replace(/<[^>]*?>/g, "")
    .replace(/<[^>]*$/g, "")
    .replace(/^[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#\d+;/g, "")
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("\n📡 AgentRadar - Fetch News Script\n");
  console.log(`Monitorizando ${JUGADORES.length} jugadores`);
  console.log("Descargando RSS feeds...\n");

  // Fetch all RSS feeds
  const allArticles: any[] = [];
  for (const feed of RSS_FEEDS) {
    const articles = await fetchRSS(feed);
    allArticles.push(...articles);
  }

  console.log(`\nTotal artículos descargados: ${allArticles.length}`);

  // Filter by last month
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const recentArticles = allArticles.filter(a => {
    try {
      const date = new Date(a.pubDate);
      return date >= oneMonthAgo;
    } catch {
      return true; // Include if date parsing fails
    }
  });

  console.log(`Artículos del último mes: ${recentArticles.length}`);
  console.log("\nBuscando menciones de jugadores...\n");

  // Filter mentions
  const menciones: Mencion[] = [];

  for (const articulo of recentArticles) {
    const titulo = articulo.title || "";
    const descripcion = articulo.description || "";
    const textoCompleto = titulo + " " + descripcion;

    for (const jugador of JUGADORES) {
      if (matchesPlayer(textoCompleto, jugador)) {
        const cleanDesc = cleanDescription(descripcion);

        // Extract real source from title (after " - ")
        const titleParts = titulo.split(" - ");
        const realSource = titleParts.length > 1 ? titleParts[titleParts.length - 1] : articulo.fuente;
        const cleanTitle = titleParts.slice(0, -1).join(" - ") || titulo;

        menciones.push({
          jugador,
          titulo: cleanTitle.substring(0, 200),
          descripcion: cleanDesc.substring(0, 150) || "",
          fuente: realSource.substring(0, 30),
          url: articulo.link,
          fecha: articulo.pubDate,
          sentimiento: analizarSentimiento(textoCompleto),
        });
      }
    }
  }

  // Sort by date (newest first)
  menciones.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Deduplicate by title
  const seenTitles = new Set<string>();
  const uniqueMenciones = menciones.filter(m => {
    const key = m.titulo.toLowerCase().trim();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  console.log(`Deduplicado: ${menciones.length} -> ${uniqueMenciones.length} menciones únicas`);

  // Group by player (max 30 per player for more data)
  const byPlayer: Record<string, Mencion[]> = {};
  const metrics: Record<string, {
    totalMenciones: number;
    positivas: number;
    negativas: number;
    neutrales: number;
    ratio: number;
    fuentesPrincipales: { fuente: string; count: number }[];
    keywords: { word: string; count: number }[];
  }> = {};

  // Keywords to track
  const KEYWORDS_TO_TRACK = [
    "gol", "lesión", "fichaje", "titular", "suplente", "convocado",
    "expulsión", "victoria", "derrota", "entrenamiento", "renovación",
    "transferencia", "doblete", "asistencia", "hat-trick", "baja",
    "selección", "derbi", "champions", "europa league", "copa", "penalti"
  ];

  for (const jugador of JUGADORES) {
    const playerMenciones = uniqueMenciones.filter((m) => m.jugador === jugador);
    byPlayer[jugador] = playerMenciones.slice(0, 30);

    // Calculate metrics
    const positivas = playerMenciones.filter(m => m.sentimiento.tipo === "positivo").length;
    const negativas = playerMenciones.filter(m => m.sentimiento.tipo === "negativo").length;
    const neutrales = playerMenciones.filter(m => m.sentimiento.tipo === "neutral").length;

    // Count sources
    const fuenteCounts: Record<string, number> = {};
    playerMenciones.forEach(m => {
      fuenteCounts[m.fuente] = (fuenteCounts[m.fuente] || 0) + 1;
    });
    const fuentesPrincipales = Object.entries(fuenteCounts)
      .map(([fuente, count]) => ({ fuente, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Count keywords
    const keywordCounts: Record<string, number> = {};
    playerMenciones.forEach(m => {
      const texto = (m.titulo + " " + m.descripcion).toLowerCase();
      KEYWORDS_TO_TRACK.forEach(kw => {
        if (texto.includes(kw)) {
          keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
        }
      });
    });
    const keywords = Object.entries(keywordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    metrics[jugador] = {
      totalMenciones: playerMenciones.length,
      positivas,
      negativas,
      neutrales,
      ratio: playerMenciones.length > 0 ? Math.round((positivas / playerMenciones.length) * 100) : 0,
      fuentesPrincipales,
      keywords,
    };
  }

  // Create output
  const output = {
    byPlayer,
    metrics,
    timestamp: new Date().toISOString(),
  };

  // Save to file
  const outputPath = join(process.cwd(), "src", "data", "noticias.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

  console.log("\n=== RESUMEN ===\n");
  console.log("Menciones encontradas:");
  for (const jugador of JUGADORES) {
    const count = byPlayer[jugador].length;
    const positivas = byPlayer[jugador].filter((m) => m.sentimiento.tipo === "positivo").length;
    const negativas = byPlayer[jugador].filter((m) => m.sentimiento.tipo === "negativo").length;
    const icon = positivas > negativas ? "🟢" : negativas > positivas ? "🔴" : "⚪";
    console.log(`  ${icon} ${jugador}: ${count} noticias (${positivas}+ / ${negativas}-)`);
  }

  console.log(`\n✅ Datos guardados en: src/data/noticias.json`);
  console.log(`   Total: ${uniqueMenciones.length} menciones únicas`);
  console.log(`   Timestamp: ${output.timestamp}\n`);
}

main().catch(console.error);
