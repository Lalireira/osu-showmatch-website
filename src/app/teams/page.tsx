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

// キャッシュの型定義
interface PlayerCacheData {
  data: PlayerWithStats;
  timestamp: number;
}

// キャッシュの有効期限（24時間）
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// キャッシュからデータを取得する関数
function getFromCache(userId: number): PlayerWithStats | null {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(`player_${userId}`);
  if (!cached) return null;

  const { data, timestamp }: PlayerCacheData = JSON.parse(cached);
  const now = Date.now();

  // キャッシュが有効期限内かチェック
  if (now - timestamp < CACHE_DURATION) {
    return data;
  }

  // 期限切れの場合はキャッシュを削除
  localStorage.removeItem(`player_${userId}`);
  return null;
}

// データをキャッシュに保存する関数
function saveToCache(userId: number, data: PlayerWithStats): void {
  if (typeof window === 'undefined') return;

  const cacheData: PlayerCacheData = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(`player_${userId}`, JSON.stringify(cacheData));
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
                // キャッシュからデータを取得
                const cachedData = getFromCache(player.id);
                if (cachedData) {
                  return cachedData;
                }

                // キャッシュになければAPIから取得
                const userData = await getUserData(player.id);
                const playerData = {
                  ...player,
                  statistics: userData.statistics,
                  avatar_url: userData.avatar_url
                };
                
                // 取得したデータをキャッシュに保存
                saveToCache(player.id, playerData);
                return playerData;
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