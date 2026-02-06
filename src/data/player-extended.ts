// Extended player data for agents - Contract, Stats, Injuries, Social Media, Rumors

export interface ContractInfo {
  endDate: string;
  salary: string; // Annual salary estimate
  releaseClause: string | null;
  agent: string;
  agentContact: string;
  signedDate: string;
}

export interface MarketValueHistory {
  date: string;
  value: number; // in millions
}

export interface SeasonStats {
  season: string;
  team: string;
  competition: string;
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
  rating: number; // 0-10
}

export interface InjuryRecord {
  date: string;
  injury: string;
  daysOut: number;
  matches: number; // matches missed
  severity: "low" | "medium" | "high";
}

export interface SocialMedia {
  instagram: { followers: number; engagement: number; handle: string };
  twitter: { followers: number; engagement: number; handle: string };
  tiktok: { followers: number; engagement: number; handle: string } | null;
  brandValue: string; // estimated brand value
  sponsors: string[];
}

export interface TransferRumor {
  date: string;
  club: string;
  clubLogo: string;
  type: "interest" | "negotiation" | "offer" | "rejected";
  amount: string | null;
  source: string;
  reliability: number; // 1-5 stars
}

export interface PlayerAlert {
  id: string;
  type: "contract" | "injury" | "negative_press" | "transfer" | "performance";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ExtendedPlayerData {
  playerId: string;
  contract: ContractInfo;
  marketValueHistory: MarketValueHistory[];
  currentStats: {
    season: string;
    appearances: number;
    goals: number;
    assists: number;
    minutes: number;
    rating: number;
  };
  seasonHistory: SeasonStats[];
  injuries: InjuryRecord[];
  totalDaysInjured: number;
  injuryRisk: "low" | "medium" | "high";
  socialMedia: SocialMedia;
  transferRumors: TransferRumor[];
  alerts: PlayerAlert[];
  competitorComparison: {
    name: string;
    team: string;
    value: string;
    salary: string;
    age: number;
  }[];
}

// Mock extended data for all players
export const EXTENDED_PLAYER_DATA: Record<string, ExtendedPlayerData> = {
  "isco": {
    playerId: "isco",
    contract: {
      endDate: "2025-06-30",
      salary: "4M €/año",
      releaseClause: null,
      agent: "Grupo Wasserman",
      agentContact: "info@teamwass.com",
      signedDate: "2024-01-15",
    },
    marketValueHistory: [
      { date: "2023-01", value: 5 },
      { date: "2023-06", value: 4.5 },
      { date: "2024-01", value: 4 },
      { date: "2024-06", value: 3.5 },
      { date: "2025-01", value: 3 },
    ],
    currentStats: {
      season: "2024/25",
      appearances: 18,
      goals: 3,
      assists: 5,
      minutes: 1245,
      rating: 7.1,
    },
    seasonHistory: [
      { season: "2024/25", team: "Real Betis", competition: "LaLiga", appearances: 18, goals: 3, assists: 5, minutes: 1245, yellowCards: 2, redCards: 0, rating: 7.1 },
      { season: "2023/24", team: "Real Betis", competition: "LaLiga", appearances: 24, goals: 4, assists: 7, minutes: 1680, yellowCards: 3, redCards: 0, rating: 7.0 },
      { season: "2022/23", team: "Sevilla FC", competition: "LaLiga", appearances: 28, goals: 5, assists: 6, minutes: 1920, yellowCards: 4, redCards: 0, rating: 6.9 },
    ],
    injuries: [
      { date: "2024-10-15", injury: "Sobrecarga muscular", daysOut: 14, matches: 3, severity: "low" },
      { date: "2024-03-20", injury: "Lesión de rodilla", daysOut: 45, matches: 8, severity: "medium" },
    ],
    totalDaysInjured: 59,
    injuryRisk: "medium",
    socialMedia: {
      instagram: { followers: 25400000, engagement: 2.3, handle: "@iscoalarcon" },
      twitter: { followers: 8200000, engagement: 1.1, handle: "@aboris" },
      tiktok: { followers: 1200000, engagement: 4.5, handle: "@iscoalarcon" },
      brandValue: "8M €",
      sponsors: ["Adidas", "Pepsi"],
    },
    transferRumors: [
      { date: "2025-01-15", club: "Al-Nassr", clubLogo: "🇸🇦", type: "interest", amount: "5M €", source: "Marca", reliability: 3 },
    ],
    alerts: [
      { id: "1", type: "contract", severity: "warning", title: "Contrato expira pronto", message: "El contrato de Isco expira en 6 meses. Considerar renovación o traspaso.", date: "2025-01-01", read: false },
    ],
    competitorComparison: [
      { name: "Dani Ceballos", team: "Real Madrid", value: "15M €", salary: "5M €/año", age: 28 },
      { name: "Pedri", team: "FC Barcelona", value: "100M €", salary: "8M €/año", age: 22 },
    ],
  },
  "lo-celso": {
    playerId: "lo-celso",
    contract: {
      endDate: "2027-06-30",
      salary: "5M €/año",
      releaseClause: "60M €",
      agent: "Gestifute",
      agentContact: "info@gestifute.com",
      signedDate: "2024-07-01",
    },
    marketValueHistory: [
      { date: "2023-01", value: 22 },
      { date: "2023-06", value: 20 },
      { date: "2024-01", value: 22 },
      { date: "2024-06", value: 20 },
      { date: "2025-01", value: 20 },
    ],
    currentStats: {
      season: "2024/25",
      appearances: 22,
      goals: 5,
      assists: 8,
      minutes: 1760,
      rating: 7.4,
    },
    seasonHistory: [
      { season: "2024/25", team: "Real Betis", competition: "LaLiga", appearances: 22, goals: 5, assists: 8, minutes: 1760, yellowCards: 3, redCards: 0, rating: 7.4 },
      { season: "2023/24", team: "Real Betis", competition: "LaLiga", appearances: 32, goals: 6, assists: 10, minutes: 2560, yellowCards: 5, redCards: 0, rating: 7.3 },
    ],
    injuries: [
      { date: "2024-11-10", injury: "Molestias musculares", daysOut: 7, matches: 2, severity: "low" },
    ],
    totalDaysInjured: 7,
    injuryRisk: "low",
    socialMedia: {
      instagram: { followers: 4500000, engagement: 3.1, handle: "@locelsogiovani" },
      twitter: { followers: 1200000, engagement: 1.5, handle: "@LoCelsoGiov662" },
      tiktok: null,
      brandValue: "3M €",
      sponsors: ["Nike"],
    },
    transferRumors: [
      { date: "2025-01-20", club: "Atlético Madrid", clubLogo: "🔴⚪", type: "interest", amount: null, source: "AS", reliability: 2 },
      { date: "2025-01-10", club: "Aston Villa", clubLogo: "🦁", type: "interest", amount: "25M €", source: "Sky Sports", reliability: 3 },
    ],
    alerts: [],
    competitorComparison: [
      { name: "De Paul", team: "Atlético Madrid", value: "22M €", salary: "6M €/año", age: 30 },
      { name: "Parejo", team: "Villarreal", value: "5M €", salary: "4M €/año", age: 35 },
    ],
  },
  "lukebakio": {
    playerId: "lukebakio",
    contract: {
      endDate: "2026-06-30",
      salary: "3.5M €/año",
      releaseClause: "50M €",
      agent: "CAA Stellar",
      agentContact: "football@stellar.com",
      signedDate: "2023-08-15",
    },
    marketValueHistory: [
      { date: "2023-01", value: 10 },
      { date: "2023-06", value: 12 },
      { date: "2024-01", value: 15 },
      { date: "2024-06", value: 15 },
      { date: "2025-01", value: 15 },
    ],
    currentStats: {
      season: "2024/25",
      appearances: 24,
      goals: 9,
      assists: 4,
      minutes: 1920,
      rating: 7.2,
    },
    seasonHistory: [
      { season: "2024/25", team: "Sevilla FC", competition: "LaLiga", appearances: 24, goals: 9, assists: 4, minutes: 1920, yellowCards: 4, redCards: 0, rating: 7.2 },
      { season: "2023/24", team: "Sevilla FC", competition: "LaLiga", appearances: 35, goals: 13, assists: 6, minutes: 2800, yellowCards: 5, redCards: 1, rating: 7.1 },
    ],
    injuries: [
      { date: "2024-12-01", injury: "Esguince de tobillo", daysOut: 21, matches: 4, severity: "medium" },
    ],
    totalDaysInjured: 21,
    injuryRisk: "low",
    socialMedia: {
      instagram: { followers: 890000, engagement: 4.2, handle: "@dodilukebakio" },
      twitter: { followers: 120000, engagement: 2.1, handle: "@daboris_99" },
      tiktok: null,
      brandValue: "1.5M €",
      sponsors: ["Nike"],
    },
    transferRumors: [
      { date: "2025-01-25", club: "Napoli", clubLogo: "🔵", type: "negotiation", amount: "18M €", source: "Fabrizio Romano", reliability: 4 },
      { date: "2025-01-18", club: "West Ham", clubLogo: "⚒️", type: "offer", amount: "20M €", source: "The Athletic", reliability: 4 },
      { date: "2025-01-10", club: "AC Milan", clubLogo: "🔴⚫", type: "interest", amount: null, source: "Gazzetta", reliability: 3 },
    ],
    alerts: [
      { id: "1", type: "transfer", severity: "critical", title: "Oferta formal recibida", message: "West Ham ha presentado oferta formal de 20M€. Respuesta requerida en 48h.", date: "2025-01-18", read: false },
      { id: "2", type: "performance", severity: "info", title: "Racha goleadora", message: "Lukebakio ha marcado en 4 partidos consecutivos. Momento óptimo para negociar.", date: "2025-01-20", read: true },
    ],
    competitorComparison: [
      { name: "Nico Williams", team: "Athletic Club", value: "70M €", salary: "4M €/año", age: 22 },
      { name: "Savio", team: "Girona", value: "50M €", salary: "2M €/año", age: 20 },
    ],
  },
  "saul": {
    playerId: "saul",
    contract: {
      endDate: "2026-06-30",
      salary: "6M €/año",
      releaseClause: null,
      agent: "You First Sports",
      agentContact: "info@youfirst.es",
      signedDate: "2024-01-01",
    },
    marketValueHistory: [
      { date: "2023-01", value: 15 },
      { date: "2023-06", value: 12 },
      { date: "2024-01", value: 10 },
      { date: "2024-06", value: 10 },
      { date: "2025-01", value: 10 },
    ],
    currentStats: {
      season: "2024/25",
      appearances: 20,
      goals: 2,
      assists: 3,
      minutes: 1400,
      rating: 6.8,
    },
    seasonHistory: [
      { season: "2024/25", team: "Sevilla FC", competition: "LaLiga", appearances: 20, goals: 2, assists: 3, minutes: 1400, yellowCards: 6, redCards: 0, rating: 6.8 },
      { season: "2023/24", team: "Sevilla FC", competition: "LaLiga", appearances: 30, goals: 3, assists: 5, minutes: 2100, yellowCards: 8, redCards: 0, rating: 6.7 },
    ],
    injuries: [],
    totalDaysInjured: 0,
    injuryRisk: "low",
    socialMedia: {
      instagram: { followers: 6800000, engagement: 1.8, handle: "@saboris" },
      twitter: { followers: 2100000, engagement: 0.9, handle: "@saboris" },
      tiktok: null,
      brandValue: "2M €",
      sponsors: ["Nike", "EA Sports"],
    },
    transferRumors: [],
    alerts: [],
    competitorComparison: [
      { name: "Koke", team: "Atlético Madrid", value: "10M €", salary: "8M €/año", age: 32 },
    ],
  },
  "isaac-romero": {
    playerId: "isaac-romero",
    contract: {
      endDate: "2028-06-30",
      salary: "2M €/año",
      releaseClause: "80M €",
      agent: "Bahia Internacional",
      agentContact: "info@bahiaint.com",
      signedDate: "2024-06-01",
    },
    marketValueHistory: [
      { date: "2023-01", value: 3 },
      { date: "2023-06", value: 5 },
      { date: "2024-01", value: 8 },
      { date: "2024-06", value: 12 },
      { date: "2025-01", value: 12 },
    ],
    currentStats: {
      season: "2024/25",
      appearances: 23,
      goals: 11,
      assists: 2,
      minutes: 1840,
      rating: 7.3,
    },
    seasonHistory: [
      { season: "2024/25", team: "Sevilla FC", competition: "LaLiga", appearances: 23, goals: 11, assists: 2, minutes: 1840, yellowCards: 3, redCards: 0, rating: 7.3 },
      { season: "2023/24", team: "Sevilla FC", competition: "LaLiga", appearances: 28, goals: 8, assists: 3, minutes: 1680, yellowCards: 4, redCards: 0, rating: 6.9 },
    ],
    injuries: [],
    totalDaysInjured: 0,
    injuryRisk: "low",
    socialMedia: {
      instagram: { followers: 180000, engagement: 5.2, handle: "@isaacromerof" },
      twitter: { followers: 35000, engagement: 3.1, handle: "@isaacromerof" },
      tiktok: null,
      brandValue: "500K €",
      sponsors: [],
    },
    transferRumors: [
      { date: "2025-01-22", club: "Real Madrid", clubLogo: "⚪", type: "interest", amount: null, source: "Marca", reliability: 2 },
      { date: "2025-01-15", club: "FC Barcelona", clubLogo: "🔵🔴", type: "interest", amount: null, source: "Sport", reliability: 2 },
    ],
    alerts: [
      { id: "1", type: "performance", severity: "info", title: "Pichichi candidate", message: "Isaac Romero está 3º en la tabla de goleadores. Oportunidad de revalorización.", date: "2025-01-20", read: false },
    ],
    competitorComparison: [
      { name: "Dovbyk", team: "AS Roma", value: "40M €", salary: "4M €/año", age: 27 },
      { name: "Álvaro Morata", team: "AC Milan", value: "15M €", salary: "6M €/año", age: 32 },
    ],
  },
};

// Generate default data for players without extended data
export const getExtendedPlayerData = (playerId: string): ExtendedPlayerData => {
  if (EXTENDED_PLAYER_DATA[playerId]) {
    return EXTENDED_PLAYER_DATA[playerId];
  }

  // Return default structure for unknown players
  return {
    playerId,
    contract: {
      endDate: "2026-06-30",
      salary: "N/D",
      releaseClause: null,
      agent: "N/D",
      agentContact: "N/D",
      signedDate: "N/D",
    },
    marketValueHistory: [],
    currentStats: {
      season: "2024/25",
      appearances: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
      rating: 0,
    },
    seasonHistory: [],
    injuries: [],
    totalDaysInjured: 0,
    injuryRisk: "low",
    socialMedia: {
      instagram: { followers: 0, engagement: 0, handle: "" },
      twitter: { followers: 0, engagement: 0, handle: "" },
      tiktok: null,
      brandValue: "N/D",
      sponsors: [],
    },
    transferRumors: [],
    alerts: [],
    competitorComparison: [],
  };
};

// Helper to format large numbers
export const formatFollowers = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

// Calculate contract days remaining
export const getContractDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

// Get contract status
export const getContractStatus = (endDate: string): { status: "ok" | "warning" | "critical"; text: string } => {
  const days = getContractDaysRemaining(endDate);
  if (days <= 180) return { status: "critical", text: "Expira pronto" };
  if (days <= 365) return { status: "warning", text: "Último año" };
  return { status: "ok", text: "Vigente" };
};
