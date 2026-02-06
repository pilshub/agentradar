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
    { id: "resumen" as Tab, label: "Resumen", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { id: "noticias" as Tab, label: "Noticias", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", count: allNews.length },
    { id: "social" as Tab, label: "RRSS", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
    { id: "calendario" as Tab, label: "Calendario", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", count: matches.length },
    { id: "historial" as Tab, label: "Historial", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-gradient-to-r from-red-900/25 via-[#0c0c10] to-[#050507]">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <Link href="/" className="text-gray-500 hover:text-white text-sm mb-4 inline-flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>

          <div className="flex flex-wrap items-start gap-6 mt-2">
            <div className="relative">
              <img
                src={player.photo}
                alt={player.name}
                className="w-28 h-28 rounded-2xl object-cover bg-black/40 ring-2 ring-white/10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1a1a2e&color=fff&size=200&bold=true`;
                }}
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-red-600 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/30">#{player.number}</span>
            </div>

            <div className="flex-1 min-w-[200px]">
              <h1 className="text-3xl font-bold tracking-tight">{player.fullName}</h1>
              <p className="text-gray-400 text-sm mt-1">{player.team} · {player.position} · {player.nationality}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-gray-300">{performance?.international?.flag} {performance?.international?.caps} caps</span>
                <span className="flex items-center gap-1.5 text-gray-300">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Hasta {contract?.endDate?.split("-")[0]}
                </span>
                <span className="flex items-center gap-1.5 text-gray-300">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {contract?.agent?.name}
                </span>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center backdrop-blur-xl">
              <p className="text-3xl font-bold text-emerald-400 font-mono">{marketValue?.current?.display}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Valor de mercado</p>
              <p className="text-xs text-gray-600 mt-0.5">Peak: {marketValue?.peak?.display}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts Banner */}
      {(alerts?.newNews > 0 || alerts?.newRumors > 0) && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/15 border-b border-blue-500/10">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4 text-sm">
            <span className="text-blue-400 font-semibold flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              HOY:
            </span>
            {alerts.newNews > 0 && <span className="text-gray-300">{alerts.newNews} noticias nuevas</span>}
            {alerts.newRumors > 0 && <span className="text-purple-400">{alerts.newRumors} rumores</span>}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="border-b border-white/[0.06] bg-[#0c0c10]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3 text-center text-sm">
            {[
              { val: performance?.appearances, label: "Partidos" },
              { val: performance?.goals, label: "Goles", color: "text-emerald-400" },
              { val: performance?.assists, label: "Asist", color: "text-blue-400" },
              { val: performance?.rating, label: "Rating" },
              { val: stats?.total, label: "Noticias" },
              { val: stats?.rumores, label: "Rumores", color: "text-purple-400" },
              { val: formatNum(stats?.alcanceTotal || 0), label: "Alcance" },
              { val: formatNum(social?.totalReach || 0), label: "Seguidores" },
              { val: `${social?.overallEngagement}%`, label: "Engage" },
              { val: injuries?.stats?.currentStatus === "Disponible" ? "✅" : "🔴", label: "Estado" },
            ].map((s, i) => (
              <div key={i} className="py-1">
                <p className={`text-lg font-bold font-mono ${s.color || ""}`}>{s.val}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06] sticky top-0 bg-[#050507]/95 backdrop-blur-xl z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-200 ${
                  activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                {tab.label}
                {tab.count !== undefined && <span className="text-[10px] opacity-60 font-mono">({tab.count})</span>}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ========== RESUMEN ========== */}
        {activeTab === "resumen" && (
          <div className="space-y-6 animate-in slide-up">
            {/* Media Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] animate-in slide-up stagger-1">
                <h3 className="font-semibold mb-4 flex items-center gap-2">🇪🇸 Prensa Nacional <span className="text-gray-500 font-normal text-sm">({nationalNews.length})</span></h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/10 rounded-xl p-2.5 text-center">
                    <p className="text-lg font-bold text-emerald-400 font-mono">{nationalNews.filter(n => n.sentimiento?.tipo === "positivo").length}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Positivas</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 text-center">
                    <p className="text-lg font-bold font-mono">{nationalNews.filter(n => !n.sentimiento?.tipo || n.sentimiento?.tipo === "neutral").length}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Neutrales</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/10 rounded-xl p-2.5 text-center">
                    <p className="text-lg font-bold text-red-400 font-mono">{nationalNews.filter(n => n.sentimiento?.tipo === "negativo").length}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Negativas</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {nationalNews.slice(0, 3).map((n, i) => (
                    <div key={i} onClick={() => openNews(n)} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 group">
                      <p className="text-sm line-clamp-1 group-hover:text-white transition-colors">{n.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.fuente} · {formatDate(n.fecha)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] animate-in slide-up stagger-2">
                <h3 className="font-semibold mb-4 flex items-center gap-2">🌍 Prensa Internacional <span className="text-gray-500 font-normal text-sm">({internationalNews.length})</span></h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(stats?.porPais || {}).filter(([p]) => p !== "España" && p !== "España (Sevilla)").slice(0, 6).map(([pais, count]: [string, any]) => (
                    <span key={pais} className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs font-mono">{pais}: {count}</span>
                  ))}
                </div>
                <div className="space-y-2">
                  {internationalNews.slice(0, 3).map((n, i) => (
                    <div key={i} onClick={() => openNews(n)} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 group">
                      <div className="flex items-center gap-2">
                        <span>{langFlag[n.idioma] || "🌐"}</span>
                        <p className="text-sm line-clamp-1 flex-1 group-hover:text-white transition-colors">{n.titulo}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{n.fuente} · {formatDate(n.fecha)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Value Chart */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] animate-in slide-up stagger-3">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Evolución Valor de Mercado
              </h3>
              <div className="h-40 flex items-end gap-1">
                {marketValue?.history?.map((h: any, i: number) => {
                  const max = Math.max(...marketValue.history.map((x: any) => x.value));
                  const pct = (h.value / max) * 100;
                  const isRecent = i >= marketValue.history.length - 3;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <span className="text-[10px] text-gray-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono">{h.value}M</span>
                      <div
                        className={`w-full rounded-t transition-all duration-300 group-hover:opacity-80 ${isRecent ? "bg-gradient-to-t from-emerald-500 to-emerald-400" : "bg-gradient-to-t from-emerald-500/50 to-emerald-400/50"}`}
                        style={{ height: `${pct}%`, minHeight: "4px" }}
                      />
                      <span className="text-[9px] text-gray-600 mt-1 font-mono">{h.date.split("-")[0].slice(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/[0.06] text-sm">
                <div><span className="text-gray-500">Actual:</span> <span className="font-bold text-emerald-400 font-mono">{marketValue?.current?.display}</span></div>
                <div><span className="text-gray-500">Máximo:</span> <span className="font-bold font-mono">{marketValue?.peak?.display}</span></div>
                <div><span className="text-gray-500">Último traspaso:</span> <span className="font-bold font-mono">€10M (2022)</span></div>
              </div>
            </div>

            {/* Performance + Contract + Injuries Row */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Performance */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] animate-in slide-up stagger-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Rendimiento {performance?.season}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { k: "Partidos", v: performance?.appearances },
                    { k: "Titular", v: performance?.starts },
                    { k: "Goles", v: performance?.goals, color: "text-emerald-400" },
                    { k: "Asistencias", v: performance?.assists, color: "text-blue-400" },
                    { k: "Minutos", v: `${performance?.minutesPlayed}'` },
                    { k: "Rating", v: performance?.rating },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-gray-500">{row.k}</span>
                      <span className={`font-mono ${row.color || ""}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Forma (últimos 5)</p>
                  <div className="flex gap-1.5">
                    {performance?.form?.map((r: string, i: number) => (
                      <span key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 ${r === "W" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : r === "D" ? "bg-gray-500/20 text-gray-400 border border-gray-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contract */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] animate-in slide-up stagger-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Contrato
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { k: "Firmado", v: contract?.signedDate },
                    { k: "Finaliza", v: contract?.endDate, bold: true },
                    { k: "Años restantes", v: contract?.yearsRemaining?.toFixed(1) },
                    { k: "Salario bruto", v: contract?.salaryGross },
                    { k: "Cláusula", v: contract?.releaseClause, color: "text-emerald-400", bold: true },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-gray-500">{row.k}</span>
                      <span className={`font-mono ${row.color || ""} ${row.bold ? "font-bold" : ""}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] text-sm">
                  <p className="text-gray-500">Agente</p>
                  <p className="font-medium mt-0.5">{contract?.agent?.name}</p>
                  <p className="text-xs text-gray-500">{contract?.agent?.agency}</p>
                </div>
              </div>

              {/* Injuries Summary */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] animate-in slide-up stagger-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Lesiones
                </h3>
                <div className="flex items-center gap-3 mb-4 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  <span className="text-2xl">
                    {injuries?.stats?.currentStatus === "Disponible" ? "✅" : "🔴"}
                  </span>
                  <div>
                    <p className="font-medium">{injuries?.stats?.currentStatus}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Estado actual</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { k: "Total lesiones", v: injuries?.stats?.totalInjuries },
                    { k: "Días baja total", v: injuries?.stats?.totalDaysOut },
                    { k: "Partidos perdidos", v: injuries?.stats?.totalGamesMissed, color: "text-red-400" },
                    { k: "Recuperación media", v: `${injuries?.stats?.avgRecoveryDays}d` },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-gray-500">{row.k}</span>
                      <span className={`font-mono ${row.color || ""}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Matches */}
            {matches.length > 0 && (
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] animate-in slide-up stagger-7">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Próximos Partidos
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {matches.slice(0, 3).map((m: any, i: number) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 hover:bg-white/[0.04] transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{m.competition}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${m.isHome ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"}`}>
                          {m.venue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={m.isHome ? "font-bold" : "text-gray-400"}>{m.homeTeam}</span>
                        <span className="text-gray-600 text-xs">vs</span>
                        <span className={!m.isHome ? "font-bold" : "text-gray-400"}>{m.awayTeam}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 text-center mt-3 font-mono">
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
          <div className="animate-in slide-up">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <select
                value={newsFilter.region}
                onChange={(e) => setNewsFilter({ ...newsFilter, region: e.target.value })}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm focus:border-blue-500/50 transition-colors"
              >
                <option value="all">Todas las regiones</option>
                {Object.keys(byRegion).map((r) => (
                  <option key={r} value={r}>{regionName[r] || r} ({byRegion[r].length})</option>
                ))}
              </select>
              <select
                value={newsFilter.sentiment}
                onChange={(e) => setNewsFilter({ ...newsFilter, sentiment: e.target.value })}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm focus:border-blue-500/50 transition-colors"
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
                      {langFlag[news[0]?.idioma] || "🌐"} {regionName[region] || region} <span className="text-gray-500 font-normal text-sm">({news.length})</span>
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {news.slice(0, 6).map((n: any, i: number) => (
                        <div key={i} onClick={() => openNews(n)} className={`bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 group animate-in slide-up stagger-${Math.min(i + 1, 8)}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${n.sentimiento?.tipo === "positivo" ? "bg-emerald-400" : n.sentimiento?.tipo === "negativo" ? "bg-red-400" : "bg-gray-500"}`} />
                            <span className="text-xs text-gray-500">{n.fuente}</span>
                            {n.esRumor && <span className="text-[10px] text-purple-400 font-medium">Rumor</span>}
                          </div>
                          <p className="text-sm line-clamp-2 group-hover:text-white transition-colors">{n.titulo}</p>
                          <p className="text-[11px] text-gray-600 mt-1.5 font-mono">{formatDate(n.fecha)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNews.map((n: any, i: number) => (
                  <div key={i} onClick={() => openNews(n)} className={`bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 group animate-in slide-up stagger-${Math.min(i + 1, 8)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span>{langFlag[n.idioma] || "🌐"}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${n.sentimiento?.tipo === "positivo" ? "bg-emerald-500/15 text-emerald-400" : n.sentimiento?.tipo === "negativo" ? "bg-red-500/15 text-red-400" : "bg-gray-500/15 text-gray-400"}`}>
                        {n.sentimiento?.tipo || "neutral"}
                      </span>
                      {n.esRumor && <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/15 text-purple-400">Rumor</span>}
                    </div>
                    <p className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-white transition-colors">{n.titulo}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{n.fuente}</span>
                      <span className="font-mono">{formatDate(n.fecha)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== SOCIAL ========== */}
        {activeTab === "social" && (
          <div className="space-y-6 animate-in slide-up">
            {/* Social Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setSocialTab("twitter")}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${socialTab === "twitter" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:bg-white/[0.06]"}`}
              >
                𝕏 Twitter
              </button>
              <button
                onClick={() => setSocialTab("instagram")}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${socialTab === "instagram" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20" : "bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:bg-white/[0.06]"}`}
              >
                📸 Instagram
              </button>
            </div>

            {socialTab === "twitter" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { val: formatNum(social?.twitter?.followers || 0), label: "Seguidores" },
                    { val: social?.twitter?.tweets, label: "Tweets" },
                    { val: social?.twitter?.recentMentions?.last24h, label: "Menciones 24h" },
                    { val: social?.twitter?.recentMentions?.last7d, label: "Menciones 7d" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 text-center border border-white/[0.06]">
                      <p className="text-2xl font-bold font-mono">{s.val}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]">
                  <h3 className="font-semibold mb-4">Sentimiento de Menciones en Twitter</h3>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-white/[0.03] mb-3">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${social?.twitter?.recentMentions?.sentiment?.positive}%` }} />
                    <div className="bg-gray-600" style={{ width: `${social?.twitter?.recentMentions?.sentiment?.neutral}%` }} />
                    <div className="bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${social?.twitter?.recentMentions?.sentiment?.negative}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" />{social?.twitter?.recentMentions?.sentiment?.positive}% positivo</span>
                    <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-500" />{social?.twitter?.recentMentions?.sentiment?.neutral}% neutral</span>
                    <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400" />{social?.twitter?.recentMentions?.sentiment?.negative}% negativo</span>
                  </div>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]">
                  <h3 className="font-semibold mb-4">Menciones Destacadas</h3>
                  <div className="space-y-3">
                    {social?.twitter?.topMentions?.map((m: any, i: number) => (
                      <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
                        <div className="flex justify-between mb-2">
                          <span className="text-blue-400 font-medium">{m.user}</span>
                          <span className="text-xs text-gray-500 font-mono">{formatDate(m.date)}</span>
                        </div>
                        <p className="text-sm mb-2 leading-relaxed">{m.text}</p>
                        <div className="flex gap-4 text-xs text-gray-500 font-mono">
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
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { val: formatNum(social?.instagram?.followers || 0), label: "Seguidores" },
                    { val: social?.instagram?.posts, label: "Posts" },
                    { val: formatNum(social?.instagram?.avgLikes || 0), label: "Likes/post" },
                    { val: `${social?.instagram?.engagementRate}%`, label: "Engagement" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 text-center border border-white/[0.06]">
                      <p className="text-2xl font-bold font-mono">{s.val}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]">
                  <h3 className="font-semibold mb-4">Sentimiento de Comentarios</h3>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-white/[0.03] mb-3">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${social?.instagram?.commentSentiment?.positive}%` }} />
                    <div className="bg-gray-600" style={{ width: `${social?.instagram?.commentSentiment?.neutral}%` }} />
                    <div className="bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${social?.instagram?.commentSentiment?.negative}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" />{social?.instagram?.commentSentiment?.positive}% positivo</span>
                    <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-500" />{social?.instagram?.commentSentiment?.neutral}% neutral</span>
                    <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400" />{social?.instagram?.commentSentiment?.negative}% negativo</span>
                  </div>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]">
                  <h3 className="font-semibold mb-4">Posts Recientes</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {social?.instagram?.recentPosts?.map((p: any, i: number) => (
                      <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
                        <div className="flex justify-between mb-2">
                          <span className="text-[10px] px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded-md uppercase tracking-wider">{p.type}</span>
                          <span className="text-xs text-gray-500 font-mono">{formatDate(p.date)}</span>
                        </div>
                        <p className="text-sm mb-2 line-clamp-2">{p.caption}</p>
                        <div className="flex gap-4 text-xs text-gray-500 font-mono">
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
          <div className="space-y-6 animate-in slide-up">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Próximos Partidos de Sevilla FC
              </h3>
              <div className="space-y-3">
                {matches.map((m: any, i: number) => (
                  <div key={i} className={`bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center gap-5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 animate-in slide-up stagger-${Math.min(i + 1, 8)}`}>
                    <div className="text-center min-w-[60px]">
                      <p className="text-xl font-bold">{new Date(m.date).getDate()}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{new Date(m.date).toLocaleDateString("es-ES", { month: "short" })}</p>
                    </div>
                    <div className="w-px h-10 bg-white/[0.06]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${m.isHome ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"}`}>
                          {m.venue}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{m.competition}</span>
                      </div>
                      <p className="font-medium text-sm">
                        {m.homeTeam} vs {m.awayTeam}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500 font-mono">
                      {new Date(m.date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* National Team */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                {performance?.international?.flag} Selección de {performance?.international?.country}
              </h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { val: performance?.international?.caps, label: "Partidos" },
                  { val: performance?.international?.goals, label: "Goles", color: "text-emerald-400" },
                  { val: performance?.international?.assists, label: "Asistencias", color: "text-blue-400" },
                  { val: performance?.international?.lastCallUp, label: "Última convocatoria", small: true },
                ].map((s, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                    <p className={`${s.small ? "text-sm" : "text-xl"} font-bold font-mono ${s.color || ""}`}>{s.val}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== HISTORIAL ========== */}
        {activeTab === "historial" && (
          <div className="space-y-6 animate-in slide-up">
            {/* Injury History */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Historial Completo de Lesiones
              </h3>
              <div className="space-y-3">
                {injuries?.list?.map((inj: any) => (
                  <div key={inj.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-start gap-4 hover:bg-white/[0.04] transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${inj.severity === "Leve" ? "bg-yellow-500 shadow-lg shadow-yellow-500/20" : inj.severity === "Moderada" ? "bg-orange-500 shadow-lg shadow-orange-500/20" : "bg-red-500 shadow-lg shadow-red-500/20"}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{inj.type}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${inj.status === "Recuperado" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                          {inj.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{inj.area}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500 font-mono">
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
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Historial de Traspasos
              </h3>
              <div className="space-y-3">
                {marketValue?.transferHistory?.map((t: any, i: number) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-400" />
                    <span className="text-sm font-mono min-w-[60px] pl-3 text-gray-500">{t.date}</span>
                    <div className="flex-1">
                      <p><span className="text-gray-400">{t.from}</span> <span className="text-gray-600 mx-1">→</span> <span className="text-white font-medium">{t.to}</span></p>
                    </div>
                    <span className={`font-bold font-mono ${t.type === "loan" ? "text-blue-400" : "text-emerald-400"}`}>{t.fee}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Season History */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06]">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estadísticas por Temporada
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-white/[0.06]">
                      <th className="pb-3 text-[11px] uppercase tracking-wider font-medium">Temporada</th>
                      <th className="pb-3 text-[11px] uppercase tracking-wider font-medium">Equipo</th>
                      <th className="pb-3 text-center text-[11px] uppercase tracking-wider font-medium">PJ</th>
                      <th className="pb-3 text-center text-[11px] uppercase tracking-wider font-medium">Goles</th>
                      <th className="pb-3 text-center text-[11px] uppercase tracking-wider font-medium">Asist</th>
                      <th className="pb-3 text-center text-[11px] uppercase tracking-wider font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance?.seasonHistory?.map((s: any, i: number) => (
                      <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-mono">{s.season}</td>
                        <td className="py-3">{s.team}</td>
                        <td className="py-3 text-center font-mono">{s.apps}</td>
                        <td className="py-3 text-center font-mono text-emerald-400">{s.goals}</td>
                        <td className="py-3 text-center font-mono text-blue-400">{s.assists}</td>
                        <td className="py-3 text-center font-mono">{s.rating}</td>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => { setSelectedNews(null); setAiAnalysis(null); }}>
          <div className="bg-[#0c0c10] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/[0.08] shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span>{langFlag[selectedNews.idioma] || "🌐"}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${selectedNews.sentimiento?.tipo === "positivo" ? "bg-emerald-500/15 text-emerald-400" : selectedNews.sentimiento?.tipo === "negativo" ? "bg-red-500/15 text-red-400" : "bg-gray-500/15 text-gray-400"}`}>
                  {selectedNews.sentimiento?.tipo?.toUpperCase() || "NEUTRAL"}
                </span>
                {selectedNews.esRumor && <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/15 text-purple-400">RUMOR</span>}
                <button onClick={() => { setSelectedNews(null); setAiAnalysis(null); }} className="ml-auto p-2 hover:bg-white/[0.06] rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="text-lg font-bold leading-snug">{selectedNews.titulo}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs font-medium">{selectedNews.fuente}</span>
                <span className="text-xs font-mono">{formatDate(selectedNews.fecha)}</span>
                <span>·</span>
                <span>{selectedNews.pais}</span>
              </div>

              <div className="relative bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-cyan-900/10 rounded-2xl p-5 border border-blue-500/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 animate-gradient" />
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Análisis con IA
                </h4>
                {loadingAi ? (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Analizando...</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 leading-relaxed">{aiAnalysis}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                <a href={selectedNews.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-semibold text-center transition-all duration-200 shadow-lg shadow-blue-500/20">
                  Leer completa
                </a>
                <button onClick={() => { setSelectedNews(null); setAiAnalysis(null); }} className="px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-xl text-sm font-medium transition-all duration-200">
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
