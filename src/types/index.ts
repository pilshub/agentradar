export interface Player {
  id: string;
  name: string;
  fullName: string;
  team: "Real Betis" | "Sevilla FC";
  position: string;
  nationality: string;
  age: number;
  number: number;
  photo: string;
  transfermarktId: string;
  transfermarktUrl: string;
  marketValue?: string;
}

export interface Mencion {
  jugador: string;
  titulo: string;
  descripcion: string;
  fuente: string;
  url: string;
  fecha: string;
  sentimiento?: {
    tipo: "positivo" | "negativo" | "neutral";
    score: number;
  } | null;
}

export interface ApiResponse {
  menciones: Mencion[];
  total: number;
  jugadores_buscados: string[];
  fuentes_consultadas: string[];
  resumen: {
    total: number;
    positivas: number;
    negativas: number;
    neutrales: number;
    score_general: number;
  };
  error?: string;
}

export interface TransfermarktResponse {
  valor: string;
  tendencia: "up" | "down" | "stable";
  ultimaActualizacion: string;
  error?: string;
}

export interface HistoryEntry {
  fecha: string;
  menciones: number;
  positivas: number;
  negativas: number;
  neutrales: number;
}

export type TeamColors = {
  [key in Player["team"]]: {
    primary: string;
    secondary: string;
    text: string;
  };
};
