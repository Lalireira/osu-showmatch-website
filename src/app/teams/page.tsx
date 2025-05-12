'use client';

import { useState, useEffect } from 'react';
import { teams } from '@/data/teams';
import PlayerCard from '@/components/PlayerCard';
import { CACHE_VERSIONS, getFromLocalStorage, saveToLocalStorage } from '@/lib/cacheConfig';
import { extractUserIdFromUrl } from '@/lib/utils';

interface PlayerWithStats {
  id: number;
  username: string;
  country: string;
  statistics?: {
    pp: number;
    accuracy: number;
    global_rank: number;
    country_rank: number;
    play_count?: number;
  } | null;
  avatar_url?: string;
}

export default function TeamsPage() {
  const [playersData, setPlayersData] = useState<Record<number, PlayerWithStats | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllPlayers() {
      try {
        setIsLoading(true);

        const allIds = teams.flatMap(team => {
          return team.members.map(member => {
            try {
              return extractUserIdFromUrl(member.url);
            } catch (error) {
              console.error(`Failed to extract user ID from URL: ${member.url}`, error);
              return null;
            }
          }).filter(Boolean) as number[]; // nullを除外
        });

        console.log('All extracted user IDs:', allIds);

        const newPlayersData: Record<number, PlayerWithStats | null> = {};
        for (const id of allIds) {
          try {
            // キャッシュ優先
            const cached = getFromLocalStorage<PlayerWithStats>(`user_${id}`, CACHE_VERSIONS.PLAYER);
            if (cached) {
              console.log(`Using cached data for user ${id}:`, cached);
              newPlayersData[id] = cached;
              continue;
            }

            console.log(`Fetching data for user ${id} from API`);
            // サーバーサイドAPIを使用
            try {
              const response = await fetch(`/api/osu/user/${id}`);
              console.log(`API response status for user ${id}:`, response.status, response.statusText);

              if (!response.ok) {
                throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
              }

              const data = await response.json();
              console.log(`API response data for user ${id}:`, data);

              if (!data || !data.username) {
                console.error(`Invalid API response for user ${id}:`, data);
                throw new Error(`Invalid API response for user ${id}`);
              }

              // APIレスポンスの構造に合わせてデータを整形
              newPlayersData[id] = {
                id: id,
                username: data.username === 'undefined' ? `Player ${id}` : (data.username || `Player ${id}`),
                avatar_url: data.avatar_url || '',
                country: data.country || '',
                statistics: data.statistics || null
              };

              console.log(`Formatted data for user ${id}:`, newPlayersData[id]);
              // キャッシュに保存
              saveToLocalStorage(`user_${id}`, newPlayersData[id], CACHE_VERSIONS.PLAYER);
            } catch (apiError) {
              console.error(`API error for user ${id}:`, apiError);
              // APIエラーの場合でもプレイヤーデータを仮作成
              newPlayersData[id] = {
                id: id,
                username: `Player ${id}`,
                avatar_url: '',
                country: '',
                statistics: null
              };
            }
          } catch (error) {
            console.error(`Error fetching data for user ${id}:`, error);
            newPlayersData[id] = null;
          }
        }

        console.log('Final players data:', newPlayersData);
        setPlayersData(newPlayersData);
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllPlayers();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#050813] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4 animate-pulse">Loading Teams Data...</h1>
          <p>Getting the latest player information</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050813]">
      <div className="container mx-auto px-2 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white animate-fade-in-down">Teams</h1>
        <div className="space-y-8">
          {teams.map((team) => (
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

                    // プレイヤーデータのログを出力
                    console.log(`Player data for user ${userId} (${member.userNo}):`, player);

                    // ユーザー名を正しく処理
                    const displayUsername = player?.username || member.userNo;

                    return (
                      <PlayerCard
                        key={member.userNo}
                        userId={userId}
                        username={displayUsername === 'undefined' ? member.userNo : displayUsername}
                        url={member.url}
                        userData={player ? {
                          username: player.username === 'undefined' ? member.userNo : player.username,
                          avatar_url: player.avatar_url || '',
                          country: player.country || '',
                          statistics: player.statistics ? {
                            pp: player.statistics.pp,
                            accuracy: player.statistics.accuracy,
                            global_rank: player.statistics.global_rank,
                            country_rank: player.statistics.country_rank,
                            play_count: player.statistics.play_count || 0
                          } : null
                        } : null}
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
