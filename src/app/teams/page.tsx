"use client";

import { useState, useEffect, useCallback } from "react";
import PlayerCard from "@/components/PlayerCard";
import { extractUserIdFromUrl } from "@/lib/utils";
import {
  getFromLocalStorage,
  saveToLocalStorage,
  CACHE_VERSIONS,
} from "@/lib/cacheConfig";

interface UserData {
  username: string;
  avatar_url: string;
  country: string;
  statistics?: {
    pp: number;
    accuracy: number;
    global_rank: number;
    country_rank: number;
    play_count: number;
  } | null;
}

interface Player {
  userNo: string;
  url: string;
  username?: string;
  pp?: number;
  rank?: number;
  country?: string;
  countryRank?: number;
  avatarUrl?: string;
}

interface Team {
  team: string;
  members: Player[];
}

interface TeamLabel {
  team: string;
  displayName: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);

  // プレイヤーデータの取得関数
  const fetchAllPlayers = useCallback(
    async (teamsData: Team[]) => {
      if (teamsData.length === 0 || playersLoaded) return;

      setIsLoading(true);
      const updatedTeams = JSON.parse(JSON.stringify(teamsData));

      try {
        await Promise.all(
          updatedTeams.flatMap((team: Team) =>
            team.members.map(async (member: Player) => {
              if (!member.username) {
                try {
                  const userId = extractUserIdFromUrl(member.url);
                  const cacheKey = `player_${userId}`;

                  // キャッシュからデータを取得
                  const cachedData = getFromLocalStorage<UserData>(
                    cacheKey,
                    CACHE_VERSIONS.PLAYER
                  );
                  if (cachedData) {
                    member.username = cachedData.username;
                    member.pp = cachedData.statistics?.pp;
                    member.rank = cachedData.statistics?.global_rank;
                    member.country = cachedData.country;
                    member.countryRank = cachedData.statistics?.country_rank;
                    member.avatarUrl = cachedData.avatar_url;
                    return;
                  }

                  // キャッシュになければAPIから取得
                  const response = await fetch(`/api/osu/user/${userId}`);
                  if (!response.ok) return;
                  const data = await response.json();

                  // データをキャッシュに保存
                  saveToLocalStorage<UserData>(
                    cacheKey,
                    data,
                    CACHE_VERSIONS.PLAYER
                  );

                  member.username = data.username;
                  member.pp = data.pp;
                  member.rank = data.statistics?.global_rank;
                  member.country = data.country;
                  member.countryRank = data.countryRank;
                  member.avatarUrl = data.avatarUrl;
                } catch (error) {
                  console.error(
                    `Error fetching data for user ${member.userNo}:`,
                    error
                  );
                }
              }
            })
          )
        );

        setTeams(updatedTeams);
        setPlayersLoaded(true);
      } catch (error) {
        console.error("Error fetching player data:", error);
        setError("Failed to load player data");
      } finally {
        setIsLoading(false);
      }
    },
    [playersLoaded]
  );

  // チームデータの取得
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        // キャッシュからデータを取得
        const cachedTeams = getFromLocalStorage<Team[]>(
          "teams",
          CACHE_VERSIONS.PLAYER
        );
        if (cachedTeams) {
          setTeams(cachedTeams);
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/admin/teams-config");
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        const data = await response.json();

        // データをキャッシュに保存
        saveToLocalStorage<Team[]>("teams", data, CACHE_VERSIONS.PLAYER);

        setTeams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch teams");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // プレイヤーデータの取得
  useEffect(() => {
    fetchAllPlayers(teams);
  }, [teams, fetchAllPlayers]);

  // チームラベルの取得
  useEffect(() => {
    let isMounted = true;

    // キャッシュからデータを取得
    const cachedLabels = getFromLocalStorage<TeamLabel[]>(
      "team_labels",
      CACHE_VERSIONS.PLAYER
    );
    if (cachedLabels) {
      if (isMounted) {
        setTeamLabels(cachedLabels);
      }
      return;
    }

    fetch("/api/admin/team-labels")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          // データをキャッシュに保存
          saveToLocalStorage<TeamLabel[]>(
            "team_labels",
            data,
            CACHE_VERSIONS.PLAYER
          );
          setTeamLabels(data);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Teams</h1>
        <div className="space-y-12">
          {[...Array(3)].map((_, teamIndex) => (
            <div key={teamIndex} className="mb-8">
              <div className="h-8 bg-gray-700 rounded animate-pulse mb-4 w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[...Array(3)].map((_, playerIndex) => (
                  <div
                    key={playerIndex}
                    className="bg-gray-800 rounded-lg p-4 h-[200px] animate-pulse"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Teams</h1>
      <div className="space-y-12">
        {[...teams]
          .sort((a, b) =>
            a.team.localeCompare(b.team, undefined, { numeric: true })
          )
          .map((team) => (
            <div key={team.team} className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {teamLabels.find((l) => l.team === team.team)?.displayName ||
                  team.team}
              </h2>
              {/* 横方向にランキング順で3人ずつ表示 */}
              {(() => {
                const sortedMembers = team.members.slice().sort((a, b) => {
                  if (a.rank === undefined && b.rank === undefined) return 0;
                  if (a.rank === undefined) return 1;
                  if (b.rank === undefined) return -1;
                  return a.rank - b.rank;
                });
                const rows = [];
                for (let i = 0; i < sortedMembers.length; i += 3) {
                  rows.push(sortedMembers.slice(i, i + 3));
                }
                return rows.map((row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
                  >
                    {row.map((member, idx) => (
                      <PlayerCard
                        key={member.userNo}
                        userId={extractUserIdFromUrl(member.url)}
                        username={member.username || member.userNo}
                        url={member.url}
                        index={rowIdx * 3 + idx}
                      />
                    ))}
                  </div>
                ));
              })()}
            </div>
          ))}
      </div>
    </div>
  );
}
