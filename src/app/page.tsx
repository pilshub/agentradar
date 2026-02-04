"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Player, Mencion } from "@/types";
import { PLAYERS } from "@/data/players";
import noticiasData from "@/data/noticias.json";

interface PlayerMetrics {
  totalMenciones: number;
  positivas: number;
  negativas: number;
  neutrales: number;
  ratio: number;
  fuentesPrincipales: { fuente: string; count: number }[];
  keywords: { word: string; count: number }[];
}

interface HistoryEntry {
  date: string;
  mentions: number;
  positive: number;
  negative: number;
}

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

export default function Home() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(PLAYERS[0]);
  const [noticias, setNoticias] = useState<Mencion[]>([]);
  const [metrics, setMetrics] = useState<PlayerMetrics | null>(null);
  const [selectedNews, setSelectedNews] = useState<Mencion | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load data when player changes
  useEffect(() => {
    const playerNews = (noticiasData.byPlayer as Record<string, Mencion[]>)[selectedPlayer.name] || [];
    const playerMetrics = (noticiasData as { metrics?: Record<string, PlayerMetrics> }).metrics?.[selectedPlayer.name] || null;
    setNoticias(playerNews);
    setMetrics(playerMetrics);
    loadHistory(selectedPlayer.id);
    saveCurrentToHistory(selectedPlayer.id, playerNews);
  }, [selectedPlayer]);

  // Load history from localStorage
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

  // Save current data to history
  const saveCurrentToHistory = (playerId: string, news: Mencion[]) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const key = `history_${playerId}`;
      const stored = localStorage.getItem(key);
      let historyData: HistoryEntry[] = stored ? JSON.parse(stored) : [];

      const entry: HistoryEntry = {
        date: today,
        mentions: news.length,
        positive: news.filter(n => n.sentimiento?.tipo === "positivo").length,
        negative: news.filter(n => n.sentimiento?.tipo === "negativo").length,
      };

      const existingIdx = historyData.findIndex(h => h.date === today);
      if (existingIdx >= 0) {
        historyData[existingIdx] = entry;
      } else {
        historyData.push(entry);
      }

      historyData = historyData.slice(-30); // Keep last 30 days
      localStorage.setItem(key, JSON.stringify(historyData));
      setHistory(historyData);
    } catch (e) {
      console.error("Error saving history:", e);
    }
  };

  const betisPlayers = PLAYERS.filter(p => p.team === "Real Betis");
  const sevillaPlayers = PLAYERS.filter(p => p.team === "Sevilla FC");

  const allPlayersMetrics = useMemo(() => {
    return PLAYERS.map(player => {
      const m = (noticiasData as { metrics?: Record<string, PlayerMetrics> }).metrics?.[player.name];
      return {
        player,
        metrics: m,
        sentimentScore: m ? (m.positivas - m.negativas) : 0,
        totalMentions: m?.totalMenciones || 0
      };
    }).sort((a, b) => b.totalMentions - a.totalMentions);
  }, []);

  const sentimentData = useMemo(() => {
    const pos = noticias.filter(n => n.sentimiento?.tipo === "positivo").length;
    const neg = noticias.filter(n => n.sentimiento?.tipo === "negativo").length;
    const neu = noticias.filter(n => !n.sentimiento?.tipo || n.sentimiento?.tipo === "neutral").length;
    const total = noticias.length;
    return { pos, neg, neu, total };
  }, [noticias]);

  const cleanHtml = (text: string) => {
    if (!text) return "";
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/<[^>]*$/g, "")
      .replace(/^[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#?\w+;/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const analyzeText = (text: string) => {
    const lower = text.toLowerCase();
    const foundPositive = PALABRAS_POSITIVAS.filter(p => lower.includes(p));
    const foundNegative = PALABRAS_NEGATIVAS.filter(p => lower.includes(p));
    return { foundPositive, foundNegative };
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return "Hace menos de 1h";
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays} días`;
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  const formatFullDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  // Fetch AI analysis
  const fetchAiAnalysis = useCallback(async (noticia: Mencion) => {
    setLoadingAi(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: noticia.titulo,
          descripcion: noticia.descripcion,
          jugador: selectedPlayer.name,
          fuente: noticia.fuente,
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.analysis || data.error || "No se pudo generar el análisis.");
    } catch (e) {
      setAiAnalysis("Error al conectar con el servicio de IA.");
    } finally {
      setLoadingAi(false);
    }
  }, [selectedPlayer]);

  // When news is selected, fetch AI analysis
  useEffect(() => {
    if (selectedNews) {
      fetchAiAnalysis(selectedNews);
    }
  }, [selectedNews, fetchAiAnalysis]);

  const playerRank = allPlayersMetrics.findIndex(p => p.player.id === selectedPlayer.id) + 1;

  // Get max mentions for chart scaling
  const maxHistoryMentions = Math.max(...history.filter(h => h && h.mentions).map(h => h.mentions), 1);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">AgentRadar</h1>
              <p className="text-xs text-gray-500">Monitor de Prensa Deportiva</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">
              {new Date(noticiasData.timestamp).toLocaleDateString("es-ES")}
            </span>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showComparison
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Comparar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Player Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs font-medium text-emerald-500 mb-2 uppercase tracking-wider">Real Betis</p>
              <div className="flex flex-wrap gap-2">
                {betisPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedPlayer.id === player.id
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {player.photo && (
                      <img
                        src={player.photo}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    {player.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-red-500 mb-2 uppercase tracking-wider">Sevilla FC</p>
              <div className="flex flex-wrap gap-2">
                {sevillaPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedPlayer.id === player.id
                        ? "bg-red-500 text-white"
                        : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    }`}
                  >
                    {player.photo && (
                      <img
                        src={player.photo}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    {player.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        {showComparison && (
          <div className="bg-[#111] rounded-2xl p-6 border border-white/10 mb-6 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Comparativa de Jugadores</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-white/10">
                  <th className="pb-3 font-medium">Jugador</th>
                  <th className="pb-3 font-medium">Equipo</th>
                  <th className="pb-3 font-medium text-center">Menciones</th>
                  <th className="pb-3 font-medium text-center">+/-</th>
                  <th className="pb-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {allPlayersMetrics.map(({ player, metrics: m, sentimentScore }) => (
                  <tr
                    key={player.id}
                    className={`border-b border-white/5 cursor-pointer transition-colors ${
                      selectedPlayer.id === player.id ? "bg-white/5" : "hover:bg-white/5"
                    }`}
                    onClick={() => { setSelectedPlayer(player); setShowComparison(false); }}
                  >
                    <td className="py-2 font-medium flex items-center gap-2">
                      {player.photo && (
                        <img src={player.photo} alt="" className="w-6 h-6 rounded-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      )}
                      {player.name}
                    </td>
                    <td className={`py-2 ${player.team === "Real Betis" ? "text-emerald-400" : "text-red-400"}`}>
                      {player.team.replace("Real ", "").replace(" FC", "")}
                    </td>
                    <td className="py-2 text-center">{m?.totalMenciones || 0}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        sentimentScore > 0 ? "bg-emerald-500/20 text-emerald-400" :
                        sentimentScore < 0 ? "bg-red-500/20 text-red-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {sentimentScore > 0 ? "+" : ""}{sentimentScore}
                      </span>
                    </td>
                    <td className="py-2 text-right text-emerald-400">{player.marketValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Player Card */}
        <div className={`rounded-2xl p-5 mb-6 ${
          selectedPlayer.team === "Real Betis"
            ? "bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-500/20"
            : "bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-500/20"
        }`}>
          <div className="flex flex-wrap items-center gap-5">
            {/* Photo */}
            <div className="relative">
              {selectedPlayer.photo ? (
                <img
                  src={selectedPlayer.photo}
                  alt={selectedPlayer.name}
                  className="w-24 h-24 rounded-2xl object-cover bg-black/30"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold ${
                selectedPlayer.photo ? 'hidden' : ''
              } ${
                selectedPlayer.team === "Real Betis"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                #{selectedPlayer.number}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-bold">{selectedPlayer.name}</h2>
              <p className="text-gray-400 text-sm">{selectedPlayer.fullName}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                <span>{selectedPlayer.position}</span>
                <span>•</span>
                <span>{selectedPlayer.nationality}</span>
                <span>•</span>
                <span>{selectedPlayer.age} años</span>
                <span>•</span>
                <span>#{selectedPlayer.number}</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-black/30 rounded-xl p-3 text-center min-w-[80px]">
                <p className="text-xs text-gray-500">Menciones</p>
                <p className="text-xl font-bold">{sentimentData.total}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center min-w-[80px]">
                <p className="text-xs text-gray-500">Índice</p>
                <p className={`text-xl font-bold ${
                  (sentimentData.pos - sentimentData.neg) > 0 ? "text-emerald-400" :
                  (sentimentData.pos - sentimentData.neg) < 0 ? "text-red-400" : ""
                }`}>
                  {(sentimentData.pos - sentimentData.neg) > 0 ? "+" : ""}
                  {sentimentData.pos - sentimentData.neg}
                </p>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center min-w-[80px]">
                <p className="text-xs text-gray-500">Valor</p>
                <p className="text-xl font-bold text-emerald-400">{selectedPlayer.marketValue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111] rounded-xl p-4 border border-white/5">
            <p className="text-gray-500 text-xs mb-1">Menciones</p>
            <p className="text-2xl font-bold">{sentimentData.total}</p>
          </div>
          <div className="bg-[#111] rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-500 text-xs mb-1">Positivas</p>
            <p className="text-2xl font-bold text-emerald-400">{sentimentData.pos}</p>
          </div>
          <div className="bg-[#111] rounded-xl p-4 border border-red-500/20">
            <p className="text-red-500 text-xs mb-1">Negativas</p>
            <p className="text-2xl font-bold text-red-400">{sentimentData.neg}</p>
          </div>
          <div className="bg-[#111] rounded-xl p-4 border border-white/5">
            <p className="text-gray-500 text-xs mb-1">Neutrales</p>
            <p className="text-2xl font-bold text-gray-400">{sentimentData.neu}</p>
          </div>
        </div>

        {/* History Chart */}
        {history.filter(h => h && h.date).length > 1 && (
          <div className="bg-[#111] rounded-xl p-4 border border-white/5 mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Histórico de Menciones</h4>
            <div className="flex items-end gap-1 h-20">
              {history.filter(h => h && h.date).slice(-14).map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse" style={{ height: '60px' }}>
                    <div
                      className="w-full bg-emerald-500 rounded-t"
                      style={{ height: `${((h.positive || 0) / maxHistoryMentions) * 100}%` }}
                    />
                    <div
                      className="w-full bg-gray-600"
                      style={{ height: `${(((h.mentions || 0) - (h.positive || 0) - (h.negative || 0)) / maxHistoryMentions) * 100}%` }}
                    />
                    <div
                      className="w-full bg-red-500 rounded-b"
                      style={{ height: `${((h.negative || 0) / maxHistoryMentions) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-600">{h.date?.slice(5) || ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two Columns */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* News */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Noticias ({noticias.length})</h3>
            <div className="space-y-2">
              {noticias.slice(0, 20).map((noticia, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedNews(noticia)}
                  className="bg-[#111] rounded-xl p-3 border border-white/5 hover:border-white/20 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-12 rounded-full flex-shrink-0 ${
                      noticia.sentimiento?.tipo === "positivo" ? "bg-emerald-500" :
                      noticia.sentimiento?.tipo === "negativo" ? "bg-red-500" : "bg-gray-600"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">{noticia.fuente}</span>
                        <span className="text-xs text-gray-600">{formatDate(noticia.fecha)}</span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-200 group-hover:text-white line-clamp-2">
                        {noticia.titulo}
                      </h4>
                    </div>
                    <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100">
                      Analizar →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {noticias.length === 0 && (
              <div className="bg-[#111] rounded-xl p-8 border border-white/5 text-center">
                <p className="text-gray-500">No hay noticias disponibles</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Media Exposure */}
            {metrics && metrics.fuentesPrincipales.length > 0 && (
              <div className="bg-[#111] rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Medios</h4>
                <div className="space-y-2">
                  {metrics.fuentesPrincipales.slice(0, 5).map((f, i) => {
                    const pct = (f.count / metrics.fuentesPrincipales[0].count) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300 truncate">{f.fuente}</span>
                          <span className="text-gray-500">{f.count}</span>
                        </div>
                        <div className="h-1.5 bg-[#1a1a1a] rounded-full">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Keywords */}
            {metrics && metrics.keywords.length > 0 && (
              <div className="bg-[#111] rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Temas</h4>
                <div className="flex flex-wrap gap-1.5">
                  {metrics.keywords.map((k, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded-full ${
                        ["lesión", "baja", "derrota", "expulsión", "suplente"].includes(k.word)
                          ? "bg-red-500/10 text-red-400"
                          : ["gol", "victoria", "titular", "asistencia", "doblete", "convocado", "fichaje"].includes(k.word)
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {k.word} ({k.count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Player Info */}
            <div className="bg-[#111] rounded-xl p-4 border border-white/5">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Equipo</span>
                  <span className={selectedPlayer.team === "Real Betis" ? "text-emerald-400" : "text-red-400"}>
                    {selectedPlayer.team}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Posición</span>
                  <span className="text-gray-300">{selectedPlayer.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor</span>
                  <span className="text-emerald-400">{selectedPlayer.marketValue}</span>
                </div>
                <a
                  href={selectedPlayer.transfermarktUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-blue-400 hover:text-blue-300 pt-2"
                >
                  Ver en Transfermarkt →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Modal with AI Analysis */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setSelectedNews(null); setAiAnalysis(null); }}
        >
          <div
            className="bg-[#111] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#111] border-b border-white/10 p-4 flex items-center justify-between">
              <h3 className="font-semibold">Análisis de Noticia</h3>
              <button
                onClick={() => { setSelectedNews(null); setAiAnalysis(null); }}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Title */}
              <div>
                <h2 className="text-lg font-bold mb-2">{selectedNews.titulo}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-[#1a1a1a] rounded">{selectedNews.fuente}</span>
                  <span>{formatFullDate(selectedNews.fecha)}</span>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/30">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Análisis con IA
                </h4>
                {loadingAi ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analizando noticia...
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">{aiAnalysis}</p>
                )}
              </div>

              {/* Sentiment */}
              <div className={`rounded-xl p-4 ${
                selectedNews.sentimiento?.tipo === "positivo"
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : selectedNews.sentimiento?.tipo === "negativo"
                  ? "bg-red-500/10 border border-red-500/30"
                  : "bg-gray-500/10 border border-gray-500/30"
              }`}>
                <h4 className="font-medium mb-1 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    selectedNews.sentimiento?.tipo === "positivo" ? "bg-emerald-500" :
                    selectedNews.sentimiento?.tipo === "negativo" ? "bg-red-500" : "bg-gray-500"
                  }`} />
                  Sentimiento: {selectedNews.sentimiento?.tipo?.toUpperCase() || "NEUTRAL"}
                </h4>
                <p className="text-xs text-gray-400">Score: {selectedNews.sentimiento?.score || 0}</p>
              </div>

              {/* Keywords */}
              {(() => {
                const { foundPositive, foundNegative } = analyzeText(selectedNews.titulo + " " + (selectedNews.descripcion || ""));
                return (foundPositive.length > 0 || foundNegative.length > 0) && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Palabras Clave</h4>
                    <div className="flex flex-wrap gap-2">
                      {foundPositive.map((w, i) => (
                        <span key={i} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">{w}</span>
                      ))}
                      {foundNegative.map((w, i) => (
                        <span key={i} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">{w}</span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-white/10">
                <a
                  href={selectedNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium text-center"
                >
                  Leer noticia completa →
                </a>
                <button
                  onClick={() => { setSelectedNews(null); setAiAnalysis(null); }}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium"
                >
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
