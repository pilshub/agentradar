import * as fs from "fs";
import * as path from "path";

// Read both data files
const oldDataPath = path.join(__dirname, "..", "src", "data", "lukebakio.json");
const newDataPath = path.join(__dirname, "..", "src", "data", "lukebakio-v2.json");

const oldData = JSON.parse(fs.readFileSync(oldDataPath, "utf-8"));
const newData = JSON.parse(fs.readFileSync(newDataPath, "utf-8"));

// Merge news
const allNews = [...oldData.news, ...(newData.news?.all || [])];
const seenTitles = new Set<string>();
const uniqueNews = allNews.filter((n: any) => {
  const key = n.titulo.toLowerCase().substring(0, 50);
  if (seenTitles.has(key)) return false;
  seenTitles.add(key);
  return true;
});

// Add region/pais if missing
const paisMap: Record<string, string> = {
  spain_national: "España",
  spain_local: "España (Sevilla)",
  spanish_national: "España",
  local_andalusia: "España (Sevilla)",
  belgium: "Bélgica",
  belgian: "Bélgica",
  france: "Francia",
  uk: "Reino Unido",
  italy: "Italia",
  germany: "Alemania",
  international: "Internacional",
  transfers: "Fichajes",
};

uniqueNews.forEach((n: any) => {
  if (!n.region) {
    if (n.categoria) {
      n.region = n.categoria;
    } else if (n.idioma === "es") {
      n.region = "spain_national";
    } else if (n.idioma === "fr") {
      n.region = "france";
    } else if (n.idioma === "en") {
      n.region = "uk";
    } else if (n.idioma === "nl") {
      n.region = "belgium";
    } else {
      n.region = "other";
    }
  }
  if (!n.pais) {
    n.pais = paisMap[n.region] || paisMap[n.categoria] || "Otro";
  }
  if (!n.topics) {
    n.topics = [];
    const text = (n.titulo + " " + n.descripcion).toLowerCase();
    if (text.includes("lesión") || text.includes("injury") || text.includes("blessure")) n.topics.push("injury");
    if (text.includes("fichaje") || text.includes("transfer") || text.includes("mercato")) n.topics.push("transfer");
    if (text.includes("gol") || text.includes("goal") || text.includes("but")) n.topics.push("goal");
    if (text.includes("selección") || text.includes("bélgica") || text.includes("belgium")) n.topics.push("nationalTeam");
  }
});

// Sort by date
uniqueNews.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

// Group by region
const byRegion: Record<string, any[]> = {};
for (const news of uniqueNews) {
  const region = news.region || "other";
  if (!byRegion[region]) byRegion[region] = [];
  byRegion[region].push(news);
}

// Calculate new stats
const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const recentNews = uniqueNews.filter((n: any) => new Date(n.fecha) >= last7Days);

const stats = {
  total: uniqueNews.length,
  last7Days: recentNews.length,
  porSentimiento: {
    positivo: uniqueNews.filter((n: any) => n.sentimiento?.tipo === "positivo").length,
    negativo: uniqueNews.filter((n: any) => n.sentimiento?.tipo === "negativo").length,
    neutral: uniqueNews.filter((n: any) => !n.sentimiento?.tipo || n.sentimiento?.tipo === "neutral").length,
  },
  porRegion: {} as Record<string, { total: number; recent: number }>,
  porPais: {} as Record<string, number>,
  porIdioma: {} as Record<string, number>,
  rumores: uniqueNews.filter((n: any) => n.esRumor).length,
  alcanceTotal: uniqueNews.reduce((sum: number, n: any) => sum + (n.alcance || 100000), 0),
  topMedios: [] as any[],
  porDia: [] as any[],
};

// Per region
for (const [region, news] of Object.entries(byRegion)) {
  const recentInRegion = news.filter((n: any) => new Date(n.fecha) >= last7Days);
  stats.porRegion[region] = { total: news.length, recent: recentInRegion.length };
}

// Per country
for (const n of uniqueNews) {
  stats.porPais[n.pais] = (stats.porPais[n.pais] || 0) + 1;
  stats.porIdioma[n.idioma] = (stats.porIdioma[n.idioma] || 0) + 1;
}

// Top sources
const sourceMap: Record<string, number> = {};
for (const n of uniqueNews) {
  sourceMap[n.fuente] = (sourceMap[n.fuente] || 0) + 1;
}
stats.topMedios = Object.entries(sourceMap)
  .map(([fuente, count]) => ({ fuente, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 15);

// Per day
const dayMap: Record<string, { count: number; positivo: number; negativo: number }> = {};
for (const n of uniqueNews) {
  const day = n.fecha.split("T")[0];
  if (!dayMap[day]) dayMap[day] = { count: 0, positivo: 0, negativo: 0 };
  dayMap[day].count++;
  if (n.sentimiento?.tipo === "positivo") dayMap[day].positivo++;
  if (n.sentimiento?.tipo === "negativo") dayMap[day].negativo++;
}
stats.porDia = Object.entries(dayMap)
  .map(([fecha, data]) => ({ fecha, ...data }))
  .sort((a, b) => a.fecha.localeCompare(b.fecha))
  .slice(-30);

// Today's alerts
const today = new Date().toISOString().split("T")[0];
const todayNews = uniqueNews.filter((n: any) => n.fecha.startsWith(today));
const alerts = {
  newNews: todayNews.length,
  newRumors: todayNews.filter((n: any) => n.esRumor).length,
  newCountries: [...new Set(todayNews.map((n: any) => n.pais))],
  recentHighlight: recentNews[0]?.titulo || null,
};

// Final merged output
const output = {
  player: newData.player,
  news: {
    all: uniqueNews,
    byRegion,
    recent: recentNews,
  },
  stats,
  alerts,
  social: newData.social,
  marketValue: newData.marketValue,
  injuries: newData.injuries,
  contract: newData.contract,
  performance: newData.performance,
  upcomingMatches: newData.upcomingMatches,
  timestamp: new Date().toISOString(),
  version: "2.0",
};

// Save
const outputPath = path.join(__dirname, "..", "src", "data", "lukebakio-complete.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log("═══════════════════════════════════════════════════");
console.log("   DATA MERGED");
console.log("═══════════════════════════════════════════════════");
console.log(`📰 Total noticias: ${stats.total}`);
console.log(`📅 Últimos 7 días: ${stats.last7Days}`);
console.log(`✅ Positivas: ${stats.porSentimiento.positivo}`);
console.log(`❌ Negativas: ${stats.porSentimiento.negativo}`);
console.log(`🔄 Rumores: ${stats.rumores}`);
console.log(`\n📊 Por país:`);
for (const [pais, count] of Object.entries(stats.porPais).sort((a, b) => b[1] - a[1])) {
  console.log(`   ${pais}: ${count}`);
}
console.log(`\n⚽ Partidos: ${output.upcomingMatches?.length || 0}`);
console.log(`\n💾 Saved: ${outputPath}`);
