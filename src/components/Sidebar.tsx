"use client";

import { Player } from "@/types";
import { getPlayersByTeam, TEAM_COLORS } from "@/data/players";
import Image from "next/image";

interface SidebarProps {
  selectedPlayer: Player | null;
  onSelectPlayer: (player: Player) => void;
}

export function Sidebar({ selectedPlayer, onSelectPlayer }: SidebarProps) {
  const playersByTeam = getPlayersByTeam();

  return (
    <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto flex-shrink-0">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Monitor de Prensa
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Selecciona un jugador
        </p>
      </div>

      <nav className="p-4">
        {Object.entries(playersByTeam).map(([team, players]) => (
          <div key={team} className="mb-6">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-2 ${TEAM_COLORS[team as keyof typeof TEAM_COLORS].secondary}`}
            >
              <div
                className={`w-3 h-3 rounded-full ${TEAM_COLORS[team as keyof typeof TEAM_COLORS].primary}`}
              />
              <span
                className={`text-sm font-semibold ${TEAM_COLORS[team as keyof typeof TEAM_COLORS].text}`}
              >
                {team}
              </span>
            </div>

            <ul className="space-y-1">
              {players.map((player) => (
                <li key={player.id}>
                  <button
                    onClick={() => onSelectPlayer(player)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      selectedPlayer?.id === player.id
                        ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent"
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={player.photo}
                        alt={player.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          selectedPlayer?.id === player.id
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {player.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {player.position}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      #{player.number}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Datos de Transfermarkt
        </p>
      </div>
    </aside>
  );
}
