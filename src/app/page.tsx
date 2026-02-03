"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Player, Mencion, HistoryEntry } from "@/types";
import { PLAYERS, TEAM_COLORS } from "@/data/players";
import {
  NewsGrid,
  DateFilter,
  HistoryAnalytics,
  NewsDetail,
  SourceProfile,
  DateRange,
} from "@/components";
import Image from "next/image";
import noticiasData from "@/data/noticias.json";

const HISTORY_DAYS = 30;

type TabType = "prensa" | "stats";

interface SentimentSummary {
  total: number;
  positivas: number;
  negativas: number;
  neutrales: number;
}

export default function Home() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(PLAYERS[0]);
  const [noticias, setNoticias] = useState<Mencion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedNews, setSelectedNews] = useState<Mencion | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("prensa");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filtros de fecha
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  useEffect(() => {
    if (selectedPlayer) {
      loadHistory(selectedPlayer.id);
    }
  }, [selectedPlayer]);

  const loadHistory = (playerId: string) => {
    try {
      const stored = localStorage.getItem(`history_${playerId}`);
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  };

  const saveToHistory = useCallback((playerId: string, summary: SentimentSummary) => {
    const today = new Date().toISOString().split("T")[0];
    const key = `history_${playerId}`;

    try {
      const stored = localStorage.getItem(key);
      let historyData: HistoryEntry[] = stored ? JSON.parse(stored) : [];

      const existingIndex = historyData.findIndex((h) => h.fecha === today);
      const newEntry: HistoryEntry = {
        fecha: today,
        menciones: summary.total,
        positivas: summary.positivas,
        negativas: summary.negativas,
        neutrales: summary.neutrales,
      };

      if (existingIndex >= 0) {
        historyData[existingIndex] = newEntry;
      } else {
        historyData.push(newEntry);
      }

      historyData = historyData
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, HISTORY_DAYS)
        .reverse();

      localStorage.setItem(key, JSON.stringify(historyData));
      setHistory(historyData);
    } catch (e) {
      console.error("Error saving history:", e);
    }
  }, []);

  const noticiasFiltradas = useMemo(() => {
    if (noticias.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return noticias.filter((noticia) => {
      if (!noticia.fecha) return dateRange === "all";

      const noticiaDate = new Date(noticia.fecha);

      switch (dateRange) {
        case "today":
          return noticiaDate >= today;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return noticiaDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          return noticiaDate >= monthAgo;
        case "custom":
          const start = customStart ? new Date(customStart) : null;
          const end = customEnd ? new Date(customEnd + "T23:59:59") : null;
          if (start && end) return noticiaDate >= start && noticiaDate <= end;
          if (start) return noticiaDate >= start;
          if (end) return noticiaDate <= end;
          return true;
        default:
          return true;
      }
    });
  }, [noticias, dateRange, customStart, customEnd]);

  const sentimentSummary = useMemo((): SentimentSummary => {
    return {
      total: noticiasFiltradas.length,
      positivas: noticiasFiltradas.filter((m) => m.sentimiento?.tipo === "positivo").length,
      negativas: noticiasFiltradas.filter((m) => m.sentimiento?.tipo === "negativo").length,
      neutrales: noticiasFiltradas.filter(
        (m) => !m.sentimiento?.tipo || m.sentimiento?.tipo === "neutral"
      ).length,
    };
  }, [noticiasFiltradas]);

  const buscarNoticias = async () => {
    if (!selectedPlayer) return;

    setLoading(true);
    setError(null);

    try {
      // Load from static JSON data
      const playerNews = (noticiasData.byPlayer as Record<string, Mencion[]>)[selectedPlayer.name] || [];

      // Simulate network delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      setNoticias(playerNews);

      if (playerNews.length > 0) {
        const summary = {
          total: playerNews.length,
          positivas: playerNews.filter((m) => m.sentimiento?.tipo === "positivo").length,
          negativas: playerNews.filter((m) => m.sentimiento?.tipo === "negativo").length,
          neutrales: playerNews.filter(
            (m) => !m.sentimiento?.tipo || m.sentimiento?.tipo === "neutral"
          ).length,
        };
        saveToHistory(selectedPlayer.id, summary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
      setNoticias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setNoticias([]);
    setError(null);
    setDateRange("all");
    setSidebarOpen(false);
  };

  const teamColors = selectedPlayer ? TEAM_COLORS[selectedPlayer.team] : null;
  const playersByTeam = {
    "Real Betis": PLAYERS.filter((p) => p.team === "Real Betis"),
    "Sevilla FC": PLAYERS.filter((p) => p.team === "Sevilla FC"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-sm rounded-lg"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">📡</span>
              AgentRadar
            </h1>
            <p className="text-sm text-gray-400 mt-1">Monitor de Prensa Deportiva</p>
          </div>

          {/* Players by Team */}
          {Object.entries(playersByTeam).map(([team, players]) => (
            <div key={team} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {team}
              </h3>
              <div className="space-y-2">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedPlayer?.id === player.id
                        ? "bg-white/20 border border-white/30"
                        : "hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                      <Image
                        src={player.photo}
                        alt={player.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-white">{player.name}</p>
                      <p className="text-xs text-gray-400">{player.position}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen relative">
        {selectedPlayer && (
          <>
            {/* Hero Section */}
            <div className={`relative h-80 ${teamColors?.primary || 'bg-blue-600'} overflow-hidden`}>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />

              {/* Player Photo */}
              <div className="absolute right-0 bottom-0 h-full w-1/2 z-0">
                <div className="relative h-full w-full">
                  <Image
                    src={selectedPlayer.photo}
                    alt={selectedPlayer.name}
                    fill
                    className="object-contain object-bottom opacity-80"
                    unoptimized
                    priority
                  />
                </div>
              </div>

              {/* Player Info */}
              <div className="relative z-20 h-full flex flex-col justify-end p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                    {selectedPlayer.team}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                    #{selectedPlayer.number}
                  </span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-2">
                  {selectedPlayer.name}
                </h1>
                <p className="text-xl text-gray-300">
                  {selectedPlayer.fullName}
                </p>
                <div className="flex items-center gap-6 mt-4 text-gray-300">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedPlayer.nationality}
                  </span>
                  <span>{selectedPlayer.position}</span>
                  <span>{selectedPlayer.age} años</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
              <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center gap-8">
                  <button
                    onClick={() => setActiveTab("prensa")}
                    className={`py-4 px-2 border-b-2 transition-colors ${
                      activeTab === "prensa"
                        ? "border-blue-500 text-white"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      Prensa
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("stats")}
                    className={`py-4 px-2 border-b-2 transition-colors ${
                      activeTab === "stats"
                        ? "border-blue-500 text-white"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Stats
                    </span>
                  </button>

                  {/* Search Button */}
                  <div className="ml-auto">
                    <button
                      onClick={buscarNoticias}
                      disabled={loading}
                      className="flex items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Buscando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Actualizar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-6xl mx-auto p-6">
              {error && (
                <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl">
                  <p className="font-medium">Error: {error}</p>
                </div>
              )}

              {activeTab === "prensa" && (
                <div className="space-y-6">
                  {/* Sentiment Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">Total Noticias</p>
                      <p className="text-3xl font-bold text-white">{sentimentSummary.total}</p>
                    </div>
                    <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
                      <p className="text-green-400 text-sm">Positivas</p>
                      <p className="text-3xl font-bold text-green-400">{sentimentSummary.positivas}</p>
                    </div>
                    <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-400 text-sm">Negativas</p>
                      <p className="text-3xl font-bold text-red-400">{sentimentSummary.negativas}</p>
                    </div>
                    <div className="bg-gray-500/10 backdrop-blur-sm border border-gray-500/30 rounded-xl p-4">
                      <p className="text-gray-400 text-sm">Neutrales</p>
                      <p className="text-3xl font-bold text-gray-300">{sentimentSummary.neutrales}</p>
                    </div>
                  </div>

                  {/* Sentiment Bar */}
                  {sentimentSummary.total > 0 && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Distribución de Sentimiento</span>
                        <span className="text-sm text-gray-400">
                          {Math.round((sentimentSummary.positivas / sentimentSummary.total) * 100)}% positivo
                        </span>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-gray-700">
                        {sentimentSummary.positivas > 0 && (
                          <div
                            className="bg-green-500 transition-all"
                            style={{ width: `${(sentimentSummary.positivas / sentimentSummary.total) * 100}%` }}
                          />
                        )}
                        {sentimentSummary.neutrales > 0 && (
                          <div
                            className="bg-gray-500 transition-all"
                            style={{ width: `${(sentimentSummary.neutrales / sentimentSummary.total) * 100}%` }}
                          />
                        )}
                        {sentimentSummary.negativas > 0 && (
                          <div
                            className="bg-red-500 transition-all"
                            style={{ width: `${(sentimentSummary.negativas / sentimentSummary.total) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Date Filter */}
                  {noticias.length > 0 && (
                    <DateFilter
                      selectedRange={dateRange}
                      onRangeChange={setDateRange}
                      customStart={customStart}
                      customEnd={customEnd}
                      onCustomDateChange={(start, end) => {
                        setCustomStart(start);
                        setCustomEnd(end);
                      }}
                    />
                  )}

                  {/* News Grid */}
                  <NewsGrid
                    noticias={noticiasFiltradas}
                    loading={loading}
                    onNewsClick={(noticia) => setSelectedNews(noticia)}
                    onSourceClick={(source) => setSelectedSource(source)}
                  />
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-6">
                  {/* Market Value Card */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Valor de Mercado
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-4xl font-bold text-green-400">{selectedPlayer.marketValue}</p>
                        <p className="text-sm text-gray-400 mt-1">Según Transfermarkt</p>
                      </div>
                      <a
                        href={selectedPlayer.transfermarktUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                      >
                        Ver perfil completo
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Player Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-gray-400 text-sm">Edad</p>
                      <p className="text-2xl font-bold text-white">{selectedPlayer.age}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-gray-400 text-sm">Dorsal</p>
                      <p className="text-2xl font-bold text-white">#{selectedPlayer.number}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-gray-400 text-sm">Posición</p>
                      <p className="text-lg font-bold text-white">{selectedPlayer.position}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-gray-400 text-sm">Nacionalidad</p>
                      <p className="text-lg font-bold text-white">{selectedPlayer.nationality}</p>
                    </div>
                  </div>

                  {/* History Analytics */}
                  <HistoryAnalytics history={history} playerName={selectedPlayer.name} />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {selectedNews && selectedPlayer && (
        <NewsDetail
          noticia={selectedNews}
          onClose={() => setSelectedNews(null)}
          onSourceClick={(source) => {
            setSelectedNews(null);
            setSelectedSource(source);
          }}
        />
      )}

      {selectedSource && selectedPlayer && (
        <SourceProfile
          source={selectedSource}
          noticias={noticias}
          playerName={selectedPlayer.name}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  );
}
