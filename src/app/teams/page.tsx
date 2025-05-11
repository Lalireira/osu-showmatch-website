'use client';

import { useState, useEffect } from 'react';
import { teams } from '@/data/teams';
import { getUserData } from '@/lib/osuApi';
import PlayerCard from '@/components/PlayerCard';
import { CACHE_DURATIONS, CACHE_VERSIONS, getFromLocalStorage, saveToLocalStorage } from '@/lib/cacheConfig';
import { extractUserIdFromUrl } from '@/lib/utils';

interface PlayerWithStats {
  id: number;
  username: string;
  statistics?: {
    pp: number;
    accuracy: number;
    global_rank: number;
    country_rank: number;
    play_count?: number;
  };
  avatar_url?: string;
}

export default function TeamsPage() {
  const [playersData, setPlayersData] = useState<Record<number, PlayerWithStats | null>>({});

  useEffect(() => {
    async function fetchAllPlayers() {
      const allIds = teams.flatMap(team => team.members.map(member => extractUserIdFromUrl(member.url)));
      const newPlayersData: Record<number, PlayerWithStats | null> = {};
      for (const id of allIds) {
        try {
          // キャッシュ優先
          const cached = getFromLocalStorage<PlayerWithStats>(`user_${id}`, CACHE_VERSIONS.PLAYER);
          if (cached) {
            newPlayersData[id] = cached;
            continue;
          }
          const data = await getUserData(id);
          newPlayersData[id] = data;
          saveToLocalStorage(`user_${id}`, data, CACHE_VERSIONS.PLAYER);
        } catch {
          newPlayersData[id] = null;
        }
      }
      setPlayersData(newPlayersData);
    }
    fetchAllPlayers();
  }, []);

  return (
    <main className="min-h-screen bg-[#050813]">
      <div className="container mx-auto px-2 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white animate-fade-in-down">Teams</h1>
        <div className="space-y-8">
          {teams.map((team, idx) => (
            <div key={team.team} className="bg-[#181c24] rounded-lg shadow p-6 animate-fade-in-down">
              <h2 className="text-2xl font-bold mb-4 text-white">{team.team}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {team.members
                  .slice()
                  .sort((a, b) => {
                    const idA = extractUserIdFromUrl(a.url);
                    const idB = extractUserIdFromUrl(b.url);
                    const rankA = playersData[idA]?.statistics?.global_rank ?? Infinity;
                    const rankB = playersData[idB]?.statistics?.global_rank ?? Infinity;
                    return rankA - rankB;
                  })
                  .map(member => {
                    const userId = extractUserIdFromUrl(member.url);
                    const player = playersData[userId];
                    return (
                      <PlayerCard
                        key={member.userNo}
                        userId={userId}
                        username={player?.username || 'Loading...'}
                      />
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 