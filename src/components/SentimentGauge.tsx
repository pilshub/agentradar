"use client";

interface SentimentGaugeProps {
  positivas: number;
  negativas: number;
  neutrales: number;
  total: number;
  loading?: boolean;
}

export function SentimentGauge({
  positivas,
  negativas,
  neutrales,
  total,
  loading = false,
}: SentimentGaugeProps) {
  const score = total > 0 ? ((positivas - negativas) / total) : 0;
  const scorePercent = Math.round(((score + 1) / 2) * 100);

  const getSentimentLabel = () => {
    if (score > 0.3) return { text: "Muy Positivo", color: "text-green-600" };
    if (score > 0.1) return { text: "Positivo", color: "text-green-500" };
    if (score > -0.1) return { text: "Neutral", color: "text-gray-500" };
    if (score > -0.3) return { text: "Negativo", color: "text-orange-500" };
    return { text: "Muy Negativo", color: "text-red-600" };
  };

  const sentiment = getSentimentLabel();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Sentimiento en Prensa
      </h3>

      {total === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Sin datos de noticias
          </p>
        </div>
      ) : (
        <>
          {/* Gauge visual */}
          <div className="relative h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-lg transform -translate-x-1/2 transition-all duration-500"
              style={{ left: `${scorePercent}%` }}
            />
          </div>

          {/* Score label */}
          <div className="text-center mb-6">
            <span className={`text-2xl font-bold ${sentiment.color}`}>
              {sentiment.text}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Score: {score.toFixed(2)}
            </p>
          </div>

          {/* Stats breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              label="Positivas"
              value={positivas}
              total={total}
              color="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            />
            <StatBox
              label="Neutrales"
              value={neutrales}
              total={total}
              color="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            />
            <StatBox
              label="Negativas"
              value={negativas}
              total={total}
              color="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`rounded-xl p-3 text-center ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-xs font-medium mt-1">{percent}%</p>
    </div>
  );
}
