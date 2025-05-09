'use client';

import { useState, useEffect } from 'react';
import { teams, Team, Player } from '@/data/teams';
import { getUserData } from '@/lib/osuApi';
import PlayerCard from '@/components/PlayerCard';
import { formatNumber } from '../lib/utils';

interface PlayerWithStats extends Omit<Player, 'statistics'> {
  statistics?: {
    pp: number;
    accuracy: number;
    global_rank: number;
    country_rank: number;
    play_count?: number;
  };
  avatar_url?: string;
}

interface TeamWithStats extends Omit<Team, 'players'> {
  players: PlayerWithStats[];
}

export default function TeamsPage() {
  const [teamsWithStats, setTeamsWithStats] = useState<TeamWithStats[]>(teams);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      const updatedTeams = await Promise.all(
        teams.map(async (team) => {
          const playersWithStats = await Promise.all(
            team.players.map(async (player) => {
              try {
                const userData = await getUserData(player.id);
                return {
                  ...player,
                  statistics: userData.statistics,
                  avatar_url: userData.avatar_url
                };
              } catch (error) {
                console.error(`Error fetching data for player ${player.username}:`, error);
                return player;
              }
            })
          );
          // Sort players by global rank
          const sortedPlayers = playersWithStats.sort((a, b) => {
            const rankA = a.statistics?.global_rank || Infinity;
            const rankB = b.statistics?.global_rank || Infinity;
            return rankA - rankB;
          });
          return { ...team, players: sortedPlayers };
        })
      );
      setTeamsWithStats(updatedTeams);
    };

    fetchPlayerStats();
  }, []);

  return (
    <main className="min-h-screen bg-[#050813]">
      <div className="container mx-auto px-4 py-8">
        <h1 
          className="text-4xl font-bold mb-8 text-center text-white animate-fade-in-down"
          style={{ animationDelay: '0s' }}
        >
          Teams
        </h1>
        <div className="space-y-12">
          {teamsWithStats.map((team, teamIndex) => (
            <div 
              key={teamIndex} 
              className="space-y-4 animate-fade-in-down"
              style={{ animationDelay: `${(teamIndex + 1) * 0.3}s` }}
            >
              <h2 className="text-2xl font-bold mb-4 text-white">{team.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.players.map((player, playerIndex) => (
                  <PlayerCard
                    key={player.id}
                    userId={player.id}
                    username={player.username}
                    index={playerIndex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 