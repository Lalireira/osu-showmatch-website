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
        console.log('User data:', data);
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
      <div className="bg-[#2a2a2a] p-6 rounded-lg animate-pulse">
        <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-700 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-lg">
        <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
        <h3 className="text-xl font-semibold mb-2">{username}</h3>
        <div className="space-y-2 text-gray-400">
          <p className="text-red-400">Error: {error || 'Failed to load data'}</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="bg-[#2a2a2a] p-4 rounded-lg">
      <div className="flex gap-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={userData.avatar_url}
            alt={`${userData.username}'s avatar`}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-1">{userData.username}</h3>
          <div className="space-y-1 text-sm text-gray-400">
            <p>Country: {userData.country_code}</p>
            {userData.statistics ? (
              <>
                <p>PP: {formatNumber(userData.statistics.pp)}</p>
                <p>Global Rank: #{formatNumber(userData.statistics.global_rank)}</p>
                <p>National Rank: #{formatNumber(userData.statistics.country_rank)}</p>
              </>
            ) : (
              <p>Statistics not available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 