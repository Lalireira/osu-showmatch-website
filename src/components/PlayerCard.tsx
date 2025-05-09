import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getUserData } from '@/lib/osuApi';

interface PlayerCardProps {
  userId: number;
  username: string;
}

interface UserData {
  username: string;
  avatar_url: string;
  country_code: string;
  statistics?: {
    pp: number;
    accuracy: number;
    global_rank: number;
    country_rank: number;
  } | null;
}

export default function PlayerCard({ userId, username }: PlayerCardProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserData(userId);
        setUserData(data);
      } catch (err: any) {
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load player data');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-[#2a2a2a] p-3 rounded-lg animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-16 aspect-square bg-gray-700 rounded-lg"></div>
          <div className="flex-grow space-y-2">
            <div className="h-5 bg-gray-700 rounded w-24"></div>
            <div className="h-4 bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="bg-[#2a2a2a] p-3 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-16 aspect-square bg-gray-700 rounded-lg"></div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold mb-1">{username}</h3>
            <p className="text-sm text-red-400">Error: {error || 'Failed to load data'}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return 'N/A';
    return Math.floor(num).toLocaleString();
  };

  const formatAccuracy = (acc: number | undefined | null) => {
    if (acc === undefined || acc === null) return 'N/A';
    return acc.toFixed(2) + '%';
  };

  return (
    <div className="bg-[#2a2a2a] p-3 rounded-lg relative overflow-hidden">
      {/* Background Avatar */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <Image
          src={userData.avatar_url}
          alt=""
          fill
          className="object-cover"
        />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          {/* Username and Country */}
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold truncate">{userData.username}</h3>
            <span className="text-sm text-gray-400">[{userData.country_code}]</span>
          </div>
          
          {/* Global Rank and Country Rank */}
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold">#{formatNumber(userData.statistics?.global_rank)}</span>
            <span className="text-sm text-gray-400">({userData.country_code} #{formatNumber(userData.statistics?.country_rank)})</span>
          </div>
        </div>

        {/* PP and Accuracy */}
        <div className="flex flex-col gap-1 text-sm text-gray-400 mt-2">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Performance</span>
            <span className="performance">{formatNumber(userData.statistics?.pp)}pp</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Accuracy</span>
            <span className="accuracy">{formatAccuracy(userData.statistics?.accuracy)}</span>
          </div>
        </div>

        {/* Player Avatar */}
        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700">
          <Image
            src={userData.avatar_url}
            alt={`${userData.username}'s avatar`}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
} 