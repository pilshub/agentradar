"use client";

import { Mencion } from "@/types";

interface NewsGridProps {
  noticias: Mencion[];
  loading?: boolean;
  onNewsClick?: (noticia: Mencion) => void;
  onSourceClick?: (source: string) => void;
}

const FUENTE_COLORS: Record<string, string> = {
  Marca: "bg-red-100 text-red-800 border-red-200",
  AS: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Sport: "bg-pink-100 text-pink-800 border-pink-200",
  "Mundo Deportivo": "bg-blue-100 text-blue-800 border-blue-200",
  "El Pais": "bg-gray-100 text-gray-800 border-gray-200",
  "El Mundo": "bg-green-100 text-green-800 border-green-200",
};

const SENTIMENT_BADGES: Record<string, string> = {
  positivo: "bg-green-500 text-white",
  negativo: "bg-red-500 text-white",
  neutral: "bg-gray-400 text-white",
};

export function NewsGrid({ noticias, loading = false, onNewsClick, onSourceClick }: NewsGridProps) {
  const formatearFecha = (fecha: string) => {
    if (!fecha) return "Sin fecha";
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fecha;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse border border-gray-200 dark:border-gray-700 rounded-xl p-4"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Noticias Recientes
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {noticias.length} {noticias.length === 1 ? "noticia" : "noticias"}
        </span>
      </div>

      {noticias.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            No hay noticias recientes
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Haz clic en &quot;Buscar noticias&quot; para actualizar
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {noticias.map((noticia, index) => (
            <article
              key={index}
              onClick={() => onNewsClick?.(noticia)}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSourceClick?.(noticia.fuente);
                  }}
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border hover:opacity-80 transition-opacity ${
                    FUENTE_COLORS[noticia.fuente] ||
                    "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {noticia.fuente}
                </button>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    SENTIMENT_BADGES[noticia.sentimiento?.tipo] ||
                    SENTIMENT_BADGES.neutral
                  }`}
                >
                  {noticia.sentimiento?.tipo || "neutral"}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {formatearFecha(noticia.fecha)}
                </span>
              </div>

              <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                {noticia.titulo}
              </h4>

              {noticia.descripcion && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {noticia.descripcion}
                </p>
              )}

              {noticia.url && (
                <a
                  href={noticia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Leer más
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
