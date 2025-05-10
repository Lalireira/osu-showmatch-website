import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getUserData } from '@/lib/osuApi';

interface PlayerCardProps {
  userId: number;
  username: string;
  index?: number;
}

interface UserData {
  username: string;
  avatar_url: string;
  statistics?: {
    pp: number;
    accuracy: number;
    global_rank: number;
    country_rank: number;
    play_count: number;
  } | null;
  comment: string;
}

export default function PlayerCard({ userId, username, index = 0 }: PlayerCardProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/osu/user/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        setUserData(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg animate-fade-in-down" style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg animate-fade-in-down" style={{ animationDelay: `${index * 0.1}s` }}>
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

  const formatPlayCount = (count: number | undefined | null) => {
    if (count === undefined || count === null) return 'N/A';
    return count.toLocaleString();
  };

  return (
    <div className="bg-[#2a2a2a] rounded-xl p-4 hover:transform hover:scale-105 transition-transform duration-300 cursor-pointer animate-fade-in-down relative overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Background Avatar */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src={userData.avatar_url}
          alt=""
          fill
          className="object-cover"
        />
      </div>
      
      <div className="flex items-start gap-4 relative">
        {/* Left side: Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
          <Image
            src={userData.avatar_url}
            alt={`${userData.username}'s avatar`}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>

        {/* Center: Username, Stats and Comment */}
        <div className="flex-grow min-w-0 max-w-[400px]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{userData.username}</h2>
          </div>
          <div className="flex gap-6 mt-2">
            <div>
              <span className="text-xs text-gray-500">Performance</span>
              <p className="text-sm text-gray-400">{formatNumber(userData.statistics?.pp)}pp</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Accuracy</span>
              <p className="text-sm text-gray-400">{formatAccuracy(userData.statistics?.accuracy)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Playcount</span>
              <p className="text-sm text-gray-400">{formatPlayCount(userData.statistics?.play_count)}</p>
            </div>
          </div>
          {userData.comment && (
            <div className="flex items-center gap-1 mt-2">
              <i className="fas fa-comment text-gray-500 text-xs"></i>
              <span className="text-sm text-gray-400 truncate">{userData.comment}</span>
            </div>
          )}
        </div>

        {/* Right side: Rank */}
        <div className="flex flex-col justify-end border-l border-gray-700 pl-6 flex-shrink-0">
          <div className="text-right">
            <p className="font-bold text-[#79b0ea]">#{formatNumber(userData.statistics?.global_rank)}</p>
            <p className="text-sm text-gray-400">#{formatNumber(userData.statistics?.country_rank)}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 