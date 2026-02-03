"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Player, Mencion, HistoryEntry } from "@/types";
import { PLAYERS } from "@/data/players";
import {
  Sidebar,
  PlayerCard,
  SentimentGauge,
  MarketValue,
  NewsGrid,
  DateFilter,
  HistoryAnalytics,
  NewsDetail,
  SourceProfile,
  DateRange,
} from "@/components";

const N8N_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
  "http://localhost:5678/webhook/monitor-prensa";

const HISTORY_DAYS = 30; // Guardar 30 días de histórico

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

  // Filtros de fecha
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  // Cargar histórico de localStorage
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

      // Mantener últimos 30 días
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

  // Filtrar noticias por fecha
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
          if (start && end) {
            return noticiaDate >= start && noticiaDate <= end;
          } else if (start) {
            return noticiaDate >= start;
          } else if (end) {
            return noticiaDate <= end;
          }
          return true;

        case "all":
        default:
          return true;
      }
    });
  }, [noticias, dateRange, customStart, customEnd]);

  // Calcular resumen de sentimiento de noticias filtradas
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
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jugadores: [selectedPlayer.name] }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setNoticias([]);
      } else {
        const menciones: Mencion[] = data.menciones || [];
        setNoticias(menciones);

        // Guardar en histórico (todas las noticias, no las filtradas)
        if (menciones.length > 0) {
          const summary = {
            total: menciones.length,
            positivas: menciones.filter((m) => m.sentimiento?.tipo === "positivo").length,
            negativas: menciones.filter((m) => m.sentimiento?.tipo === "negativo").length,
            neutrales: menciones.filter(
              (m) => !m.sentimiento?.tipo || m.sentimiento?.tipo === "neutral"
            ).length,
          };
          saveToHistory(selectedPlayer.id, summary);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
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
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        selectedPlayer={selectedPlayer}
        onSelectPlayer={handleSelectPlayer}
      />

      <main className="flex-1 p-6 overflow-y-auto">
        {selectedPlayer ? (
          <div className="max-w-5xl mx-auto space-y-6">
            <PlayerCard player={selectedPlayer} />

            {/* Action Bar */}
            <div className="flex items-center gap-4">
              <button
                onClick={buscarNoticias}
                disabled={loading}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Buscando noticias...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar noticias de {selectedPlayer.name}
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Filtro de fecha - solo visible si hay noticias */}
            {noticias.length > 0 && (
              <DateFilter
                selectedRange={dateRange}
                onRangeChange={setDateRange}
                customStart={customStart}
                customEnd={customEnd}
                onCustomDateChange={handleCustomDateChange}
              />
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MarketValue player={selectedPlayer} loading={false} />
              <SentimentGauge
                positivas={sentimentSummary.positivas}
                negativas={sentimentSummary.negativas}
                neutrales={sentimentSummary.neutrales}
                total={sentimentSummary.total}
                loading={loading}
              />
            </div>

            {/* News Grid con noticias filtradas */}
            <NewsGrid
              noticias={noticiasFiltradas}
              loading={loading}
              onNewsClick={(noticia) => setSelectedNews(noticia)}
              onSourceClick={(source) => setSelectedSource(source)}
            />

            {/* Análisis histórico mejorado */}
            <HistoryAnalytics history={history} playerName={selectedPlayer.name} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Selecciona un jugador
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Elige un jugador del menú lateral para ver sus noticias
              </p>
            </div>
          </div>
        )}
      </main>

      {/* News Detail Modal */}
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

      {/* Source Profile Modal */}
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
