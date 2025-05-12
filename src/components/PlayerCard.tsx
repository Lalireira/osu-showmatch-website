import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PlayerCardProps {
  userId: number;
  username: string;
  url: string;
  index?: number;
  comment?: string;
  userData?: UserData | null;
}

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

// キャッシュの型定義
interface UserCacheData {
  data: UserData;
  timestamp: number;
}

// キャッシュの有効期限（24時間）
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// キャッシュからデータを取得する関数
function getFromCache(userId: number): UserData | null {
  if (typeof window === 'undefined') return null;

  const cached = localStorage.getItem(`user_${userId}`);
  if (!cached) return null;

  const { data, timestamp }: UserCacheData = JSON.parse(cached);
  const now = Date.now();

  // キャッシュが有効期限内かチェック
  if (now - timestamp < CACHE_DURATION) {
    return data;
  }

  // 期限切れの場合はキャッシュを削除
  localStorage.removeItem(`user_${userId}`);
  return null;
}

// データをキャッシュに保存する関数
function saveToCache(userId: number, data: UserData): void {
  if (typeof window === 'undefined') return;

  const cacheData: UserCacheData = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(`user_${userId}`, JSON.stringify(cacheData));
}

export default function PlayerCard({ userId, username, url, index = 0, comment, userData: providedUserData }: PlayerCardProps) {
  console.log(`PlayerCard for user ${userId} (${username}):`, { providedUserData });

  const [userData, setUserData] = useState<UserData | null>(providedUserData || null);
  const [isLoading, setIsLoading] = useState(!providedUserData);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントマウント時の初期データをログ出力
  useEffect(() => {
    console.log(`PlayerCard mounted for user ${userId} with:`, {
      providedUserData,
      currentUserData: userData,
      isLoading
    });
  }, [userId, providedUserData, userData, isLoading]);

  useEffect(() => {
    // If userData is provided externally, don't fetch
    if (providedUserData) {
      console.log(`Using provided userData for user ${userId}:`, providedUserData);
      return;
    }

    const fetchUserData = async () => {
      try {
        // キャッシュになければAPIから取得
        const response = await fetch(`/api/osu/user/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        const data = await response.json();

        console.log(`API Response for user ${userId}:`, data);

        // API のレスポンス形式に合わせてデータを整形
        const formattedData: UserData = {
          username: data.username,
          avatar_url: data.avatar_url,
          country: data.country || data.country_code || '', // country または country_code を使用
          statistics: data.statistics
        };

        console.log(`Formatted data for user ${userId}:`, formattedData);
        setUserData(formattedData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, providedUserData]);

  if (isLoading) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg animate-fade-in-down" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </a>
    );
  }

  if (error || !userData) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg animate-fade-in-down" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="flex items-start gap-3">
            <div className="w-16 aspect-square bg-gray-700 rounded-lg"></div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold mb-1">{username}</h3>
              <p className="text-sm text-red-400">Error: {error || 'Failed to load user data'}</p>
              <p className="text-xs text-gray-400">User ID: {userId}</p>
            </div>
          </div>
        </div>
      </a>
    );
  }

  // データ構造の検証
  if (!userData.username) {
    console.error(`Missing username for user ${userId}:`, userData);
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg animate-fade-in-down" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="flex items-start gap-3">
            <div className="w-16 aspect-square bg-gray-700 rounded-lg"></div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold mb-1">{username}</h3>
              <p className="text-sm text-red-400">Error: Invalid user data (missing username)</p>
              <p className="text-xs text-gray-400">User ID: {userId}</p>
            </div>
          </div>
        </div>
      </a>
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
    <a href={url} target="_blank" rel="noopener noreferrer">
      <div className="bg-[#2a2a2a] rounded-xl p-4 hover:transform hover:scale-105 transition-transform duration-300 cursor-pointer animate-fade-in-down relative overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
        {/* Background Avatar */}
        <div className="absolute inset-0 opacity-5">
          <Image
            src={userData.avatar_url || 'https://osu.ppy.sh/images/layout/avatar-guest.png'}
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="flex items-start gap-4 relative">
          {/* Left side: Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
            <Image
              src={userData.avatar_url || 'https://osu.ppy.sh/images/layout/avatar-guest.png'}
              alt={`${userData.username || username}'s avatar`}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>

          {/* Center: Username, Stats and Comment */}
          <div className="flex-grow min-w-0 max-w-[400px]">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">
                {userData.username === 'undefined' || userData.username === undefined ?
                  (username || `Player ${userId}`) :
                  userData.username}
              </h2>
            </div>
            <div className="flex gap-6 mt-2 items-end">
              <div>
                <span className="text-xs text-gray-500 font-normal">Performance</span>
                <p className="text-sm text-gray-400 font-normal">{formatNumber(userData.statistics?.pp)}pp</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-normal">Accuracy</span>
                <p className="text-sm text-gray-400 font-normal">{formatAccuracy(userData.statistics?.accuracy)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-normal">Playcount</span>
                <p className="text-sm text-gray-400 font-normal">{formatPlayCount(userData.statistics?.play_count)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-normal">Country</span>
                <p className="text-sm text-gray-400 font-normal">{userData.country}</p>
              </div>
            </div>
            {comment && (
              <div className="flex items-center gap-1 mt-2">
                <i className="fas fa-comment text-gray-500 text-xs"></i>
                <span className="text-sm text-gray-400 truncate">{comment}</span>
              </div>
            )}
          </div>

          {/* Right side: Rank */}
          <div className="flex flex-col justify-end border-l border-gray-700 pl-6 flex-shrink-0">
            <div className="text-right">
              <p className="font-bold text-[#79b0ea]">#{formatNumber(userData.statistics?.global_rank)}</p>
              <p className="text-sm text-gray-400 font-normal">#{formatNumber(userData.statistics?.country_rank)}</p>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
