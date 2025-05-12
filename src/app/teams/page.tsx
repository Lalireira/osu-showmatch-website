'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { extractUserIdFromUrl } from '@/lib/utils';
import PlayerCard from '@/components/PlayerCard';

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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const fetchPlayerData = async () => {
      const updatedTeams = [...teams];
      let hasChanges = false;

      for (const team of updatedTeams) {
        for (const member of team.members) {
          if (!member.username) {
            try {
              const userId = extractUserIdFromUrl(member.url);
              const response = await fetch(`/api/osu/user/${userId}`);
              if (!response.ok) continue;
              const data = await response.json();

              member.username = data.username;
              member.pp = data.pp;
              member.rank = data.rank;
              member.country = data.country;
              member.countryRank = data.countryRank;
              member.avatarUrl = data.avatarUrl;
              hasChanges = true;
            } catch (error) {
              console.error('Failed to fetch player data:', error);
            }
          }
        }
      }

      if (hasChanges) {
        setTeams(updatedTeams);
      }
    };

    if (teams.length > 0) {
      fetchPlayerData();
    }
  }, [teams]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 shadow-lg animate-pulse h-32" />
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
        {teams.map((team) => (
          <div key={team.team} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{team.team}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {team.members.map((member, idx) => (
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
