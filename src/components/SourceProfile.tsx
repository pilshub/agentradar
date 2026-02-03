"use client";

import { useMemo, useEffect, useCallback } from "react";
import { Mencion } from "@/types";

interface SourceProfileProps {
  source: string;
  noticias: Mencion[];
  playerName: string;
  onClose: () => void;
}

const SOURCE_INFO: Record<string, {
  name: string;
  description: string;
  type: string;
  reach: string;
  bias: string;
  website: string;
  logo: string;
}> = {
  "Marca": {
    name: "Marca",
    description: "Diario deportivo líder en España, fundado en 1938. Tradicionalmente asociado con el Real Madrid.",
    type: "Diario Deportivo",
    reach: "4.5M lectores/día",
    bias: "Pro-Madrid",
    website: "marca.com",
    logo: "🔴",
  },
  "AS": {
    name: "Diario AS",
    description: "Segundo diario deportivo más leído de España. Cobertura amplia del fútbol español e internacional.",
    type: "Diario Deportivo",
    reach: "2.8M lectores/día",
    bias: "Pro-Madrid",
    website: "as.com",
    logo: "🟡",
  },
  "Sport": {
    name: "Sport",
    description: "Diario deportivo catalán, fundado en 1979. Principal medio deportivo de Barcelona.",
    type: "Diario Deportivo",
    reach: "1.5M lectores/día",
    bias: "Pro-Barcelona",
    website: "sport.es",
    logo: "🔵",
  },
  "Mundo Deportivo": {
    name: "Mundo Deportivo",
    description: "El diario deportivo más antiguo de España (1906). Sede en Barcelona.",
    type: "Diario Deportivo",
    reach: "1.2M lectores/día",
    bias: "Pro-Barcelona",
    website: "mundodeportivo.com",
    logo: "🔵",
  },
  "El Pais": {
    name: "El País - Deportes",
    description: "Sección deportiva del diario generalista más leído de España. Cobertura equilibrada.",
    type: "Generalista",
    reach: "1.8M lectores/día",
    bias: "Neutral",
    website: "elpais.com/deportes",
    logo: "⚪",
  },
  "El Mundo": {
    name: "El Mundo - Deportes",
    description: "Sección deportiva del segundo diario generalista de España.",
    type: "Generalista",
    reach: "1.1M lectores/día",
    bias: "Neutral",
    website: "elmundo.es/deportes",
    logo: "🟢",
  },
};

export function SourceProfile({ source, noticias, playerName, onClose }: SourceProfileProps) {
  // Cerrar con Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const sourceInfo = SOURCE_INFO[source] || {
    name: source,
    description: "Medio de comunicación deportivo",
    type: "Desconocido",
    reach: "N/D",
    bias: "Desconocido",
    website: "",
    logo: "📰",
  };

  // Filtrar noticias de esta fuente
  const sourceNoticias = useMemo(() =>
    noticias.filter(n => n.fuente === source),
    [noticias, source]
  );

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = sourceNoticias.length;
    const positivas = sourceNoticias.filter(n => n.sentimiento?.tipo === "positivo").length;
    const negativas = sourceNoticias.filter(n => n.sentimiento?.tipo === "negativo").length;
    const neutrales = total - positivas - negativas;

    const avgScore = total > 0
      ? sourceNoticias.reduce((sum, n) => sum + (n.sentimiento?.score || 0), 0) / total
      : 0;

    // Determinar tendencia del medio hacia el jugador
    let tendency = "Neutral";
    let tendencyColor = "text-gray-600";
    if (avgScore > 0.5) {
      tendency = "Favorable";
      tendencyColor = "text-green-600";
    } else if (avgScore < -0.5) {
      tendency = "Desfavorable";
      tendencyColor = "text-red-600";
    }

    return { total, positivas, negativas, neutrales, avgScore, tendency, tendencyColor };
  }, [sourceNoticias]);

  // Timeline de noticias
  const timeline = useMemo(() => {
    return sourceNoticias
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10);
  }, [sourceNoticias]);

  const formatDate = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fecha;
    }
  };

  const getSentimentIcon = (tipo?: string) => {
    switch (tipo) {
      case "positivo": return "🟢";
      case "negativo": return "🔴";
      default: return "⚪";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-5xl">{sourceInfo.logo}</span>
            <div>
              <h2 className="text-2xl font-bold">{sourceInfo.name}</h2>
              <p className="text-gray-300 text-sm">{sourceInfo.type}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {/* Source Info */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {sourceInfo.description}
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Alcance</p>
                <p className="font-semibold text-gray-900 dark:text-white">{sourceInfo.reach}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Sesgo</p>
                <p className="font-semibold text-gray-900 dark:text-white">{sourceInfo.bias}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Web</p>
                <p className="font-semibold text-blue-600">{sourceInfo.website}</p>
              </div>
            </div>
          </div>

          {/* Tratamiento al jugador */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Tratamiento hacia {playerName}
            </h3>

            {stats.total === 0 ? (
              <p className="text-blue-800 dark:text-blue-300">
                No hay noticias registradas de este medio sobre {playerName}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300">Total noticias</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.positivas}</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300">Positivas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">{stats.negativas}</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300">Negativas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-600">{stats.neutrales}</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300">Neutrales</p>
                  </div>
                </div>

                {/* Barra de sentimiento */}
                <div className="mb-4">
                  <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
                    {stats.positivas > 0 && (
                      <div
                        className="bg-green-500"
                        style={{ width: `${(stats.positivas / stats.total) * 100}%` }}
                      />
                    )}
                    {stats.neutrales > 0 && (
                      <div
                        className="bg-gray-400"
                        style={{ width: `${(stats.neutrales / stats.total) * 100}%` }}
                      />
                    )}
                    {stats.negativas > 0 && (
                      <div
                        className="bg-red-500"
                        style={{ width: `${(stats.negativas / stats.total) * 100}%` }}
                      />
                    )}
                  </div>
                </div>

                {/* Veredicto */}
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Tendencia general:</span>
                  <span className={`font-bold text-lg ${stats.tendencyColor}`}>
                    {stats.tendency}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Timeline de noticias */}
          {timeline.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Últimas noticias de {source}
              </h3>

              <div className="space-y-3">
                {timeline.map((noticia, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl flex-shrink-0">
                      {getSentimentIcon(noticia.sentimiento?.tipo)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                        {noticia.titulo}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(noticia.fecha)}
                      </p>
                    </div>
                    <a
                      href={noticia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              💡 Insight para el representante
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {stats.tendency === "Favorable" && (
                `${source} tiene una tendencia positiva hacia ${playerName}. Considera este medio para exclusivas o comunicados importantes.`
              )}
              {stats.tendency === "Desfavorable" && (
                `${source} ha mostrado una tendencia crítica hacia ${playerName}. Monitoriza especialmente las publicaciones de este medio y considera estrategias de mejora de relación.`
              )}
              {stats.tendency === "Neutral" && (
                `${source} mantiene una cobertura equilibrada de ${playerName}. Buen medio para información objetiva.`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
