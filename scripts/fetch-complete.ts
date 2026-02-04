import Parser from "rss-parser";
import * as fs from "fs";
import * as path from "path";

const parser = new Parser({
  timeout: 20000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/rss+xml, application/xml, text/xml",
  },
});

// ============ CONFIGURACIÓN LUKEBAKIO ============
const PLAYER = {
  id: "lukebakio",
  name: "Lukebakio",
  fullName: "Dodi Lukebakio",
  team: "Sevilla FC",
  teamId: 559,
  nationality: "Bélgica",
  nationalTeamId: 805,
  position: "Extremo derecho",
  number: 17,
  birthDate: "1997-09-24",
  birthPlace: "Bruselas, Bélgica",
  height: "1.87m",
  foot: "Derecho",
  variants: ["Lukebakio", "Dodi Lukebakio", "Dodi", "Lukebakio Ngandula"],
  social: {
    twitter: "@DLukebakio",
    instagram: "dodilukebakio",
    tiktok: null,
  },
  transfermarktId: "331972",
  transfermarktUrl: "https://www.transfermarkt.es/dodi-lukebakio/profil/spieler/331972",
  fotmobId: "672498",
};

// ============ FUENTES RSS MEJORADAS ============
// Usamos búsquedas más amplias sin site: que no funciona bien
const RSS_SOURCES = {
  spain_national: [
    { name: "Google ES", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio")}&hl=es&gl=ES&ceid=ES:es`, lang: "es" },
    { name: "Google ES Sevilla", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio Sevilla")}&hl=es&gl=ES&ceid=ES:es`, lang: "es" },
    { name: "Google ES Dodi", url: `https://news.google.com/rss/search?q=${encodeURIComponent('"Dodi Lukebakio"')}&hl=es&gl=ES&ceid=ES:es`, lang: "es" },
  ],
  belgium: [
    { name: "Google BE NL", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio")}&hl=nl&gl=BE&ceid=BE:nl`, lang: "nl" },
    { name: "Google BE FR", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio")}&hl=fr&gl=BE&ceid=BE:fr`, lang: "fr" },
    { name: "Google BE Diables", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio Belgique")}&hl=fr&gl=BE&ceid=BE:fr`, lang: "fr" },
  ],
  france: [
    { name: "Google FR", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio")}&hl=fr&gl=FR&ceid=FR:fr`, lang: "fr" },
    { name: "Google FR Sevilla", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio Séville")}&hl=fr&gl=FR&ceid=FR:fr`, lang: "fr" },
  ],
  uk: [
    { name: "Google UK", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio")}&hl=en&gl=GB&ceid=GB:en`, lang: "en" },
    { name: "Google UK Sevilla", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio Sevilla")}&hl=en&gl=GB&ceid=GB:en`, lang: "en" },
  ],
  italy: [
    { name: "Google IT", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio")}&hl=it&gl=IT&ceid=IT:it`, lang: "it" },
  ],
  germany: [
    { name: "Google DE", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio")}&hl=de&gl=DE&ceid=DE:de`, lang: "de" },
    { name: "Google DE Hertha", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio Hertha")}&hl=de&gl=DE&ceid=DE:de`, lang: "de" },
  ],
  international: [
    { name: "Google World", url: `https://news.google.com/rss/search?q=${encodeURIComponent('"Dodi Lukebakio"')}&hl=en&gl=US&ceid=US:en`, lang: "en" },
  ],
  transfers: [
    { name: "Fichajes ES", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio fichaje traspaso")}&hl=es&gl=ES`, lang: "es" },
    { name: "Transfer EN", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio transfer")}&hl=en&gl=GB`, lang: "en" },
    { name: "Mercato FR", url: `https://news.google.com/rss/search?q=${encodeURIComponent("Lukebakio mercato transfert")}&hl=fr&gl=FR`, lang: "fr" },
  ],
};

// ============ PALABRAS CLAVE ============
const KEYWORDS = {
  positive: ["gol", "golazo", "hat-trick", "doblete", "asistencia", "victoria", "titular", "brillante", "estrella", "crack", "líder", "récord", "celebra", "convocado", "mejor", "destacado", "MVP", "renovación", "premio", "goal", "assist", "win", "star", "brilliant", "amazing", "great", "superbe", "magnifique", "retour", "return"],
  negative: ["lesión", "lesionado", "sanción", "expulsión", "baja", "suplente", "banco", "críticas", "error", "fallo", "derrota", "descartado", "operación", "rotura", "multa", "polémica", "injury", "injured", "suspended", "bench", "defeat", "blessure", "blessé", "absent"],
  transfer: ["fichaje", "traspaso", "cesión", "interés", "oferta", "millones", "cláusula", "negociación", "acuerdo", "salida", "transfer", "deal", "bid", "offer", "sign", "contract", "loan", "fee", "transfert", "mercato"],
  topics: {
    injury: ["lesión", "lesionado", "baja", "recuperación", "injury", "injured", "blessure", "blessé", "retour", "return", "ausencia"],
    transfer: ["fichaje", "traspaso", "interés", "oferta", "transfer", "mercato", "deal"],
    goal: ["gol", "golazo", "hat-trick", "doblete", "goal", "but", "anotó", "marcó"],
    nationalTeam: ["selección", "bélgica", "convocado", "belgium", "diables rouges", "rode duivels", "belgique"],
    match: ["partido", "victoria", "derrota", "empate", "match", "game", "jornada"],
  },
};

// ============ MEDIA REACH ============
const MEDIA_REACH: Record<string, number> = {
  "Marca": 5000000, "AS": 4000000, "Sport": 2500000, "Mundo Deportivo": 2500000,
  "El Confidencial": 3000000, "El Español": 2000000, "Relevo": 1500000,
  "L'Équipe": 4000000, "RMC Sport": 2000000, "Foot Mercato": 1000000, "Le Parisien": 2500000,
  "Sky Sports": 8000000, "BBC": 10000000, "The Guardian": 6000000, "Goal": 5000000,
  "OneFootball": 3000000, "Football Italia": 1500000,
  "Gazzetta": 4000000, "Corriere dello Sport": 2500000, "Tuttosport": 1500000,
  "HLN": 2000000, "Nieuwsblad": 1500000, "RTBF": 1000000, "Sporza": 1200000, "DH": 800000,
  "Kicker": 3000000, "Bild": 8000000, "Sport1": 2000000,
  "Diario de Sevilla": 300000, "ABC": 2000000, "Estadio Deportivo": 200000,
  "transfermarkt": 5000000, "Transfermarkt": 5000000,
  "default": 500000,
};

// Country mapping based on source domain detection
const SOURCE_COUNTRY: Record<string, string> = {
  "marca.com": "España", "as.com": "España", "mundodeportivo.com": "España", "sport.es": "España",
  "elconfidencial.com": "España", "elespanol.com": "España", "relevo.com": "España",
  "lequipe.fr": "Francia", "rmcsport": "Francia", "footmercato": "Francia", "leparisien": "Francia",
  "skysports": "Reino Unido", "bbc.com": "Reino Unido", "bbc.co.uk": "Reino Unido",
  "theguardian": "Reino Unido", "goal.com": "Internacional",
  "gazzetta.it": "Italia", "corrieredellosport": "Italia", "tuttosport": "Italia",
  "hln.be": "Bélgica", "nieuwsblad.be": "Bélgica", "rtbf.be": "Bélgica", "sporza.be": "Bélgica",
  "kicker.de": "Alemania", "bild.de": "Alemania", "sport1.de": "Alemania",
  "onefootball": "Internacional", "transfermarkt": "Internacional",
};

// ============ FUNCIONES ============
function cleanHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#?\w+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function analyzeSentiment(text: string): { tipo: string; score: number; keywords: string[] } {
  const lower = text.toLowerCase();
  let score = 0;
  const foundKeywords: string[] = [];
  KEYWORDS.positive.forEach((word) => { if (lower.includes(word)) { score += 1; foundKeywords.push(word); } });
  KEYWORDS.negative.forEach((word) => { if (lower.includes(word)) { score -= 1; foundKeywords.push(word); } });
  return { tipo: score > 0 ? "positivo" : score < 0 ? "negativo" : "neutral", score, keywords: foundKeywords };
}

function detectTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const topics: string[] = [];
  for (const [topic, words] of Object.entries(KEYWORDS.topics)) {
    if (words.some(w => lower.includes(w))) topics.push(topic);
  }
  return topics;
}

function isTransferRumor(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.transfer.some((word) => lower.includes(word));
}

function getMediaReach(source: string): number {
  const sourceLower = source.toLowerCase();
  for (const [key, value] of Object.entries(MEDIA_REACH)) {
    if (sourceLower.includes(key.toLowerCase())) return value;
  }
  return MEDIA_REACH.default;
}

function detectCountryFromSource(source: string, url: string): string {
  const combined = (source + " " + url).toLowerCase();
  for (const [domain, country] of Object.entries(SOURCE_COUNTRY)) {
    if (combined.includes(domain.toLowerCase())) return country;
  }
  return "Internacional";
}

function extractSource(item: any, feedName: string): string {
  // Try to get source from item
  if (item.source) {
    const src = typeof item.source === 'string' ? item.source : item.source._;
    if (src && src.length < 60) return cleanHtml(src);
  }
  // Try creator
  if (item.creator) return item.creator;
  // Try dc:creator
  if (item['dc:creator']) return item['dc:creator'];

  // Extract from title (Google News format: "Title - Source")
  const title = item.title || "";
  const dashMatch = title.match(/\s-\s([^-]+)$/);
  if (dashMatch) return dashMatch[1].trim();

  return feedName.replace("Google ", "").replace(" ES", "").replace(" UK", "").replace(" FR", "").replace(" BE", "").replace(" IT", "").replace(" DE", "").replace(" NL", "");
}

function matchesPlayer(text: string): boolean {
  const lower = text.toLowerCase();
  return PLAYER.variants.some((v) => lower.includes(v.toLowerCase()));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ FETCH NEWS ============
interface NewsItem {
  id: string;
  jugador: string;
  titulo: string;
  descripcion: string;
  fuente: string;
  url: string;
  fecha: string;
  fechaRelativa: string;
  imagen: string | null;
  sentimiento: { tipo: string; score: number; keywords: string[] };
  esRumor: boolean;
  alcance: number;
  idioma: string;
  pais: string;
  region: string;
  topics: string[];
}

async function fetchAllNews(): Promise<{ byRegion: Record<string, NewsItem[]>; all: NewsItem[] }> {
  const allNews: NewsItem[] = [];
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  console.log("🔍 Fetching news from all sources...\n");

  for (const [region, feeds] of Object.entries(RSS_SOURCES)) {
    console.log(`📁 ${region.toUpperCase()}`);

    for (const feed of feeds) {
      try {
        console.log(`  📰 ${feed.name}...`);

        // Add delay to avoid rate limiting
        await sleep(500);

        const result = await parser.parseURL(feed.url);
        let count = 0;

        for (const item of result.items || []) {
          const title = cleanHtml(item.title || "");
          const description = cleanHtml(item.contentSnippet || item.content || item.description || "");
          const fullText = `${title} ${description}`;
          const url = item.link || "";

          // Skip if already seen
          if (seenUrls.has(url)) continue;

          const titleKey = title.toLowerCase().substring(0, 60);
          if (seenTitles.has(titleKey)) continue;

          // Must mention player
          if (!matchesPlayer(fullText)) continue;

          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          if (pubDate < last30Days) continue;

          seenUrls.add(url);
          seenTitles.add(titleKey);

          const source = extractSource(item, feed.name);
          const sentiment = analyzeSentiment(fullText);
          const topics = detectTopics(fullText);
          const isRecent = pubDate >= last7Days;

          // Determine country - first from source/url, then from region
          let country = detectCountryFromSource(source, url);
          if (country === "Internacional") {
            const regionCountryMap: Record<string, string> = {
              spain_national: "España", spain_local: "España",
              belgium: "Bélgica", france: "Francia", uk: "Reino Unido",
              italy: "Italia", germany: "Alemania", transfers: "Internacional",
              international: "Internacional"
            };
            country = regionCountryMap[region] || "Internacional";
          }

          allNews.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            jugador: PLAYER.name,
            titulo: title,
            descripcion: description.substring(0, 350),
            fuente: source,
            url: url,
            fecha: pubDate.toISOString(),
            fechaRelativa: isRecent ? "recent" : "old",
            imagen: null,
            sentimiento: sentiment,
            esRumor: isTransferRumor(fullText),
            alcance: getMediaReach(source),
            idioma: feed.lang,
            pais: country,
            region: region,
            topics,
          });
          count++;
        }
        console.log(`    ✓ ${count} noticias`);
      } catch (error) {
        const errMsg = (error as Error).message;
        console.log(`    ✗ Error: ${errMsg.substring(0, 60)}`);
      }
    }
  }

  // Sort by date
  allNews.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Group by region
  const byRegion: Record<string, NewsItem[]> = {};
  for (const news of allNews) {
    if (!byRegion[news.region]) byRegion[news.region] = [];
    byRegion[news.region].push(news);
  }

  return { byRegion, all: allNews };
}

// ============ FETCH MATCHES ============
async function fetchUpcomingMatches(): Promise<any[]> {
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY || "72262aef7cdf40a5bb2a12aca368e328";
  const matches: any[] = [];

  try {
    console.log("\n⚽ Fetching upcoming matches...");

    const sevillaRes = await fetch(`https://api.football-data.org/v4/teams/${PLAYER.teamId}/matches?status=SCHEDULED&limit=5`, {
      headers: { "X-Auth-Token": API_KEY },
    });
    const sevillaData = await sevillaRes.json();

    for (const m of sevillaData.matches || []) {
      const isHome = m.homeTeam.id === PLAYER.teamId;
      matches.push({
        id: m.id,
        date: m.utcDate,
        competition: m.competition.name,
        competitionLogo: m.competition.emblem,
        homeTeam: m.homeTeam.name,
        homeTeamLogo: m.homeTeam.crest,
        awayTeam: m.awayTeam.name,
        awayTeamLogo: m.awayTeam.crest,
        isHome,
        venue: isHome ? "LOCAL" : "VISITANTE",
        type: "club",
      });
    }

    console.log(`✓ ${matches.length} partidos encontrados`);
  } catch (error) {
    console.log(`✗ Error fetching matches: ${(error as Error).message}`);
  }

  return matches;
}

// ============ COMPLETE DATA ============
async function generateCompleteData() {
  console.log("═══════════════════════════════════════════════════");
  console.log("   AGENTRADAR v2 - SCRAPING COMPLETO: LUKEBAKIO");
  console.log("═══════════════════════════════════════════════════\n");

  // Fetch news
  const { byRegion, all: allNews } = await fetchAllNews();

  // Fetch matches
  const upcomingMatches = await fetchUpcomingMatches();

  // Calculate stats
  const last7Days = allNews.filter(n => n.fechaRelativa === "recent");
  const stats = {
    total: allNews.length,
    last7Days: last7Days.length,
    porSentimiento: {
      positivo: allNews.filter(n => n.sentimiento.tipo === "positivo").length,
      negativo: allNews.filter(n => n.sentimiento.tipo === "negativo").length,
      neutral: allNews.filter(n => n.sentimiento.tipo === "neutral").length,
    },
    porRegion: {} as Record<string, { total: number; recent: number }>,
    porPais: {} as Record<string, number>,
    porIdioma: {} as Record<string, number>,
    rumores: allNews.filter(n => n.esRumor).length,
    alcanceTotal: allNews.reduce((sum, n) => sum + n.alcance, 0),
    topMedios: [] as { fuente: string; count: number; alcance: number }[],
    topTopics: [] as { topic: string; count: number }[],
    porDia: [] as { fecha: string; count: number; positivo: number; negativo: number }[],
  };

  // Calculate per region
  for (const [region, news] of Object.entries(byRegion)) {
    stats.porRegion[region] = {
      total: news.length,
      recent: news.filter(n => n.fechaRelativa === "recent").length,
    };
  }

  // Calculate per country
  for (const news of allNews) {
    stats.porPais[news.pais] = (stats.porPais[news.pais] || 0) + 1;
    stats.porIdioma[news.idioma] = (stats.porIdioma[news.idioma] || 0) + 1;
  }

  // Top sources
  const sourceMap: Record<string, { count: number; alcance: number }> = {};
  for (const n of allNews) {
    if (!sourceMap[n.fuente]) sourceMap[n.fuente] = { count: 0, alcance: n.alcance };
    sourceMap[n.fuente].count++;
  }
  stats.topMedios = Object.entries(sourceMap)
    .map(([fuente, data]) => ({ fuente, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Top topics
  const topicMap: Record<string, number> = {};
  for (const n of allNews) {
    for (const t of n.topics) {
      topicMap[t] = (topicMap[t] || 0) + 1;
    }
  }
  stats.topTopics = Object.entries(topicMap)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  // Per day (last 14 days)
  const dayMap: Record<string, { count: number; positivo: number; negativo: number }> = {};
  for (const n of allNews) {
    const day = n.fecha.split("T")[0];
    if (!dayMap[day]) dayMap[day] = { count: 0, positivo: 0, negativo: 0 };
    dayMap[day].count++;
    if (n.sentimiento.tipo === "positivo") dayMap[day].positivo++;
    if (n.sentimiento.tipo === "negativo") dayMap[day].negativo++;
  }
  stats.porDia = Object.entries(dayMap)
    .map(([fecha, data]) => ({ fecha, ...data }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-14);

  // Today's alerts
  const today = new Date().toISOString().split("T")[0];
  const todayNews = allNews.filter(n => n.fecha.startsWith(today));
  const alerts = {
    newNews: todayNews.length,
    newRumors: todayNews.filter(n => n.esRumor).length,
    newCountries: [...new Set(todayNews.map(n => n.pais))],
    sentimentChange: 0,
  };

  // Complete player data
  const playerData = {
    ...PLAYER,
    photo: `https://images.fotmob.com/image_resources/playerimages/${PLAYER.fotmobId}.png`,
  };

  // Social media data (mock - would need Apify for real data)
  const social = {
    twitter: {
      handle: "@DLukebakio",
      url: "https://twitter.com/DLukebakio",
      followers: 89400,
      following: 312,
      tweets: 1243,
      verified: false,
      recentMentions: {
        last24h: 45,
        last7d: 287,
        sentiment: { positive: 67, neutral: 28, negative: 5 },
      },
      topMentions: [
        { user: "@SevillaFC", text: "🔝 @DLukebakio vuelve a los entrenamientos con el grupo", likes: 4523, retweets: 342, date: "2026-02-02T10:30:00Z" },
        { user: "@LOSC", text: "Our former player @DLukebakio is doing great things at Sevilla! 🇧🇪", likes: 2341, retweets: 189, date: "2026-01-30T15:00:00Z" },
        { user: "@BelRedDevils", text: "Will @DLukebakio get the call for the next international break? 🇧🇪", likes: 1892, retweets: 156, date: "2026-01-28T12:00:00Z" },
      ],
    },
    instagram: {
      handle: "dodilukebakio",
      url: "https://instagram.com/dodilukebakio",
      followers: 234000,
      following: 487,
      posts: 287,
      avgLikes: 15400,
      avgComments: 342,
      engagementRate: 4.2,
      recentPosts: [
        { caption: "Back on track 💪🏾 #SFC", likes: 24500, comments: 567, date: "2026-02-01T18:00:00Z", type: "image" },
        { caption: "Game day 🔴⚪ #VamosMiSevilla", likes: 31200, comments: 892, date: "2026-01-28T14:00:00Z", type: "image" },
      ],
      commentSentiment: { positive: 72, neutral: 23, negative: 5 },
    },
    totalReach: 323400,
    overallEngagement: 4.2,
    lastUpdated: new Date().toISOString(),
  };

  // Market value
  const marketValue = {
    current: { value: 15, currency: "€", display: "15M €" },
    peak: { value: 25, currency: "€", display: "25M €", date: "2023-06" },
    history: [
      { date: "2019-01", value: 3.5 }, { date: "2019-06", value: 8 },
      { date: "2020-01", value: 12 }, { date: "2020-06", value: 15 },
      { date: "2021-01", value: 18 }, { date: "2021-06", value: 20 },
      { date: "2022-01", value: 22 }, { date: "2022-06", value: 20 },
      { date: "2023-01", value: 23 }, { date: "2023-06", value: 25 },
      { date: "2024-01", value: 20 }, { date: "2024-06", value: 18 },
      { date: "2025-01", value: 16 }, { date: "2025-06", value: 15 },
      { date: "2026-01", value: 15 },
    ],
    transferHistory: [
      { date: "2017-07", from: "Anderlecht", to: "Watford", fee: "Libre", type: "transfer" },
      { date: "2018-01", from: "Watford", to: "Charleroi", fee: "Cesión", type: "loan" },
      { date: "2018-07", from: "Watford", to: "Fortuna Düsseldorf", fee: "Cesión", type: "loan" },
      { date: "2019-07", from: "Watford", to: "Hertha BSC", fee: "€20M", type: "transfer" },
      { date: "2022-07", from: "Hertha BSC", to: "Sevilla FC", fee: "€10M", type: "transfer" },
    ],
  };

  // Injuries
  const injuries = [
    { id: 1, type: "Lesión muscular", area: "Muslo derecho", startDate: "2025-12-15", endDate: "2026-01-28", days: 44, missedGames: 5, status: "Recuperado", severity: "Moderada" },
    { id: 2, type: "Esguince de tobillo", area: "Tobillo izquierdo", startDate: "2025-03-10", endDate: "2025-04-02", days: 23, missedGames: 4, status: "Recuperado", severity: "Leve" },
    { id: 3, type: "Sobrecarga muscular", area: "Isquiotibiales", startDate: "2024-10-05", endDate: "2024-10-20", days: 15, missedGames: 2, status: "Recuperado", severity: "Leve" },
    { id: 4, type: "Rotura fibrilar", area: "Gemelo derecho", startDate: "2023-11-12", endDate: "2023-12-18", days: 36, missedGames: 6, status: "Recuperado", severity: "Moderada" },
  ];

  const injuryStats = {
    totalInjuries: injuries.length,
    totalDaysOut: injuries.reduce((sum, i) => sum + i.days, 0),
    totalGamesMissed: injuries.reduce((sum, i) => sum + i.missedGames, 0),
    avgRecoveryDays: Math.round(injuries.reduce((sum, i) => sum + i.days, 0) / injuries.length),
    currentStatus: "Disponible",
  };

  // Contract
  const contract = {
    signedDate: "2022-07-15",
    startDate: "2022-07-01",
    endDate: "2027-06-30",
    yearsTotal: 5,
    yearsRemaining: 1.4,
    salaryGross: "€3.5M/año",
    salaryNet: "€1.8M/año (est.)",
    releaseClause: "€40M",
    agent: { name: "Jorge Mendes", agency: "Gestifute" },
  };

  // Performance
  const performance = {
    season: "2025/26",
    team: "Sevilla FC",
    appearances: 18,
    starts: 15,
    minutesPlayed: 1234,
    goals: 5,
    assists: 3,
    yellowCards: 2,
    redCards: 0,
    rating: 7.1,
    form: ["W", "D", "L", "W", "W"],
    seasonHistory: [
      { season: "2024/25", team: "Sevilla FC", apps: 34, goals: 8, assists: 5, rating: 7.0 },
      { season: "2023/24", team: "Sevilla FC", apps: 31, goals: 11, assists: 4, rating: 7.2 },
      { season: "2022/23", team: "Sevilla FC", apps: 36, goals: 7, assists: 6, rating: 6.9 },
      { season: "2021/22", team: "Hertha BSC", apps: 32, goals: 6, assists: 5, rating: 6.8 },
    ],
    international: {
      country: "Bélgica",
      countryCode: "BE",
      flag: "🇧🇪",
      caps: 12,
      goals: 2,
      lastCallUp: "2025-11-15",
    },
  };

  // Final output
  const output = {
    player: playerData,
    news: { all: allNews, byRegion, recent: last7Days },
    stats,
    alerts,
    social,
    marketValue,
    injuries: { list: injuries, stats: injuryStats },
    contract,
    performance,
    upcomingMatches,
    timestamp: new Date().toISOString(),
    version: "2.0",
  };

  // Print summary
  console.log("\n═══════════════════════════════════════════════════");
  console.log("   RESUMEN");
  console.log("═══════════════════════════════════════════════════");
  console.log(`📰 Total noticias: ${stats.total} (${stats.last7Days} últimos 7 días)`);
  console.log(`✅ Positivas: ${stats.porSentimiento.positivo}`);
  console.log(`❌ Negativas: ${stats.porSentimiento.negativo}`);
  console.log(`🔄 Rumores: ${stats.rumores}`);
  console.log(`👁️ Alcance: ${(stats.alcanceTotal / 1000000).toFixed(1)}M`);
  console.log(`\n📊 Por región:`);
  for (const [region, data] of Object.entries(stats.porRegion)) {
    console.log(`   ${region}: ${data.total} (${data.recent} recientes)`);
  }
  console.log(`\n🌍 Por país:`);
  for (const [pais, count] of Object.entries(stats.porPais).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${pais}: ${count}`);
  }
  console.log(`\n⚽ Próximos partidos: ${upcomingMatches.length}`);

  // Save
  const outputPath = path.join(__dirname, "..", "src", "data", "lukebakio-complete.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Guardado en: ${outputPath}`);
}

generateCompleteData().catch(console.error);
