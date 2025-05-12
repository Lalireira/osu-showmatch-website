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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    if (teams.length === 0) return;
    const fetchAllPlayers = async () => {
      setIsLoading(true);
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
              } catch {
                // エラーは無視して続行
              }
            }
          })
        )
      );
      setTeams(updatedTeams);
      setPlayersLoaded(true);
      setIsLoading(false);
    };
    setPlayersLoaded(false);
    fetchAllPlayers();
  }, [teams.length]);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/team-labels')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setTeamLabels(data);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !playersLoaded || isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>
        <div className="flex flex-col items-center justify-center">
          <span className="text-white text-xl font-semibold mb-4 animate-pulse">Loading Now...</span>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
