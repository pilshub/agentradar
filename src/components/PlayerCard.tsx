"use client";

import { useState, useEffect } from "react";
import { Player } from "@/types";
import { TEAM_COLORS } from "@/data/players";
import Image from "next/image";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const teamColors = TEAM_COLORS[player.team];
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    const generateBackground = async () => {
      try {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Professional football stadium panoramic view, ${player.team} colors, dramatic evening lighting, empty pitch, cinematic atmosphere, abstract geometric patterns, modern sports design, 4k quality`,
            width: 1024,
            height: 256,
          }),
        });
        const data = await response.json();
        if (data.imageUrl) {
          setBgImage(data.imageUrl);
        }
      } catch (error) {
        console.error("Error generating background:", error);
      }
    };

    generateBackground();
  }, [player.team]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className={`${teamColors.primary} h-32 relative overflow-hidden`}>
        {bgImage && (
          <img
            src={bgImage}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-16 mb-4">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-200 flex-shrink-0">
            <Image
              src={player.photo}
              alt={player.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="pb-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {player.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {player.fullName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoItem label="Equipo" value={player.team} />
          <InfoItem label="Posición" value={player.position} />
          <InfoItem label="Nacionalidad" value={player.nationality} />
          <InfoItem label="Edad" value={`${player.age} años`} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="font-medium text-gray-900 dark:text-white text-sm mt-0.5">
        {value}
      </p>
    </div>
  );
}
