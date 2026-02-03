"use client";

import { HistoryEntry } from "@/types";

interface WeeklyHistoryProps {
  history: HistoryEntry[];
  loading?: boolean;
}

export function WeeklyHistory({ history, loading = false }: WeeklyHistoryProps) {
  const maxMenciones = Math.max(...history.map((h) => h.menciones), 1);

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Histórico Semanal
      </h3>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Sin datos históricos
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            El histórico se guardará automáticamente
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-32">
            {history.map((entry, index) => {
              const heightPercent = (entry.menciones / maxMenciones) * 100;
              const positivePercent =
                entry.menciones > 0
                  ? (entry.positivas / entry.menciones) * 100
                  : 0;
              const negativePercent =
                entry.menciones > 0
                  ? (entry.negativas / entry.menciones) * 100
                  : 0;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {entry.menciones}
                  </span>
                  <div
                    className="w-full rounded-t-lg overflow-hidden bg-gray-200 dark:bg-gray-700 transition-all duration-300 relative"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  >
                    {/* Stacked colors */}
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-green-500"
                      style={{ height: `${positivePercent}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 right-0 bg-red-500"
                      style={{ height: `${negativePercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDay(entry.fecha)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Positivas</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600" />
              <span className="text-gray-600 dark:text-gray-400">Neutrales</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-gray-600 dark:text-gray-400">Negativas</span>
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {history.reduce((sum, h) => sum + h.menciones, 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total menciones
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {history.reduce((sum, h) => sum + h.positivas, 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Positivas
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {history.reduce((sum, h) => sum + h.negativas, 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Negativas
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
