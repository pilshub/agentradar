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

  const tabs = [
    { id: "overview", label: "Resumen", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { id: "news", label: `Noticias`, count: news.length, icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
    { id: "social", label: "RRSS", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
    { id: "calendar", label: "Calendario", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "stats", label: "Stats", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-lg">Cargando AgentRadar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center overflow-hidden">
              <div className="w-5 h-5 rounded-full border border-white/30" />
              <div className="absolute w-2.5 h-2.5 rounded-full border border-white/20" />
              <div className="absolute w-0.5 h-2.5 bg-white/60 origin-bottom animate-radar" style={{ bottom: '50%', left: 'calc(50% - 1px)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight gradient-text-brand">AgentRadar</h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Monitor de Prensa Deportiva</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Player Card */}
        {player && (
          <div className="bg-gradient-to-br from-red-900/25 via-red-800/10 to-transparent rounded-2xl p-6 mb-6 border border-red-500/10 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] animate-in slide-up">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src="/api/player-image?id=823631&name=Lukebakio"
                  alt={player.name}
                  className="w-28 h-28 rounded-2xl object-cover bg-black/40 ring-2 ring-white/10"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=Lukebakio&background=1a1a2e&color=fff&size=200&bold=true";
                  }}
                />
                <span className="absolute -bottom-1.5 -right-1.5 bg-red-600 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/30">
                  #{player.number}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold tracking-tight">{player.fullName}</h2>
                <p className="text-gray-400 text-sm mt-1">{player.team} · {player.position} · #{player.number}</p>
                <p className="text-gray-500 text-sm">{player.nationality} · {player.height}</p>
              </div>
              {stats && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
                  <div className="text-4xl font-bold gradient-text-brand font-mono">{stats.total}</div>
                  <div className="text-gray-500 text-sm mt-1">noticias totales</div>
                  <div className="text-emerald-400 text-sm mt-1 font-medium">+{stats.last7Days} esta semana</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="relative mb-8">
          <div className="flex gap-1 border-b border-white/[0.06] pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 rounded-t-xl ${
                  activeTab === tab.id
                    ? "text-white bg-white/[0.03]"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? "bg-blue-500/20 text-blue-400" : "bg-white/[0.03] text-gray-500"}`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 animate-in slide-up">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stats Cards */}
              {[
                { label: "Total Noticias", value: stats.total, sub: `+${stats.last7Days} esta semana`, color: "blue", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" },
                { label: "Sentimiento Positivo", value: stats.porSentimiento.positivo, sub: `${Math.round((stats.porSentimiento.positivo / stats.total) * 100)}% del total`, color: "emerald", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "Sentimiento Negativo", value: stats.porSentimiento.negativo, sub: `${Math.round((stats.porSentimiento.negativo / stats.total) * 100)}% del total`, color: "red", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "Países", value: Object.keys(stats.porPais || {}).length, sub: "con cobertura", color: "purple", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
              ].map((stat, i) => (
                <div key={i} className={`bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border transition-all duration-200 hover:bg-white/[0.06] hover:-translate-y-0.5 animate-in slide-up stagger-${i + 1} ${
                  stat.color === "emerald" ? "border-emerald-500/10" :
                  stat.color === "red" ? "border-red-500/10" :
                  stat.color === "purple" ? "border-purple-500/10" :
                  "border-blue-500/10"
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className={`w-4 h-4 ${
                      stat.color === "emerald" ? "text-emerald-400" :
                      stat.color === "red" ? "text-red-400" :
                      stat.color === "purple" ? "text-purple-400" :
                      "text-blue-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                    </svg>
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <div className={`text-3xl font-bold font-mono ${
                    stat.color === "emerald" ? "text-emerald-400" :
                    stat.color === "red" ? "text-red-400" :
                    stat.color === "purple" ? "text-purple-400" :
                    "text-white"
                  }`}>{stat.value}</div>
                  <div className={`text-sm mt-1 ${
                    stat.color === "blue" ? "text-blue-400" : "text-gray-500"
                  }`}>{stat.sub}</div>
                </div>
              ))}

              {/* Sentiment Bar */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] col-span-full animate-in slide-up stagger-5">
                <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-4">Distribución de Sentimiento</div>
                <div className="flex h-3 rounded-full overflow-hidden bg-white/[0.03]">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${(stats.porSentimiento.positivo / stats.total) * 100}%` }}
                  />
                  <div
                    className="bg-gray-600 transition-all duration-500"
                    style={{ width: `${(stats.porSentimiento.neutral / stats.total) * 100}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                    style={{ width: `${(stats.porSentimiento.negativo / stats.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-sm">
                  <span className="flex items-center gap-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Positivo: {stats.porSentimiento.positivo}</span>
                  <span className="flex items-center gap-2 text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-500" /> Neutral: {stats.porSentimiento.neutral}</span>
                  <span className="flex items-center gap-2 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400" /> Negativo: {stats.porSentimiento.negativo}</span>
                </div>
              </div>

              {/* Countries */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] col-span-full md:col-span-2 animate-in slide-up stagger-6">
                <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
                  </svg>
                  Noticias por País
                </div>
                <div className="space-y-3">
                  {Object.entries(stats.porPais || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([pais, count]) => (
                      <div key={pais}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-300 font-medium">{pais}</span>
                          <span className="text-gray-500 font-mono">{count}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent News Preview */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] col-span-full md:col-span-2 animate-in slide-up stagger-7">
                <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7" />
                  </svg>
                  Noticias Recientes
                </div>
                <div className="space-y-2">
                  {news.slice(0, 4).map((n) => (
                    <a
                      key={n.id}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            n.sentimiento?.tipo === "positivo"
                              ? "bg-emerald-400"
                              : n.sentimiento?.tipo === "negativo"
                              ? "bg-red-400"
                              : "bg-gray-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-200 group-hover:text-white line-clamp-1 transition-colors">{n.titulo}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {n.fuente} · {n.pais} · {new Date(n.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
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
              <div className="flex flex-wrap gap-4 mb-6 items-center">
                <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
                  {[
                    { id: "24h", label: "24h" },
                    { id: "7days", label: "7 días" },
                    { id: "30days", label: "30 días" },
                    { id: "all", label: "Todas" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setNewsFilter({ ...newsFilter, period: p.id })}
                      className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        newsFilter.period === p.id
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
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
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500/50 transition-colors"
                >
                  <option value="">Todos los países</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={newsFilter.sentiment}
                  onChange={(e) => setNewsFilter({ ...newsFilter, sentiment: e.target.value })}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500/50 transition-colors"
                >
                  <option value="">Todo sentimiento</option>
                  <option value="positivo">Positivo</option>
                  <option value="neutral">Neutral</option>
                  <option value="negativo">Negativo</option>
                </select>
                <div className="flex-1 text-right text-gray-500 text-sm font-mono">
                  {filteredNews.length} / {news.length}
                </div>
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNews.slice(0, 50).map((n, idx) => {
                  const isRecent = isLast24h(n.fecha);
                  return (
                    <a
                      key={n.id}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-2xl p-4 transition-all duration-200 block hover:-translate-y-1 group animate-in slide-up stagger-${Math.min(idx + 1, 8)} ${
                        isRecent
                          ? "bg-blue-900/15 border border-blue-500/20 hover:bg-blue-900/25 hover:border-blue-500/30 shadow-lg shadow-blue-500/5"
                          : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {isRecent && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 animate-pulse">
                            NUEVO
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            n.sentimiento?.tipo === "positivo"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : n.sentimiento?.tipo === "negativo"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-gray-500/15 text-gray-400"
                          }`}
                        >
                          {n.sentimiento?.tipo || "neutral"}
                        </span>
                        {n.esRumor && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/15 text-purple-400">
                            Rumor
                          </span>
                        )}
                        <span className="text-[10px] text-gray-600 ml-auto font-mono">{n.pais}</span>
                      </div>
                      <h3 className={`font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-white transition-colors ${isRecent ? "text-white" : "text-gray-200"}`}>
                        {n.titulo}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{n.descripcion}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="font-medium">{n.fuente}</span>
                        <span className="font-mono">{new Date(n.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
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
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-in slide-up stagger-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/20">𝕏</div>
                  <div>
                    <div className="font-bold">Twitter</div>
                    <div className="text-gray-500 text-sm">{social.platforms?.twitter?.handle}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-white/[0.04]">
                    <div className="text-xl font-bold font-mono">{(social.platforms?.twitter?.followers / 1000).toFixed(1)}K</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Seguidores</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-white/[0.04]">
                    <div className="text-xl font-bold font-mono">{social.platforms?.twitter?.tweets}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Tweets</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-white/[0.04]">
                    <div className="text-xl font-bold font-mono">{social.platforms?.twitter?.following}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Siguiendo</div>
                  </div>
                </div>
                {social.platforms?.twitter?.sentiment && (
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Sentimiento de Menciones</div>
                    <div className="flex h-2.5 rounded-full overflow-hidden bg-white/[0.03]">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${social.platforms.twitter.sentiment.positive}%` }} />
                      <div className="bg-gray-600" style={{ width: `${social.platforms.twitter.sentiment.neutral}%` }} />
                      <div className="bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${social.platforms.twitter.sentiment.negative}%` }} />
                    </div>
                  </div>
                )}
                {social.platforms?.twitter?.recentMentions && (
                  <div className="mt-5 space-y-2">
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider">Menciones Recientes</div>
                    {(Array.isArray(social.platforms.twitter.recentMentions)
                      ? social.platforms.twitter.recentMentions
                      : []
                    ).slice(0, 3).map((m: any, i: number) => (
                      <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-sm">
                        <div className="font-medium text-blue-400">{m.user}</div>
                        <div className="text-gray-300 mt-1 text-sm leading-relaxed">{m.text}</div>
                        <div className="text-gray-600 text-xs mt-2 font-mono">❤️ {m.likes} · 🔄 {m.retweets}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-in slide-up stagger-2">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-purple-500/20">📷</div>
                  <div>
                    <div className="font-bold">Instagram</div>
                    <div className="text-gray-500 text-sm">@{social.platforms?.instagram?.handle}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-white/[0.04]">
                    <div className="text-xl font-bold font-mono">{(social.platforms?.instagram?.followers / 1000).toFixed(0)}K</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Seguidores</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-white/[0.04]">
                    <div className="text-xl font-bold font-mono">{social.platforms?.instagram?.posts}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Posts</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-white/[0.04]">
                    <div className="text-xl font-bold font-mono">{social.engagementRate}%</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Engagement</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-white/[0.04]">
                    <div className="text-lg font-bold font-mono">{(social.platforms?.instagram?.avgLikes / 1000).toFixed(1)}K</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Likes promedio</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3 text-center border border-white/[0.04]">
                    <div className="text-lg font-bold font-mono">{social.platforms?.instagram?.avgComments}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Comentarios prom.</div>
                  </div>
                </div>
              </div>

              {/* Total Reach */}
              <div className="bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-cyan-900/10 rounded-2xl p-8 border border-blue-500/10 col-span-full text-center animate-in slide-up stagger-3">
                <div className="text-[11px] text-gray-500 uppercase tracking-widest">Alcance Total en Redes</div>
                <div className="text-5xl font-bold mt-3 gradient-text-brand font-mono">
                  {(social.totalReach / 1000).toFixed(0)}K
                </div>
                <div className="text-gray-500 mt-2">seguidores combinados</div>
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === "calendar" && calendar && (
            <div className="space-y-6">
              {/* Team Info */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-in slide-up">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Próximos Partidos - {calendar.team?.name}
                </h3>
                {calendar.matches?.length > 0 ? (
                  <div className="space-y-3">
                    {calendar.matches.map((match: any, i: number) => (
                      <div
                        key={match.id}
                        className={`bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center gap-5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 animate-in slide-up stagger-${Math.min(i + 1, 8)}`}
                      >
                        <div className="text-center min-w-[80px]">
                          <div className="text-xs text-gray-500 uppercase">
                            {new Date(match.date).toLocaleDateString("es-ES", { weekday: "short" })}
                          </div>
                          <div className="text-xl font-bold mt-0.5">
                            {new Date(match.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </div>
                          <div className="text-xs text-gray-600 font-mono mt-0.5">
                            {new Date(match.date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="w-px h-12 bg-white/[0.06]" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${match.isHome ? "text-white" : "text-gray-400"}`}>
                              {match.homeTeam}
                            </span>
                            <span className="text-gray-600 text-sm">vs</span>
                            <span className={`font-bold ${!match.isHome ? "text-white" : "text-gray-400"}`}>
                              {match.awayTeam}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{match.competition}</div>
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            match.isHome
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-orange-500/15 text-orange-400"
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
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-in slide-up stagger-2">
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    Selección Nacional - {calendar.nationalTeam.country}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                      <div className="text-3xl font-bold font-mono">{calendar.nationalTeam.caps}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Partidos</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                      <div className="text-3xl font-bold font-mono text-emerald-400">{calendar.nationalTeam.goals}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Goles</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-1">Última convocatoria</div>
                      <div className="font-bold">
                        {new Date(calendar.nationalTeam.lastCallUp).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
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
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-in slide-up">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Valor de Mercado
                </h3>
                <div className="flex items-end gap-8 mb-6">
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Valor Actual</div>
                    <div className="text-4xl font-bold text-emerald-400 font-mono">
                      {playerStats.marketValue?.current?.display || "15M €"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Valor Máximo</div>
                    <div className="text-2xl font-bold text-blue-400 font-mono">
                      {playerStats.marketValue?.peak?.display || "25M €"}
                    </div>
                    <div className="text-xs text-gray-600">{playerStats.marketValue?.peak?.date}</div>
                  </div>
                </div>
                {/* Chart */}
                <div className="h-40 flex items-end gap-1">
                  {playerStats.marketValue?.history?.map((h: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 group-hover:from-blue-400 group-hover:to-cyan-400 relative"
                        style={{ height: `${(h.value / 25) * 100}%` }}
                        title={`${h.date}: ${h.value}M €`}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1a1a24] text-[10px] px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-white/10 font-mono">
                          {h.value}M
                        </div>
                      </div>
                      {i % 3 === 0 && (
                        <div className="text-[9px] text-gray-600 mt-1.5 -rotate-45 origin-left font-mono">
                          {h.date}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfer History */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-in slide-up stagger-1">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Historial de Fichajes
                </h3>
                <div className="space-y-3">
                  {playerStats.marketValue?.transferHistory?.map((t: any, i: number) => (
                    <div key={i} className={`flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 relative overflow-hidden animate-in slide-up stagger-${Math.min(i + 1, 8)}`}>
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-400" />
                      <div className="text-gray-500 min-w-[60px] text-sm font-mono pl-3">{t.date}</div>
                      <div className="flex-1">
                        <span className="text-gray-400">{t.from}</span>
                        <span className="mx-2 text-gray-600">→</span>
                        <span className="font-medium text-white">{t.to}</span>
                      </div>
                      <div className={`font-bold font-mono ${t.fee === "Libre" || t.fee === "Cesión" ? "text-gray-400" : "text-emerald-400"}`}>
                        {t.fee}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contract */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-in slide-up stagger-2">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Contrato
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Fin de contrato", value: playerStats.contract?.expiryDate, color: "" },
                    { label: "Años restantes", value: playerStats.contract?.yearsRemaining, color: "" },
                    { label: "Salario", value: playerStats.contract?.estimatedSalary, color: "" },
                    { label: "Cláusula", value: playerStats.contract?.releaseClause, color: "text-yellow-400" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</div>
                      <div className={`font-bold mt-1.5 font-mono ${item.color}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {playerStats.contract?.agent && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] text-sm text-gray-400">
                    Agente: <span className="text-white font-medium">{playerStats.contract.agent.name}</span> <span className="text-gray-600">({playerStats.contract.agent.agency})</span>
                  </div>
                )}
              </div>

              {/* Injuries */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-in slide-up stagger-3">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Historial de Lesiones
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold font-mono">{playerStats.injuries?.stats?.totalInjuries || 0}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Lesiones totales</div>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-400 font-mono">{playerStats.injuries?.stats?.totalDaysOut || 0}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Días de baja</div>
                  </div>
                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400 font-mono">{playerStats.injuries?.stats?.totalGamesMissed || 0}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Partidos perdidos</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {playerStats.injuries?.history?.map((inj: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        inj.severity === "Leve" ? "bg-yellow-500 shadow-lg shadow-yellow-500/30" :
                        inj.severity === "Moderada" ? "bg-orange-500 shadow-lg shadow-orange-500/30" :
                        "bg-red-500 shadow-lg shadow-red-500/30"
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{inj.type}</div>
                        <div className="text-xs text-gray-500">{inj.area}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-mono">{inj.days} días</div>
                        <div className="text-gray-500 text-xs">{inj.missedGames} partidos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Season Stats */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] animate-in slide-up stagger-4">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Estadísticas de Temporada
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
                  {[
                    { label: "Partidos", value: playerStats.performance?.currentSeason?.appearances },
                    { label: "Goles", value: playerStats.performance?.currentSeason?.goals, color: "text-emerald-400" },
                    { label: "Asistencias", value: playerStats.performance?.currentSeason?.assists, color: "text-blue-400" },
                    { label: "Minutos", value: playerStats.performance?.currentSeason?.minutesPlayed },
                    { label: "Amarillas", value: playerStats.performance?.currentSeason?.yellowCards, color: "text-yellow-400" },
                    { label: "Rojas", value: playerStats.performance?.currentSeason?.redCards, color: "text-red-400" },
                    { label: "Rating", value: playerStats.performance?.currentSeason?.rating },
                    { label: "Pases %", value: playerStats.performance?.currentSeason?.passAccuracy },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center">
                      <div className={`text-xl font-bold font-mono ${stat.color || ""}`}>{stat.value || 0}</div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Season History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-white/[0.06]">
                        <th className="text-left py-3 text-[11px] uppercase tracking-wider font-medium">Temporada</th>
                        <th className="text-left py-3 text-[11px] uppercase tracking-wider font-medium">Equipo</th>
                        <th className="text-center py-3 text-[11px] uppercase tracking-wider font-medium">PJ</th>
                        <th className="text-center py-3 text-[11px] uppercase tracking-wider font-medium">G</th>
                        <th className="text-center py-3 text-[11px] uppercase tracking-wider font-medium">A</th>
                        <th className="text-center py-3 text-[11px] uppercase tracking-wider font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.performance?.seasonHistory?.map((s: any, i: number) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-mono">{s.season}</td>
                          <td className="py-3">{s.team}</td>
                          <td className="text-center py-3 font-mono">{s.apps}</td>
                          <td className="text-center py-3 font-mono text-emerald-400">{s.goals}</td>
                          <td className="text-center py-3 font-mono text-blue-400">{s.assists}</td>
                          <td className="text-center py-3 font-mono">{s.rating}</td>
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
      <footer className="border-t border-white/[0.06] mt-12 py-8 text-center">
        <p className="text-gray-600 text-sm">AgentRadar © 2026 · Monitor de Prensa para Representantes</p>
      </footer>
    </div>
  );
}
