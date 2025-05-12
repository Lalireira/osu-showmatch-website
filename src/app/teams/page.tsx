'use client';

import { useState, useEffect } from 'react';
import PlayerCard from '@/components/PlayerCard';
import { extractUserIdFromUrl } from '@/lib/utils';

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

// チーム名の表示ラベルマッピング
const teamDisplayNames: Record<string, string> = {
  TeamA: 'TeamA', // 例: 'Red Team'
  TeamB: 'TeamB', // 例: 'Blue Team'
  // 必要に応じて追加・編集
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/admin/teams-config');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        setTeams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    if (teams.length === 0) return;
    const fetchAllPlayers = async () => {
      const updatedTeams = [...teams];
      await Promise.all(
        updatedTeams.flatMap(team =>
          team.members.map(async (member) => {
            if (!member.username) {
              try {
                const userId = extractUserIdFromUrl(member.url);
                const response = await fetch(`/api/osu/user/${userId}`);
                if (!response.ok) return;
                const data = await response.json();
                member.username = data.username;
                member.pp = data.pp;
                member.rank = data.rank;
                member.country = data.country;
                member.countryRank = data.countryRank;
                member.avatarUrl = data.avatarUrl;
              } catch (error) {
                // エラーは無視して続行
              }
            }
          })
        )
      );
      setTeams(updatedTeams);
      setPlayersLoaded(true);
    };
    setPlayersLoaded(false);
    fetchAllPlayers();
  }, [teams.length]);

  useEffect(() => {
    fetch('/api/admin/team-labels')
      .then(res => res.json())
      .then(data => setTeamLabels(data));
  }, []);

  if (loading || !playersLoaded) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="mb-8">
              <div className="h-6 w-32 bg-gray-700 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="bg-gray-800 rounded-lg p-4 shadow-lg animate-pulse h-32" />
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
          .sort((a, b) => a.team.localeCompare(b.team, undefined, { numeric: true }))
          .map((team) => (
            <div key={team.team} className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{teamLabels.find(l => l.team === team.team)?.displayName || team.team}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {team.members
                  .slice()
                  .sort((a, b) => {
                    if (a.rank === undefined && b.rank === undefined) return 0;
                    if (a.rank === undefined) return 1;
                    if (b.rank === undefined) return -1;
                    return a.rank - b.rank; // rank昇順（ランキングが高い順）
                  })
                  .map((member, idx) => (
                    <PlayerCard
                      key={member.userNo}
                      userId={extractUserIdFromUrl(member.url)}
                      username={member.username || member.userNo}
                      url={member.url}
                      index={idx}
                    />
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
