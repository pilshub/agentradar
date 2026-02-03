"use client";

import { useState, useEffect, useCallback } from "react";
import { Mencion } from "@/types";

interface NewsDetailProps {
  noticia: Mencion;
  onClose: () => void;
  onSourceClick: (source: string) => void;
}

export function NewsDetail({ noticia, onClose, onSourceClick }: NewsDetailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

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

  useEffect(() => {
    // Generar imagen de fondo para la noticia
    const generateNewsImage = async () => {
      try {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Football news illustration, ${noticia.jugador}, professional sports journalism, modern design, abstract geometric background`,
            width: 800,
            height: 400,
          }),
        });
        const data = await response.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error("Error generating image:", error);
      } finally {
        setLoadingImage(false);
      }
    };

    generateNewsImage();
  }, [noticia.jugador]);

  const getSentimentDetails = () => {
    const tipo = noticia.sentimiento?.tipo || "neutral";
    const score = noticia.sentimiento?.score || 0;

    const details = {
      positivo: {
        icon: "🟢",
        label: "Positivo",
        color: "text-green-600 bg-green-50 border-green-200",
        description: "Esta noticia tiene un tono favorable hacia el jugador",
        factors: [
          score >= 2 && "Múltiples términos positivos detectados",
          "Posible mención de logros o éxitos",
          "Contexto generalmente favorable",
        ].filter(Boolean),
      },
      negativo: {
        icon: "🔴",
        label: "Negativo",
        color: "text-red-600 bg-red-50 border-red-200",
        description: "Esta noticia tiene un tono desfavorable o crítico",
        factors: [
          score <= -2 && "Múltiples términos negativos detectados",
          "Posible mención de problemas o críticas",
          "Contexto potencialmente dañino para la imagen",
        ].filter(Boolean),
      },
      neutral: {
        icon: "⚪",
        label: "Neutral",
        color: "text-gray-600 bg-gray-50 border-gray-200",
        description: "Esta noticia tiene un tono informativo sin sesgo claro",
        factors: [
          "Contenido principalmente informativo",
          "Sin términos claramente positivos o negativos",
          "Cobertura equilibrada",
        ],
      },
    };

    return details[tipo as keyof typeof details] || details.neutral;
  };

  const sentimentDetails = getSentimentDetails();

  const formatDate = (fecha: string) => {
    if (!fecha) return "Fecha desconocida";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fecha;
    }
  };

  const getImpactLevel = () => {
    const score = Math.abs(noticia.sentimiento?.score || 0);
    if (score >= 3) return { level: "Alto", color: "text-red-600" };
    if (score >= 2) return { level: "Medio", color: "text-yellow-600" };
    return { level: "Bajo", color: "text-green-600" };
  };

  const impact = getImpactLevel();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header con imagen */}
        <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-700">
          {loadingImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="News illustration"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Source badge */}
          <button
            onClick={() => onSourceClick(noticia.fuente)}
            className="absolute bottom-4 left-4 px-4 py-2 bg-white/90 dark:bg-gray-800/90 rounded-full text-sm font-medium hover:bg-white transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {noticia.fuente}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {noticia.titulo}
          </h2>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 mb-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(noticia.fecha)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {noticia.jugador}
            </span>
          </div>

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {noticia.descripcion}
            </p>
          </div>

          {/* Sentiment Analysis Card */}
          <div className={`rounded-xl border-2 p-5 mb-6 ${sentimentDetails.color}`}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">{sentimentDetails.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  Análisis de Sentimiento: {sentimentDetails.label}
                </h3>
                <p className="text-sm opacity-80 mb-3">
                  {sentimentDetails.description}
                </p>
                <div className="space-y-1">
                  {sentimentDetails.factors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {noticia.sentimiento?.score || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Impacto</p>
              <p className={`text-2xl font-bold ${impact.color}`}>
                {impact.level}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Alcance</p>
              <p className="text-2xl font-bold text-blue-600">
                {noticia.fuente === "Marca" || noticia.fuente === "AS" ? "Nacional" : "Regional"}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 mb-6">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recomendaciones para el Representante
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              {noticia.sentimiento?.tipo === "positivo" && (
                <>
                  <li>• Considerar compartir esta noticia en redes sociales del jugador</li>
                  <li>• Buena oportunidad para reforzar relación con {noticia.fuente}</li>
                  <li>• Archivar para futuras negociaciones o presentaciones</li>
                </>
              )}
              {noticia.sentimiento?.tipo === "negativo" && (
                <>
                  <li>• Monitorizar reacciones en redes sociales</li>
                  <li>• Considerar si es necesaria una respuesta o comunicado</li>
                  <li>• Evaluar contacto con {noticia.fuente} para aclarar información</li>
                </>
              )}
              {noticia.sentimiento?.tipo === "neutral" && (
                <>
                  <li>• Noticia informativa, no requiere acción inmediata</li>
                  <li>• Mantener en archivo para contexto futuro</li>
                  <li>• Buena cobertura mediática estándar</li>
                </>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={noticia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Leer noticia completa
            </a>
            <button
              onClick={() => onSourceClick(noticia.fuente)}
              className="py-3 px-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Ver perfil de {noticia.fuente}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
