"use client";

import { useState, useEffect } from "react";

// Types
interface Player {
  id: string;
  name: string;
  fullName: string;
  team: string;
  position: string;
  nationality: string;
  number: number;
  photo: string;
  birthDate: string;
  height: string;
}

interface NewsItem {
  id: string;
  titulo: string;
  descripcion: string;
  fuente: string;
  url: string;
  fecha: string;
  pais: string;
  sentimiento: { tipo: string; score: number };
  esRumor: boolean;
}

interface Stats {
  total: number;
  last7Days: number;
  porSentimiento: { positivo: number; negativo: number; neutral: number };
  porPais: Record<string, number>;
}

// API Base
const API_BASE = "";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [social, setSocial] = useState<any>(null);
  const [calendar, setCalendar] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newsFilter, setNewsFilter] = useState({ country: "", sentiment: "", period: "7days" });

  useEffect(() => {
    async function fetchData() {
      try {
        const [playerRes, newsRes, socialRes, calendarRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/api/players/lukebakio`),
          fetch(`${API_BASE}/api/players/lukebakio/news`),
          fetch(`${API_BASE}/api/players/lukebakio/social`),
          fetch(`${API_BASE}/api/players/lukebakio/calendar`),
          fetch(`${API_BASE}/api/players/lukebakio/stats`),
        ]);

        const playerData = await playerRes.json();
        const newsData = await newsRes.json();
        const socialData = await socialRes.json();
        const calendarData = await calendarRes.json();
        const statsData = await statsRes.json();

        setPlayer(playerData.player);
        setStats(playerData.stats);
        setNews(newsData.news || []);
        setSocial(socialData);
        setCalendar(calendarData);
        setPlayerStats(statsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredNews = news.filter((n) => {
    if (newsFilter.country && n.pais !== newsFilter.country) return false;
    if (newsFilter.sentiment && n.sentimiento?.tipo !== newsFilter.sentiment) return false;

    const newsDate = new Date(n.fecha);
    if (newsFilter.period === "24h" && newsDate < last24h) return false;
    if (newsFilter.period === "7days" && newsDate < last7Days) return false;
    if (newsFilter.period === "30days" && newsDate < last30Days) return false;

    return true;
  });

  const isLast24h = (fecha: string) => new Date(fecha) >= last24h;

  const countries = [...new Set(news.map((n) => n.pais))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Cargando AgentRadar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#111] border-b border-[#222] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-500">AgentRadar</h1>
          <span className="text-gray-400 text-sm">Monitor de Prensa Deportiva</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Player Card */}
        {player && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6 flex items-center gap-6">
            <img
              src="/api/player-image?id=823631"
              alt={player.name}
              className="w-24 h-24 rounded-full object-cover bg-[#333]"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold">{player.fullName}</h2>
              <p className="text-gray-400 text-lg">{player.team} • {player.position} • #{player.number}</p>
              <p className="text-gray-500">{player.nationality} • {player.height}</p>
            </div>
            {stats && (
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-500">{stats.total}</div>
                <div className="text-gray-400">noticias totales</div>
                <div className="text-green-500 text-sm mt-1">+{stats.last7Days} últimos 7 días</div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#333] pb-2">
          {[
            { id: "overview", label: "Resumen" },
            { id: "news", label: `Noticias (${news.length})` },
            { id: "social", label: "RRSS" },
            { id: "calendar", label: "Calendario" },
            { id: "stats", label: "Stats" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#222]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stats Cards */}
              <div className="bg-[#1a1a1a] rounded-xl p-5">
                <div className="text-gray-400 text-sm">Total Noticias</div>
                <div className="text-3xl font-bold mt-1">{stats.total}</div>
                <div className="text-blue-500 text-sm">+{stats.last7Days} esta semana</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-5">
                <div className="text-gray-400 text-sm">Sentimiento Positivo</div>
                <div className="text-3xl font-bold mt-1 text-green-500">{stats.porSentimiento.positivo}</div>
                <div className="text-gray-500 text-sm">{Math.round((stats.porSentimiento.positivo / stats.total) * 100)}% del total</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-5">
                <div className="text-gray-400 text-sm">Sentimiento Negativo</div>
                <div className="text-3xl font-bold mt-1 text-red-500">{stats.porSentimiento.negativo}</div>
                <div className="text-gray-500 text-sm">{Math.round((stats.porSentimiento.negativo / stats.total) * 100)}% del total</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-5">
                <div className="text-gray-400 text-sm">Países</div>
                <div className="text-3xl font-bold mt-1">{Object.keys(stats.porPais || {}).length}</div>
                <div className="text-gray-500 text-sm">con cobertura</div>
              </div>

              {/* Sentiment Bar */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 col-span-full">
                <div className="text-gray-400 text-sm mb-3">Distribución de Sentimiento</div>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500"
                    style={{ width: `${(stats.porSentimiento.positivo / stats.total) * 100}%` }}
                  />
                  <div
                    className="bg-gray-500"
                    style={{ width: `${(stats.porSentimiento.neutral / stats.total) * 100}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${(stats.porSentimiento.negativo / stats.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-green-500">Positivo: {stats.porSentimiento.positivo}</span>
                  <span className="text-gray-500">Neutral: {stats.porSentimiento.neutral}</span>
                  <span className="text-red-500">Negativo: {stats.porSentimiento.negativo}</span>
                </div>
              </div>

              {/* Countries */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 col-span-full md:col-span-2">
                <div className="text-gray-400 text-sm mb-3">Noticias por País</div>
                <div className="space-y-2">
                  {Object.entries(stats.porPais || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([pais, count]) => (
                      <div key={pais} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{pais}</span>
                            <span className="text-gray-400">{count}</span>
                          </div>
                          <div className="h-2 bg-[#333] rounded-full">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(count / stats.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent News Preview */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 col-span-full md:col-span-2">
                <div className="text-gray-400 text-sm mb-3">Noticias Recientes</div>
                <div className="space-y-3">
                  {news.slice(0, 4).map((n) => (
                    <a
                      key={n.id}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-[#222] rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mt-2 ${
                            n.sentimiento?.tipo === "positivo"
                              ? "bg-green-500"
                              : n.sentimiento?.tipo === "negativo"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{n.titulo}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {n.fuente} • {n.pais} • {new Date(n.fecha).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NEWS TAB */}
          {activeTab === "news" && (
            <div>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex bg-[#1a1a1a] rounded-lg p-1">
                  {[
                    { id: "24h", label: "24h" },
                    { id: "7days", label: "7 días" },
                    { id: "30days", label: "30 días" },
                    { id: "all", label: "Todas" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setNewsFilter({ ...newsFilter, period: p.id })}
                      className={`px-4 py-2 rounded-md text-sm transition-colors ${
                        newsFilter.period === p.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <select
                  value={newsFilter.country}
                  onChange={(e) => setNewsFilter({ ...newsFilter, country: e.target.value })}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Todos los países</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={newsFilter.sentiment}
                  onChange={(e) => setNewsFilter({ ...newsFilter, sentiment: e.target.value })}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Todo sentimiento</option>
                  <option value="positivo">Positivo</option>
                  <option value="neutral">Neutral</option>
                  <option value="negativo">Negativo</option>
                </select>
                <div className="flex-1 text-right text-gray-400">
                  Mostrando {filteredNews.length} de {news.length}
                </div>
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNews.slice(0, 50).map((n) => {
                  const isRecent = isLast24h(n.fecha);
                  return (
                    <a
                      key={n.id}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-xl p-4 transition-colors block ${
                        isRecent
                          ? "bg-blue-900/30 border border-blue-500/30 hover:bg-blue-900/40"
                          : "bg-[#1a1a1a] hover:bg-[#222]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isRecent && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/30 text-blue-300">
                            NUEVO
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            n.sentimiento?.tipo === "positivo"
                              ? "bg-green-500/20 text-green-400"
                              : n.sentimiento?.tipo === "negativo"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {n.sentimiento?.tipo || "neutral"}
                        </span>
                        {n.esRumor && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            Rumor
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">{n.pais}</span>
                      </div>
                      <h3 className={`font-medium text-sm leading-tight mb-2 line-clamp-2 ${isRecent ? "text-white" : ""}`}>
                        {n.titulo}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{n.descripcion}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{n.fuente}</span>
                        <span>{new Date(n.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* SOCIAL TAB */}
          {activeTab === "social" && social && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Twitter */}
              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl">𝕏</div>
                  <div>
                    <div className="font-bold">Twitter</div>
                    <div className="text-gray-400 text-sm">{social.platforms?.twitter?.handle}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(social.platforms?.twitter?.followers / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-gray-400">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{social.platforms?.twitter?.tweets}</div>
                    <div className="text-xs text-gray-400">Tweets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{social.platforms?.twitter?.following}</div>
                    <div className="text-xs text-gray-400">Siguiendo</div>
                  </div>
                </div>
                {social.platforms?.twitter?.sentiment && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Sentimiento de Menciones</div>
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div className="bg-green-500" style={{ width: `${social.platforms.twitter.sentiment.positive}%` }} />
                      <div className="bg-gray-500" style={{ width: `${social.platforms.twitter.sentiment.neutral}%` }} />
                      <div className="bg-red-500" style={{ width: `${social.platforms.twitter.sentiment.negative}%` }} />
                    </div>
                  </div>
                )}
                {social.platforms?.twitter?.recentMentions && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-400">Menciones Recientes</div>
                    {(Array.isArray(social.platforms.twitter.recentMentions)
                      ? social.platforms.twitter.recentMentions
                      : []
                    ).slice(0, 3).map((m: any, i: number) => (
                      <div key={i} className="bg-[#222] rounded-lg p-3 text-sm">
                        <div className="font-medium text-blue-400">{m.user}</div>
                        <div className="text-gray-300 mt-1">{m.text}</div>
                        <div className="text-gray-500 text-xs mt-2">❤️ {m.likes} • 🔄 {m.retweets}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">📷</div>
                  <div>
                    <div className="font-bold">Instagram</div>
                    <div className="text-gray-400 text-sm">@{social.platforms?.instagram?.handle}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(social.platforms?.instagram?.followers / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-400">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{social.platforms?.instagram?.posts}</div>
                    <div className="text-xs text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{social.engagementRate}%</div>
                    <div className="text-xs text-gray-400">Engagement</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-[#222] rounded-lg p-3">
                    <div className="text-xl font-bold">{(social.platforms?.instagram?.avgLikes / 1000).toFixed(1)}K</div>
                    <div className="text-gray-400 text-xs">Likes promedio</div>
                  </div>
                  <div className="bg-[#222] rounded-lg p-3">
                    <div className="text-xl font-bold">{social.platforms?.instagram?.avgComments}</div>
                    <div className="text-gray-400 text-xs">Comentarios prom.</div>
                  </div>
                </div>
              </div>

              {/* Total Reach */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 col-span-full">
                <div className="text-center">
                  <div className="text-gray-400 text-sm">Alcance Total en Redes</div>
                  <div className="text-5xl font-bold text-blue-500 mt-2">
                    {(social.totalReach / 1000).toFixed(0)}K
                  </div>
                  <div className="text-gray-500 mt-1">seguidores combinados</div>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === "calendar" && calendar && (
            <div className="space-y-6">
              {/* Team Info */}
              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Próximos Partidos - {calendar.team?.name}</h3>
                {calendar.matches?.length > 0 ? (
                  <div className="space-y-3">
                    {calendar.matches.map((match: any) => (
                      <div
                        key={match.id}
                        className="bg-[#222] rounded-lg p-4 flex items-center gap-4"
                      >
                        <div className="text-center min-w-[80px]">
                          <div className="text-sm text-gray-400">
                            {new Date(match.date).toLocaleDateString("es-ES", { weekday: "short" })}
                          </div>
                          <div className="text-xl font-bold">
                            {new Date(match.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(match.date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${match.isHome ? "text-white" : "text-gray-400"}`}>
                              {match.homeTeam}
                            </span>
                            <span className="text-gray-500">vs</span>
                            <span className={`font-bold ${!match.isHome ? "text-white" : "text-gray-400"}`}>
                              {match.awayTeam}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{match.competition}</div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            match.isHome
                              ? "bg-green-500/20 text-green-400"
                              : "bg-orange-500/20 text-orange-400"
                          }`}
                        >
                          {match.isHome ? "LOCAL" : "VISITANTE"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">No hay partidos programados</div>
                )}
              </div>

              {/* National Team */}
              {calendar.nationalTeam && (
                <div className="bg-[#1a1a1a] rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Selección Nacional - {calendar.nationalTeam.country}</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-[#222] rounded-lg p-4">
                      <div className="text-3xl font-bold">{calendar.nationalTeam.caps}</div>
                      <div className="text-gray-400 text-sm">Partidos</div>
                    </div>
                    <div className="bg-[#222] rounded-lg p-4">
                      <div className="text-3xl font-bold">{calendar.nationalTeam.goals}</div>
                      <div className="text-gray-400 text-sm">Goles</div>
                    </div>
                    <div className="bg-[#222] rounded-lg p-4">
                      <div className="text-sm text-gray-400">Última convocatoria</div>
                      <div className="font-bold mt-1">
                        {new Date(calendar.nationalTeam.lastCallUp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === "stats" && playerStats && (
            <div className="space-y-6">
              {/* Market Value */}
              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Valor de Mercado</h3>
                <div className="flex items-end gap-6 mb-6">
                  <div>
                    <div className="text-gray-400 text-sm">Valor Actual</div>
                    <div className="text-4xl font-bold text-green-500">
                      {playerStats.marketValue?.current?.display || "15M €"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Valor Máximo</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {playerStats.marketValue?.peak?.display || "25M €"}
                    </div>
                    <div className="text-xs text-gray-500">{playerStats.marketValue?.peak?.date}</div>
                  </div>
                </div>
                {/* Simple Chart */}
                <div className="h-40 flex items-end gap-1">
                  {playerStats.marketValue?.history?.map((h: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(h.value / 25) * 100}%` }}
                        title={`${h.date}: ${h.value}M €`}
                      />
                      {i % 3 === 0 && (
                        <div className="text-xs text-gray-500 mt-1 -rotate-45 origin-left">
                          {h.date}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfer History */}
              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Historial de Fichajes</h3>
                <div className="space-y-3">
                  {playerStats.marketValue?.transferHistory?.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 bg-[#222] rounded-lg p-3">
                      <div className="text-gray-400 min-w-[60px]">{t.date}</div>
                      <div className="flex-1">
                        <span className="text-gray-400">{t.from}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{t.to}</span>
                      </div>
                      <div className={`font-bold ${t.fee === "Libre" || t.fee === "Cesión" ? "text-gray-400" : "text-green-500"}`}>
                        {t.fee}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contract */}
              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Contrato</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#222] rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Fin de contrato</div>
                    <div className="font-bold mt-1">{playerStats.contract?.expiryDate}</div>
                  </div>
                  <div className="bg-[#222] rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Años restantes</div>
                    <div className="font-bold mt-1">{playerStats.contract?.yearsRemaining}</div>
                  </div>
                  <div className="bg-[#222] rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Salario</div>
                    <div className="font-bold mt-1">{playerStats.contract?.estimatedSalary}</div>
                  </div>
                  <div className="bg-[#222] rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Cláusula</div>
                    <div className="font-bold mt-1 text-yellow-500">{playerStats.contract?.releaseClause}</div>
                  </div>
                </div>
                {playerStats.contract?.agent && (
                  <div className="mt-4 text-sm text-gray-400">
                    Agente: <span className="text-white">{playerStats.contract.agent.name}</span> ({playerStats.contract.agent.agency})
                  </div>
                )}
              </div>

              {/* Injuries */}
              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Historial de Lesiones</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#222] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{playerStats.injuries?.stats?.totalInjuries || 0}</div>
                    <div className="text-gray-400 text-xs">Lesiones totales</div>
                  </div>
                  <div className="bg-[#222] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">{playerStats.injuries?.stats?.totalDaysOut || 0}</div>
                    <div className="text-gray-400 text-xs">Días de baja</div>
                  </div>
                  <div className="bg-[#222] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">{playerStats.injuries?.stats?.totalGamesMissed || 0}</div>
                    <div className="text-gray-400 text-xs">Partidos perdidos</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {playerStats.injuries?.history?.map((inj: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-[#222] rounded-lg p-3">
                      <div className={`w-3 h-3 rounded-full ${
                        inj.severity === "Leve" ? "bg-yellow-500" : inj.severity === "Moderada" ? "bg-orange-500" : "bg-red-500"
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{inj.type}</div>
                        <div className="text-sm text-gray-500">{inj.area}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div>{inj.days} días</div>
                        <div className="text-gray-500">{inj.missedGames} partidos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Season Stats */}
              <div className="bg-[#1a1a1a] rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Estadísticas de Temporada</h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
                  {[
                    { label: "Partidos", value: playerStats.performance?.currentSeason?.appearances },
                    { label: "Goles", value: playerStats.performance?.currentSeason?.goals },
                    { label: "Asistencias", value: playerStats.performance?.currentSeason?.assists },
                    { label: "Minutos", value: playerStats.performance?.currentSeason?.minutesPlayed },
                    { label: "Amarillas", value: playerStats.performance?.currentSeason?.yellowCards },
                    { label: "Rojas", value: playerStats.performance?.currentSeason?.redCards },
                    { label: "Rating", value: playerStats.performance?.currentSeason?.rating },
                    { label: "Pases %", value: playerStats.performance?.currentSeason?.passAccuracy },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#222] rounded-lg p-3 text-center">
                      <div className="text-xl font-bold">{stat.value || 0}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Season History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-[#333]">
                        <th className="text-left py-2">Temporada</th>
                        <th className="text-left py-2">Equipo</th>
                        <th className="text-center py-2">PJ</th>
                        <th className="text-center py-2">G</th>
                        <th className="text-center py-2">A</th>
                        <th className="text-center py-2">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.performance?.seasonHistory?.map((s: any, i: number) => (
                        <tr key={i} className="border-b border-[#222]">
                          <td className="py-2">{s.season}</td>
                          <td className="py-2">{s.team}</td>
                          <td className="text-center py-2">{s.apps}</td>
                          <td className="text-center py-2">{s.goals}</td>
                          <td className="text-center py-2">{s.assists}</td>
                          <td className="text-center py-2">{s.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] mt-12 py-6 text-center text-gray-500 text-sm">
        AgentRadar © 2026 - Monitor de Prensa para Representantes
      </footer>
    </div>
  );
}
