"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import data from "@/data/lukebakio-complete.json";

type Tab = "resumen" | "noticias" | "social" | "calendario" | "historial";

export default function PlayerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("resumen");
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [newsFilter, setNewsFilter] = useState({ region: "all", sentiment: "all" });
  const [socialTab, setSocialTab] = useState<"twitter" | "instagram">("twitter");

  const player = data.player as any;
  const allNews = data.news.all as any[];
  const byRegion = data.news.byRegion as Record<string, any[]>;
  const stats = data.stats as any;
  const social = data.social as any;
  const marketValue = data.marketValue as any;
  const injuries = data.injuries as any;
  const contract = data.contract as any;
  const performance = data.performance as any;
  const matches = data.upcomingMatches as any[];
  const alerts = data.alerts as any;

  // Filtered news
  const filteredNews = useMemo(() => {
    return allNews.filter((n) => {
      if (newsFilter.region !== "all" && n.region !== newsFilter.region) return false;
      if (newsFilter.sentiment !== "all" && n.sentimiento?.tipo !== newsFilter.sentiment) return false;
      return true;
    });
  }, [allNews, newsFilter]);

  // National vs International
  const nationalNews = useMemo(() => allNews.filter(n =>
    n.region === "spain_national" || n.region === "spain_local" || n.region === "spanish_national" || n.region === "local_andalusia"
  ), [allNews]);
  const internationalNews = useMemo(() => allNews.filter(n =>
    !["spain_national", "spain_local", "spanish_national", "local_andalusia"].includes(n.region)
  ), [allNews]);

  // AI Analysis
  const fetchAiAnalysis = async (news: any) => {
    setLoadingAi(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: news.titulo, descripcion: news.descripcion, jugador: player.name, fuente: news.fuente }),
      });
      const result = await res.json();
      setAiAnalysis(result.analysis || result.error);
    } catch {
      setAiAnalysis("Error al conectar.");
    } finally {
      setLoadingAi(false);
    }
  };

  const openNews = (news: any) => {
    setSelectedNews(news);
    fetchAiAnalysis(news);
  };

  // Helpers
  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - date.getTime()) / 3600000);
    if (diffH < 1) return "Hace menos de 1h";
    if (diffH < 24) return `Hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Hace ${diffD}d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const formatNum = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toString();

  const langFlag: Record<string, string> = { es: "🇪🇸", en: "🇬🇧", fr: "🇫🇷", nl: "🇧🇪", de: "🇩🇪", it: "🇮🇹" };
  const regionName: Record<string, string> = {
    spain_national: "España Nacional", spain_local: "España Local", spanish_national: "España Nacional",
    local_andalusia: "Sevilla Local", belgium: "Bélgica", belgian: "Bélgica", france: "Francia",
    uk: "Reino Unido", italy: "Italia", germany: "Alemania", transfers: "Fichajes", international: "Internacional"
  };

  const tabs = [
    { id: "resumen" as Tab, label: "Resumen", icon: "📊" },
    { id: "noticias" as Tab, label: "Noticias", icon: "📰", count: allNews.length },
    { id: "social" as Tab, label: "RRSS", icon: "📱" },
    { id: "calendario" as Tab, label: "Calendario", icon: "📅", count: matches.length },
    { id: "historial" as Tab, label: "Historial", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-gradient-to-r from-red-900/40 via-[#111] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <Link href="/" className="text-gray-500 hover:text-white text-sm mb-3 inline-block">← Dashboard</Link>

          <div className="flex flex-wrap items-start gap-5">
            <div className="relative">
              <img src={player.photo} alt={player.name} className="w-24 h-24 rounded-xl object-cover bg-black/50" />
              <span className="absolute -bottom-1 -right-1 bg-red-600 text-xs font-bold px-2 py-0.5 rounded">#{player.number}</span>
            </div>

            <div className="flex-1 min-w-[200px]">
              <h1 className="text-2xl font-bold">{player.fullName}</h1>
              <p className="text-gray-400 text-sm">{player.team} · {player.position} · {player.nationality}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span>{performance?.international?.flag} {performance?.international?.caps} caps</span>
                <span>📋 Hasta {contract?.endDate?.split("-")[0]}</span>
                <span>👔 {contract?.agent?.name}</span>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{marketValue?.current?.display}</p>
              <p className="text-xs text-gray-500">Valor de mercado</p>
              <p className="text-xs text-gray-600">Peak: {marketValue?.peak?.display}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts Banner */}
      {(alerts?.newNews > 0 || alerts?.newRumors > 0) && (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4 text-sm">
            <span className="text-blue-400 font-medium">🔔 HOY:</span>
            {alerts.newNews > 0 && <span>{alerts.newNews} noticias nuevas</span>}
            {alerts.newRumors > 0 && <span className="text-purple-400">{alerts.newRumors} rumores</span>}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="border-b border-white/10 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3 text-center text-sm">
            <div><p className="text-lg font-bold">{performance?.appearances}</p><p className="text-xs text-gray-500">Partidos</p></div>
            <div><p className="text-lg font-bold text-emerald-400">{performance?.goals}</p><p className="text-xs text-gray-500">Goles</p></div>
            <div><p className="text-lg font-bold text-blue-400">{performance?.assists}</p><p className="text-xs text-gray-500">Asist</p></div>
            <div><p className="text-lg font-bold">{performance?.rating}</p><p className="text-xs text-gray-500">Rating</p></div>
            <div><p className="text-lg font-bold">{stats?.total}</p><p className="text-xs text-gray-500">Noticias</p></div>
            <div><p className="text-lg font-bold text-purple-400">{stats?.rumores}</p><p className="text-xs text-gray-500">Rumores</p></div>
            <div><p className="text-lg font-bold">{formatNum(stats?.alcanceTotal || 0)}</p><p className="text-xs text-gray-500">Alcance</p></div>
            <div><p className="text-lg font-bold">{formatNum(social?.totalReach || 0)}</p><p className="text-xs text-gray-500">Seguidores</p></div>
            <div><p className="text-lg font-bold">{social?.overallEngagement}%</p><p className="text-xs text-gray-500">Engage</p></div>
            <div><p className="text-lg font-bold">{injuries?.stats?.currentStatus === "Disponible" ? "✅" : "🔴"}</p><p className="text-xs text-gray-500">Estado</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id ? "border-red-500 text-white" : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && <span className="text-xs opacity-60">({tab.count})</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ========== RESUMEN ========== */}
        {activeTab === "resumen" && (
          <div className="space-y-6">
            {/* Media Overview - Nacional vs Internacional */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">🇪🇸 Prensa Nacional ({nationalNews.length})</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-emerald-400">{nationalNews.filter(n => n.sentimiento?.tipo === "positivo").length}</p>
                    <p className="text-xs text-gray-500">Positivas</p>
                  </div>
                  <div className="bg-gray-500/10 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{nationalNews.filter(n => !n.sentimiento?.tipo || n.sentimiento?.tipo === "neutral").length}</p>
                    <p className="text-xs text-gray-500">Neutrales</p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-red-400">{nationalNews.filter(n => n.sentimiento?.tipo === "negativo").length}</p>
                    <p className="text-xs text-gray-500">Negativas</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {nationalNews.slice(0, 3).map((n, i) => (
                    <div key={i} onClick={() => openNews(n)} className="bg-[#0a0a0a] rounded-lg p-2 cursor-pointer hover:bg-[#1a1a1a]">
                      <p className="text-sm line-clamp-1">{n.titulo}</p>
                      <p className="text-xs text-gray-500">{n.fuente} · {formatDate(n.fecha)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">🌍 Prensa Internacional ({internationalNews.length})</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(stats?.porPais || {}).filter(([p]) => p !== "España" && p !== "España (Sevilla)").slice(0, 6).map(([pais, count]: [string, any]) => (
                    <span key={pais} className="px-2 py-1 bg-[#1a1a1a] rounded text-xs">{pais}: {count}</span>
                  ))}
                </div>
                <div className="space-y-2">
                  {internationalNews.slice(0, 3).map((n, i) => (
                    <div key={i} onClick={() => openNews(n)} className="bg-[#0a0a0a] rounded-lg p-2 cursor-pointer hover:bg-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        <span>{langFlag[n.idioma] || "🌐"}</span>
                        <p className="text-sm line-clamp-1 flex-1">{n.titulo}</p>
                      </div>
                      <p className="text-xs text-gray-500">{n.fuente} · {formatDate(n.fecha)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Value Chart */}
            <div className="bg-[#111] rounded-xl p-5 border border-white/5">
              <h3 className="font-semibold mb-4">📈 Evolución Valor de Mercado</h3>
              <div className="h-40 flex items-end gap-1">
                {marketValue?.history?.map((h: any, i: number) => {
                  const max = Math.max(...marketValue.history.map((x: any) => x.value));
                  const pct = (h.value / max) * 100;
                  const isRecent = i >= marketValue.history.length - 3;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <span className="text-[10px] text-gray-500 mb-1">{h.value}M</span>
                      <div
                        className={`w-full rounded-t transition-all ${isRecent ? "bg-emerald-500" : "bg-emerald-500/50"}`}
                        style={{ height: `${pct}%`, minHeight: "4px" }}
                      />
                      <span className="text-[9px] text-gray-600 mt-1">{h.date.split("-")[0].slice(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5 text-sm">
                <div><span className="text-gray-500">Actual:</span> <span className="font-bold text-emerald-400">{marketValue?.current?.display}</span></div>
                <div><span className="text-gray-500">Máximo:</span> <span className="font-bold">{marketValue?.peak?.display}</span></div>
                <div><span className="text-gray-500">Último traspaso:</span> <span className="font-bold">€10M (2022)</span></div>
              </div>
            </div>

            {/* Performance + Contract + Injuries Row */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Performance */}
              <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                <h3 className="font-semibold mb-3">⚽ Rendimiento {performance?.season}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Partidos</span><span>{performance?.appearances}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Titular</span><span>{performance?.starts}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Goles</span><span className="text-emerald-400">{performance?.goals}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Asistencias</span><span className="text-blue-400">{performance?.assists}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Minutos</span><span>{performance?.minutesPlayed}'</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Rating</span><span>{performance?.rating}</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Forma (últimos 5)</p>
                  <div className="flex gap-1">
                    {performance?.form?.map((r: string, i: number) => (
                      <span key={i} className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${r === "W" ? "bg-emerald-500" : r === "D" ? "bg-gray-500" : "bg-red-500"}`}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contract */}
              <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                <h3 className="font-semibold mb-3">📋 Contrato</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Firmado</span><span>{contract?.signedDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Finaliza</span><span className="font-medium">{contract?.endDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Años restantes</span><span>{contract?.yearsRemaining?.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Salario bruto</span><span>{contract?.salaryGross}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Cláusula</span><span className="text-emerald-400 font-bold">{contract?.releaseClause}</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 text-sm">
                  <p className="text-gray-500">Agente</p>
                  <p className="font-medium">{contract?.agent?.name}</p>
                  <p className="text-xs text-gray-500">{contract?.agent?.agency}</p>
                </div>
              </div>

              {/* Injuries Summary */}
              <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                <h3 className="font-semibold mb-3">🏥 Lesiones</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-2xl ${injuries?.stats?.currentStatus === "Disponible" ? "" : "grayscale"}`}>
                    {injuries?.stats?.currentStatus === "Disponible" ? "✅" : "🔴"}
                  </span>
                  <div>
                    <p className="font-medium">{injuries?.stats?.currentStatus}</p>
                    <p className="text-xs text-gray-500">Estado actual</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Total lesiones</span><span>{injuries?.stats?.totalInjuries}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Días baja total</span><span>{injuries?.stats?.totalDaysOut}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Partidos perdidos</span><span className="text-red-400">{injuries?.stats?.totalGamesMissed}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Recuperación media</span><span>{injuries?.stats?.avgRecoveryDays}d</span></div>
                </div>
              </div>
            </div>

            {/* Upcoming Matches */}
            {matches.length > 0 && (
              <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                <h3 className="font-semibold mb-4">📅 Próximos Partidos</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {matches.slice(0, 3).map((m: any, i: number) => (
                    <div key={i} className="bg-[#0a0a0a] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">{m.competition}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${m.isHome ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>
                          {m.venue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={m.isHome ? "font-bold" : ""}>{m.homeTeam}</span>
                        <span className="text-gray-500">vs</span>
                        <span className={!m.isHome ? "font-bold" : ""}>{m.awayTeam}</span>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {new Date(m.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== NOTICIAS ========== */}
        {activeTab === "noticias" && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <select
                value={newsFilter.region}
                onChange={(e) => setNewsFilter({ ...newsFilter, region: e.target.value })}
                className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todas las regiones</option>
                {Object.keys(byRegion).map((r) => (
                  <option key={r} value={r}>{regionName[r] || r} ({byRegion[r].length})</option>
                ))}
              </select>
              <select
                value={newsFilter.sentiment}
                onChange={(e) => setNewsFilter({ ...newsFilter, sentiment: e.target.value })}
                className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todo sentimiento</option>
                <option value="positivo">Positivas ({stats?.porSentimiento?.positivo})</option>
                <option value="neutral">Neutrales ({stats?.porSentimiento?.neutral})</option>
                <option value="negativo">Negativas ({stats?.porSentimiento?.negativo})</option>
              </select>
            </div>

            {/* News by Region Groups */}
            {newsFilter.region === "all" ? (
              <div className="space-y-8">
                {Object.entries(byRegion).sort((a, b) => b[1].length - a[1].length).map(([region, news]) => (
                  <div key={region}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      {langFlag[news[0]?.idioma] || "🌐"} {regionName[region] || region} ({news.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {news.slice(0, 6).map((n: any, i: number) => (
                        <div key={i} onClick={() => openNews(n)} className="bg-[#111] rounded-lg p-3 border border-white/5 cursor-pointer hover:border-white/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${n.sentimiento?.tipo === "positivo" ? "bg-emerald-500" : n.sentimiento?.tipo === "negativo" ? "bg-red-500" : "bg-gray-500"}`} />
                            <span className="text-xs text-gray-500">{n.fuente}</span>
                            {n.esRumor && <span className="text-xs text-purple-400">Rumor</span>}
                          </div>
                          <p className="text-sm line-clamp-2">{n.titulo}</p>
                          <p className="text-xs text-gray-600 mt-1">{formatDate(n.fecha)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNews.map((n: any, i: number) => (
                  <div key={i} onClick={() => openNews(n)} className="bg-[#111] rounded-lg p-4 border border-white/5 cursor-pointer hover:border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{langFlag[n.idioma] || "🌐"}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${n.sentimiento?.tipo === "positivo" ? "bg-emerald-500/20 text-emerald-400" : n.sentimiento?.tipo === "negativo" ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {n.sentimiento?.tipo || "neutral"}
                      </span>
                      {n.esRumor && <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">Rumor</span>}
                    </div>
                    <p className="font-medium text-sm mb-2 line-clamp-2">{n.titulo}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{n.fuente}</span>
                      <span>{formatDate(n.fecha)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== SOCIAL ========== */}
        {activeTab === "social" && (
          <div className="space-y-6">
            {/* Social Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setSocialTab("twitter")}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${socialTab === "twitter" ? "bg-blue-500 text-white" : "bg-[#111] text-gray-400"}`}
              >
                𝕏 Twitter
              </button>
              <button
                onClick={() => setSocialTab("instagram")}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${socialTab === "instagram" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-[#111] text-gray-400"}`}
              >
                📸 Instagram
              </button>
            </div>

            {socialTab === "twitter" && (
              <div className="space-y-6">
                {/* Twitter Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-[#111] rounded-xl p-4 text-center border border-white/5">
                    <p className="text-2xl font-bold">{formatNum(social?.twitter?.followers || 0)}</p>
                    <p className="text-xs text-gray-500">Seguidores</p>
                  </div>
                  <div className="bg-[#111] rounded-xl p-4 text-center border border-white/5">
                    <p className="text-2xl font-bold">{social?.twitter?.tweets}</p>
                    <p className="text-xs text-gray-500">Tweets</p>
                  </div>
                  <div className="bg-[#111] rounded-xl p-4 text-center border border-white/5">
                    <p className="text-2xl font-bold">{social?.twitter?.recentMentions?.last24h}</p>
                    <p className="text-xs text-gray-500">Menciones 24h</p>
                  </div>
                  <div className="bg-[#111] rounded-xl p-4 text-center border border-white/5">
                    <p className="text-2xl font-bold">{social?.twitter?.recentMentions?.last7d}</p>
                    <p className="text-xs text-gray-500">Menciones 7d</p>
                  </div>
                </div>

                {/* Twitter Sentiment */}
                <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                  <h3 className="font-semibold mb-4">Sentimiento de Menciones en Twitter</h3>
                  <div className="flex gap-1 h-4 rounded-full overflow-hidden mb-3">
                    <div className="bg-emerald-500" style={{ width: `${social?.twitter?.recentMentions?.sentiment?.positive}%` }} />
                    <div className="bg-gray-500" style={{ width: `${social?.twitter?.recentMentions?.sentiment?.neutral}%` }} />
                    <div className="bg-red-500" style={{ width: `${social?.twitter?.recentMentions?.sentiment?.negative}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">{social?.twitter?.recentMentions?.sentiment?.positive}% positivo</span>
                    <span className="text-gray-400">{social?.twitter?.recentMentions?.sentiment?.neutral}% neutral</span>
                    <span className="text-red-400">{social?.twitter?.recentMentions?.sentiment?.negative}% negativo</span>
                  </div>
                </div>

                {/* Top Mentions */}
                <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                  <h3 className="font-semibold mb-4">Menciones Destacadas</h3>
                  <div className="space-y-4">
                    {social?.twitter?.topMentions?.map((m: any, i: number) => (
                      <div key={i} className="bg-[#0a0a0a] rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-blue-400 font-medium">{m.user}</span>
                          <span className="text-xs text-gray-500">{formatDate(m.date)}</span>
                        </div>
                        <p className="text-sm mb-2">{m.text}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>❤️ {formatNum(m.likes)}</span>
                          <span>🔄 {formatNum(m.retweets)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {socialTab === "instagram" && (
              <div className="space-y-6">
                {/* Instagram Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-[#111] rounded-xl p-4 text-center border border-white/5">
                    <p className="text-2xl font-bold">{formatNum(social?.instagram?.followers || 0)}</p>
                    <p className="text-xs text-gray-500">Seguidores</p>
                  </div>
                  <div className="bg-[#111] rounded-xl p-4 text-center border border-white/5">
                    <p className="text-2xl font-bold">{social?.instagram?.posts}</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  <div className="bg-[#111] rounded-xl p-4 text-center border border-white/5">
                    <p className="text-2xl font-bold">{formatNum(social?.instagram?.avgLikes || 0)}</p>
                    <p className="text-xs text-gray-500">Likes/post</p>
                  </div>
                  <div className="bg-[#111] rounded-xl p-4 text-center border border-white/5">
                    <p className="text-2xl font-bold">{social?.instagram?.engagementRate}%</p>
                    <p className="text-xs text-gray-500">Engagement</p>
                  </div>
                </div>

                {/* Comment Sentiment */}
                <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                  <h3 className="font-semibold mb-4">Sentimiento de Comentarios</h3>
                  <div className="flex gap-1 h-4 rounded-full overflow-hidden mb-3">
                    <div className="bg-emerald-500" style={{ width: `${social?.instagram?.commentSentiment?.positive}%` }} />
                    <div className="bg-gray-500" style={{ width: `${social?.instagram?.commentSentiment?.neutral}%` }} />
                    <div className="bg-red-500" style={{ width: `${social?.instagram?.commentSentiment?.negative}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">{social?.instagram?.commentSentiment?.positive}% positivo</span>
                    <span className="text-gray-400">{social?.instagram?.commentSentiment?.neutral}% neutral</span>
                    <span className="text-red-400">{social?.instagram?.commentSentiment?.negative}% negativo</span>
                  </div>
                </div>

                {/* Recent Posts */}
                <div className="bg-[#111] rounded-xl p-5 border border-white/5">
                  <h3 className="font-semibold mb-4">Posts Recientes</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {social?.instagram?.recentPosts?.map((p: any, i: number) => (
                      <div key={i} className="bg-[#0a0a0a] rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs px-2 py-0.5 bg-[#1a1a1a] rounded">{p.type}</span>
                          <span className="text-xs text-gray-500">{formatDate(p.date)}</span>
                        </div>
                        <p className="text-sm mb-2">{p.caption}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>❤️ {formatNum(p.likes)}</span>
                          <span>💬 {p.comments}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== CALENDARIO ========== */}
        {activeTab === "calendario" && (
          <div className="space-y-6">
            <div className="bg-[#111] rounded-xl p-5 border border-white/5">
              <h3 className="font-semibold mb-4">📅 Próximos Partidos de Sevilla FC</h3>
              <div className="space-y-3">
                {matches.map((m: any, i: number) => (
                  <div key={i} className="bg-[#0a0a0a] rounded-lg p-4 flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold">{new Date(m.date).getDate()}</p>
                      <p className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString("es-ES", { month: "short" })}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${m.isHome ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>
                          {m.venue}
                        </span>
                        <span className="text-xs text-gray-500">{m.competition}</span>
                      </div>
                      <p className="font-medium mt-1">
                        {m.homeTeam} vs {m.awayTeam}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(m.date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* National Team */}
            <div className="bg-[#111] rounded-xl p-5 border border-white/5">
              <h3 className="font-semibold mb-4">{performance?.international?.flag} Selección de {performance?.international?.country}</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div><p className="text-xl font-bold">{performance?.international?.caps}</p><p className="text-xs text-gray-500">Partidos</p></div>
                <div><p className="text-xl font-bold">{performance?.international?.goals}</p><p className="text-xs text-gray-500">Goles</p></div>
                <div><p className="text-xl font-bold">{performance?.international?.assists}</p><p className="text-xs text-gray-500">Asistencias</p></div>
                <div><p className="text-sm font-medium">{performance?.international?.lastCallUp}</p><p className="text-xs text-gray-500">Última convocatoria</p></div>
              </div>
            </div>
          </div>
        )}

        {/* ========== HISTORIAL ========== */}
        {activeTab === "historial" && (
          <div className="space-y-6">
            {/* Injury History */}
            <div className="bg-[#111] rounded-xl p-5 border border-white/5">
              <h3 className="font-semibold mb-4">🏥 Historial Completo de Lesiones</h3>
              <div className="space-y-3">
                {injuries?.list?.map((inj: any) => (
                  <div key={inj.id} className="bg-[#0a0a0a] rounded-lg p-4 flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-1 ${inj.severity === "Leve" ? "bg-yellow-500" : inj.severity === "Moderada" ? "bg-orange-500" : "bg-red-500"}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{inj.type}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${inj.status === "Recuperado" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {inj.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{inj.area}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>📅 {inj.startDate} → {inj.endDate}</span>
                        <span>⏱️ {inj.days} días</span>
                        <span>❌ {inj.missedGames} partidos</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfer History */}
            <div className="bg-[#111] rounded-xl p-5 border border-white/5">
              <h3 className="font-semibold mb-4">💰 Historial de Traspasos</h3>
              <div className="space-y-3">
                {marketValue?.transferHistory?.map((t: any, i: number) => (
                  <div key={i} className="bg-[#0a0a0a] rounded-lg p-4 flex items-center gap-4">
                    <span className="text-sm font-medium min-w-[60px]">{t.date}</span>
                    <div className="flex-1">
                      <p>{t.from} → {t.to}</p>
                    </div>
                    <span className={`font-bold ${t.type === "loan" ? "text-blue-400" : "text-emerald-400"}`}>{t.fee}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Season History */}
            <div className="bg-[#111] rounded-xl p-5 border border-white/5">
              <h3 className="font-semibold mb-4">📊 Estadísticas por Temporada</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-white/10">
                      <th className="pb-2">Temporada</th>
                      <th className="pb-2">Equipo</th>
                      <th className="pb-2 text-center">PJ</th>
                      <th className="pb-2 text-center">Goles</th>
                      <th className="pb-2 text-center">Asist</th>
                      <th className="pb-2 text-center">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance?.seasonHistory?.map((s: any, i: number) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2">{s.season}</td>
                        <td className="py-2">{s.team}</td>
                        <td className="py-2 text-center">{s.apps}</td>
                        <td className="py-2 text-center text-emerald-400">{s.goals}</td>
                        <td className="py-2 text-center text-blue-400">{s.assists}</td>
                        <td className="py-2 text-center">{s.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setSelectedNews(null); setAiAnalysis(null); }}>
          <div className="bg-[#111] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{langFlag[selectedNews.idioma] || "🌐"}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${selectedNews.sentimiento?.tipo === "positivo" ? "bg-emerald-500/20 text-emerald-400" : selectedNews.sentimiento?.tipo === "negativo" ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400"}`}>
                  {selectedNews.sentimiento?.tipo?.toUpperCase() || "NEUTRAL"}
                </span>
                {selectedNews.esRumor && <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">RUMOR</span>}
              </div>
              <h2 className="text-lg font-bold">{selectedNews.titulo}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-0.5 bg-[#1a1a1a] rounded">{selectedNews.fuente}</span>
                <span>{formatDate(selectedNews.fecha)}</span>
                <span>·</span>
                <span>{selectedNews.pais}</span>
              </div>

              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/30">
                <h4 className="font-medium mb-2">🤖 Análisis con IA</h4>
                {loadingAi ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    Analizando...
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">{aiAnalysis}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <a href={selectedNews.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium text-center">
                  Leer completa →
                </a>
                <button onClick={() => { setSelectedNews(null); setAiAnalysis(null); }} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
