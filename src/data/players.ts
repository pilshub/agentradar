import { Player, TeamColors } from "@/types";

export const PLAYERS: Player[] = [
  // Real Betis
  {
    id: "isco",
    name: "Isco",
    fullName: "Francisco Román Alarcón Suárez",
    team: "Real Betis",
    position: "Centrocampista",
    nationality: "España",
    age: 32,
    number: 22,
    photo: "https://img.a.transfermarkt.technology/portrait/big/59876-1663931465.jpg",
    transfermarktId: "59876",
    transfermarktUrl: "https://www.transfermarkt.es/isco/profil/spieler/59876",
    marketValue: "3M €",
  },
  {
    id: "lo-celso",
    name: "Lo Celso",
    fullName: "Giovani Lo Celso",
    team: "Real Betis",
    position: "Centrocampista",
    nationality: "Argentina",
    age: 28,
    number: 18,
    photo: "https://img.a.transfermarkt.technology/portrait/big/348795-1694505663.jpg",
    transfermarktId: "348795",
    transfermarktUrl: "https://www.transfermarkt.es/giovani-lo-celso/profil/spieler/348795",
    marketValue: "20M €",
  },
  // Sevilla FC
  {
    id: "lukebakio",
    name: "Lukebakio",
    fullName: "Dodi Lukebakio",
    team: "Sevilla FC",
    position: "Extremo derecho",
    nationality: "Bélgica",
    age: 27,
    number: 17,
    photo: "https://img.a.transfermarkt.technology/portrait/big/331972-1694505839.jpg",
    transfermarktId: "331972",
    transfermarktUrl: "https://www.transfermarkt.es/dodi-lukebakio/profil/spieler/331972",
    marketValue: "15M €",
  },
  {
    id: "saul",
    name: "Saúl",
    fullName: "Saúl Ñíguez Esclapez",
    team: "Sevilla FC",
    position: "Centrocampista",
    nationality: "España",
    age: 29,
    number: 8,
    photo: "https://img.a.transfermarkt.technology/portrait/big/127042-1694505702.jpg",
    transfermarktId: "127042",
    transfermarktUrl: "https://www.transfermarkt.es/saul-niguez/profil/spieler/127042",
    marketValue: "10M €",
  },
  {
    id: "isaac-romero",
    name: "Isaac Romero",
    fullName: "Isaac Romero Fernández",
    team: "Sevilla FC",
    position: "Delantero centro",
    nationality: "España",
    age: 24,
    number: 9,
    photo: "https://img.a.transfermarkt.technology/portrait/big/693450-1723126646.jpg",
    transfermarktId: "693450",
    transfermarktUrl: "https://www.transfermarkt.es/isaac-romero/profil/spieler/693450",
    marketValue: "12M €",
  },
];

export const TEAM_COLORS: TeamColors = {
  "Real Betis": {
    primary: "bg-green-600",
    secondary: "bg-green-100",
    text: "text-green-800",
  },
  "Sevilla FC": {
    primary: "bg-red-600",
    secondary: "bg-red-100",
    text: "text-red-800",
  },
};

export const getPlayersByTeam = () => {
  return {
    "Real Betis": PLAYERS.filter((p) => p.team === "Real Betis"),
    "Sevilla FC": PLAYERS.filter((p) => p.team === "Sevilla FC"),
  };
};

export const getPlayerById = (id: string): Player | undefined => {
  return PLAYERS.find((p) => p.id === id);
};
