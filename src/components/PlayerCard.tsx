import Image from "next/image";
import { useEffect, useState } from "react";

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

export default function PlayerCard({
  userId,
  username,
  url,
  index = 0,
  comment,
  userData: providedUserData,
}: PlayerCardProps) {
  console.log(`PlayerCard for user ${userId} (${username}):`, {
    providedUserData,
  });

  const [userData, setUserData] = useState<UserData | null>(
    providedUserData || null
  );
  const [isLoading, setIsLoading] = useState(!providedUserData);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントマウント時の初期データをログ出力
  useEffect(() => {
    console.log(`PlayerCard mounted for user ${userId} with:`, {
      providedUserData,
      currentUserData: userData,
      isLoading,
    });
  }, [userId, providedUserData, userData, isLoading]);

  useEffect(() => {
    if (providedUserData) {
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/osu/user/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }
        const data = await response.json();

        const formattedData: UserData = {
          username: data.username,
          avatar_url: data.avatar_url,
          country: data.country || data.country_code || "",
          statistics: data.statistics,
        };

        setUserData(formattedData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch user data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, providedUserData]);

  if (isLoading) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div
          className="bg-[#2a2a2a] rounded-xl p-4 h-[120px] animate-fade-in-down"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
            <div className="flex-grow min-w-0 max-w-[400px]">
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
              <div className="flex gap-6 mt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 bg-gray-700 rounded w-16 mb-1 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-12 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-end border-l border-gray-700 pl-6 flex-shrink-0">
              <div className="h-5 bg-gray-700 rounded w-16 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      </a>
    );
  }

  if (error || !userData) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div
          className="bg-[#2a2a2a] rounded-xl p-4 h-[120px] animate-fade-in-down"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-700"></div>
            <div className="flex-grow min-w-0 max-w-[400px]">
              <h3 className="text-lg font-semibold mb-1">{username}</h3>
              <p className="text-sm text-red-400">
                Error: {error || "Failed to load user data"}
              </p>
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
        <div
          className="bg-[#2a2a2a] rounded-xl p-4 h-[120px] animate-fade-in-down"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-700"></div>
            <div className="flex-grow min-w-0 max-w-[400px]">
              <h3 className="text-lg font-semibold mb-1">{username}</h3>
              <p className="text-sm text-red-400">
                Error: Invalid user data (missing username)
              </p>
              <p className="text-xs text-gray-400">User ID: {userId}</p>
            </div>
          </div>
        </div>
      </a>
    );
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return "N/A";
    return Math.floor(num).toLocaleString();
  };

  const formatAccuracy = (acc: number | undefined | null) => {
    if (acc === undefined || acc === null) return "N/A";
    return acc.toFixed(2) + "%";
  };

  const formatPlayCount = (count: number | undefined | null) => {
    if (count === undefined || count === null) return "N/A";
    return count.toLocaleString();
  };

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <div
        className="bg-[#2a2a2a] rounded-xl p-4 h-[120px] hover:transform hover:scale-105 transition-transform duration-300 cursor-pointer animate-fade-in-down relative overflow-hidden"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Background Avatar */}
        <div className="absolute inset-0 opacity-5">
          <Image
            src={
              userData.avatar_url ||
              "https://osu.ppy.sh/images/layout/avatar-guest.png"
            }
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        </div>

        <div className="flex items-start gap-4 relative">
          {/* Left side: Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
            <Image
              src={
                userData.avatar_url ||
                "https://osu.ppy.sh/images/layout/avatar-guest.png"
              }
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
                {userData.username === "undefined" ||
                userData.username === undefined
                  ? username || `Player ${userId}`
                  : userData.username}
              </h2>
            </div>
            <div className="flex gap-6 mt-2 items-end">
              <div>
                <span className="text-xs text-gray-500 font-normal">
                  Performance
                </span>
                <p className="text-sm text-gray-400 font-normal">
                  {formatNumber(userData.statistics?.pp)}pp
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-normal">
                  Accuracy
                </span>
                <p className="text-sm text-gray-400 font-normal">
                  {formatAccuracy(userData.statistics?.accuracy)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-normal">
                  Playcount
                </span>
                <p className="text-sm text-gray-400 font-normal">
                  {formatPlayCount(userData.statistics?.play_count)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-normal">
                  Country
                </span>
                <p className="text-sm text-gray-400 font-normal">
                  {userData.country}
                </p>
              </div>
            </div>
            {comment && (
              <div className="flex items-center gap-1 mt-2">
                <i className="fas fa-comment text-gray-500 text-xs"></i>
                <span className="text-sm text-gray-400 truncate">
                  {comment}
                </span>
              </div>
            )}
          </div>

          {/* Right side: Rank */}
          <div className="flex flex-col justify-end border-l border-gray-700 pl-6 flex-shrink-0">
            <div className="text-right">
              <p className="font-bold text-[#79b0ea]">
                #{formatNumber(userData.statistics?.global_rank)}
              </p>
              <p className="text-sm text-gray-400 font-normal">
                #{formatNumber(userData.statistics?.country_rank)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
