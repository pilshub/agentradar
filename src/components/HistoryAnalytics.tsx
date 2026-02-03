"use client";

import { HistoryEntry } from "@/types";

interface HistoryAnalyticsProps {
  history: HistoryEntry[];
  playerName: string;
}

export function HistoryAnalytics({ history, playerName }: HistoryAnalyticsProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Análisis Histórico
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-400">
            Sin datos históricos para {playerName}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Busca noticias para generar el histórico
          </p>
        </div>
      </div>
    );
  }

  const totalMenciones = history.reduce((sum, h) => sum + h.menciones, 0);
  const totalPositivas = history.reduce((sum, h) => sum + h.positivas, 0);
  const totalNegativas = history.reduce((sum, h) => sum + h.negativas, 0);
  const totalNeutrales = history.reduce((sum, h) => sum + h.neutrales, 0);

  const promedioDiario = totalMenciones / history.length;
  const sentimentScore = totalMenciones > 0
    ? ((totalPositivas - totalNegativas) / totalMenciones * 100).toFixed(1)
    : "0";

  const mitad = Math.floor(history.length / 2);
  const primeraMitad = history.slice(0, mitad);
  const segundaMitad = history.slice(mitad);

  const promedioPrimera = primeraMitad.length > 0
    ? primeraMitad.reduce((sum, h) => sum + h.menciones, 0) / primeraMitad.length
    : 0;
  const promedioSegunda = segundaMitad.length > 0
    ? segundaMitad.reduce((sum, h) => sum + h.menciones, 0) / segundaMitad.length
    : 0;

  const tendencia = promedioSegunda > promedioPrimera * 1.1
    ? "up"
    : promedioSegunda < promedioPrimera * 0.9
      ? "down"
      : "stable";

  const maxDay = history.reduce((max, h) => h.menciones > max.menciones ? h : max, history[0]);

  const bestSentimentDay = history.reduce((best, h) => {
    const bestScore = best.menciones > 0 ? (best.positivas - best.negativas) / best.menciones : 0;
    const currentScore = h.menciones > 0 ? (h.positivas - h.negativas) / h.menciones : 0;
    return currentScore > bestScore ? h : best;
  }, history[0]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Análisis Histórico
        </h3>
        <span className="text-sm text-gray-400">
          Últimos {history.length} días
        </span>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Total menciones"
          value={totalMenciones.toString()}
          subtext={`${promedioDiario.toFixed(1)}/día`}
          color="blue"
        />
        <KPICard
          label="Sentimiento"
          value={`${sentimentScore}%`}
          subtext={Number(sentimentScore) > 0 ? "Positivo" : Number(sentimentScore) < 0 ? "Negativo" : "Neutral"}
          color={Number(sentimentScore) > 0 ? "green" : Number(sentimentScore) < 0 ? "red" : "gray"}
        />
        <KPICard
          label="Tendencia"
          value={tendencia === "up" ? "↑" : tendencia === "down" ? "↓" : "→"}
          subtext={tendencia === "up" ? "Subiendo" : tendencia === "down" ? "Bajando" : "Estable"}
          color={tendencia === "up" ? "green" : tendencia === "down" ? "red" : "gray"}
        />
        <KPICard
          label="Pico de menciones"
          value={maxDay.menciones.toString()}
          subtext={formatDate(maxDay.fecha)}
          color="purple"
        />
      </div>

      {/* Gráfico de barras */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          Evolución de menciones
        </h4>
        <div className="h-40 flex items-end gap-1">
          {history.map((entry, index) => {
            const maxMenciones = Math.max(...history.map(h => h.menciones), 1);
            const heightPercent = (entry.menciones / maxMenciones) * 100;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 text-xs text-center">
                  <span className="bg-white text-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                    {entry.menciones} ({entry.positivas}+ / {entry.negativas}-)
                  </span>
                </div>

                {/* Barra */}
                <div
                  className="w-full rounded-t transition-all duration-300 relative overflow-hidden cursor-pointer hover:opacity-80"
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                >
                  <div className="absolute inset-0 bg-gray-600" />

                  {entry.menciones > 0 && (
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-green-500"
                      style={{ height: `${(entry.positivas / entry.menciones) * 100}%` }}
                    />
                  )}

                  {entry.menciones > 0 && (
                    <div
                      className="absolute top-0 left-0 right-0 bg-red-500"
                      style={{ height: `${(entry.negativas / entry.menciones) * 100}%` }}
                    />
                  )}
                </div>

                {/* Label */}
                <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                  {formatDate(entry.fecha)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desglose por sentimiento */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <SentimentBreakdown
          label="Positivas"
          value={totalPositivas}
          total={totalMenciones}
          color="green"
        />
        <SentimentBreakdown
          label="Neutrales"
          value={totalNeutrales}
          total={totalMenciones}
          color="gray"
        />
        <SentimentBreakdown
          label="Negativas"
          value={totalNegativas}
          total={totalMenciones}
          color="red"
        />
      </div>

      {/* Insights */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          Insights
        </h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>
              {playerName} ha tenido un promedio de{" "}
              <strong className="text-white">{promedioDiario.toFixed(1)}</strong> menciones diarias
            </span>
          </li>
          {Number(sentimentScore) > 20 && (
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>
                La cobertura mediática es <strong className="text-green-400">mayoritariamente positiva</strong>
              </span>
            </li>
          )}
          {Number(sentimentScore) < -20 && (
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>
                La cobertura mediática es <strong className="text-red-400">mayoritariamente negativa</strong>.
                Considerar estrategia de comunicación.
              </span>
            </li>
          )}
          {tendencia === "up" && (
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>
                Las menciones están <strong className="text-white">aumentando</strong> respecto a días anteriores
              </span>
            </li>
          )}
          {tendencia === "down" && (
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span>
                Las menciones están <strong className="text-white">disminuyendo</strong> respecto a días anteriores
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              Mejor día: <strong className="text-white">{formatDate(bestSentimentDay.fecha)}</strong> con{" "}
              {bestSentimentDay.positivas} noticias positivas
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  color: "blue" | "green" | "red" | "gray" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    green: "bg-green-500/10 border-green-500/30 text-green-400",
    red: "bg-red-500/10 border-red-500/30 text-red-400",
    gray: "bg-gray-500/10 border-gray-500/30 text-gray-400",
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <p className="text-xs opacity-80 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-70 mt-1">{subtext}</p>
    </div>
  );
}

function SentimentBreakdown({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "green" | "gray" | "red";
}) {
  const percent = total > 0 ? ((value / total) * 100).toFixed(0) : "0";

  const colorClasses = {
    green: "text-green-400",
    gray: "text-gray-400",
    red: "text-red-400",
  };

  const bgClasses = {
    green: "bg-green-500",
    gray: "bg-gray-500",
    red: "bg-red-500",
  };

  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${bgClasses[color]} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{percent}%</p>
    </div>
  );
}
