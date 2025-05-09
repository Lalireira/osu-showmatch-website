'use client';

import { useState, useEffect } from 'react';
import PlayerCard from '@/components/PlayerCard';
import { teams, Team, Player } from '@/data/teams';
import { getUserData } from '@/lib/osuApi';

interface PlayerWithStats extends Player {
  statistics?: {
    pp: number;
    accuracy: number;
    global_rank: number;
    country_rank: number;
  };
}

interface TeamWithStats {
  name: string;
  players: PlayerWithStats[];
}

export default function TeamsPage() {
  const [teamsWithStats, setTeamsWithStats] = useState<TeamWithStats[]>(teams);

  useEffect(() => {
    async function fetchAndSortPlayers() {
      const teamsWithStats = await Promise.all(
        teams.map(async (team) => {
          const playersWithStats = await Promise.all(
            team.players.map(async (player) => {
              try {
                const data = await getUserData(player.id);
                return {
                  ...player,
                  statistics: data.statistics,
                };
              } catch (error) {
                console.error(`Error fetching data for ${player.username}:`, error);
                return player;
              }
            })
          );

          // Sort players by global rank (lower rank = better)
          const sortedPlayers = [...playersWithStats].sort((a, b) => {
            const rankA = a.statistics?.global_rank ?? Infinity;
            const rankB = b.statistics?.global_rank ?? Infinity;
            return rankA - rankB;
          });

          return {
            ...team,
            players: sortedPlayers,
          };
        })
      );

      setTeamsWithStats(teamsWithStats);
    }

    fetchAndSortPlayers();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Teams</h1>
      <div className="space-y-12">
        {teamsWithStats.map((team, teamIndex) => (
          <div key={teamIndex} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">{team.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.players.map((player, playerIndex) => (
                <PlayerCard
                  key={playerIndex}
                  userId={player.id}
                  username={player.username}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 