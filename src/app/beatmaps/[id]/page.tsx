'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BeatmapData {
  id: number;
  beatmapset_id: number;
  mode: string;
  mode_int: number;
  status: string;
  total_length: number;
  version: string;
  difficulty_rating: number;
  count_circles: number;
  count_sliders: number;
  count_spinners: number;
  max_combo: number;
  user_id: number;
  accuracy: number;
  ar: number;
  cs: number;
  drain: number;
  bpm: number;
  convert: boolean;
  deleted_at: string | null;
  hit_length: number;
  is_scoreable: boolean;
  last_updated: string;
  passcount: number;
  playcount: number;
  ranked: number;
  url: string;
  beatmapset: {
    id: number;
    artist: string;
    artist_unicode: string;
    covers: {
      cover: string;
      'cover@2x': string;
      card: string;
      'card@2x': string;
      list: string;
      'list@2x': string;
      slimcover: string;
      'slimcover@2x': string;
    };
    creator: string;
    favourite_count: number;
    play_count: number;
    preview_url: string;
    source: string;
    status: string;
    title: string;
    title_unicode: string;
    user_id: number;
    video: boolean;
  };
}

// キャッシュの型定義
interface BeatmapCacheData {
  data: BeatmapData;
  timestamp: number;
}

// キャッシュの有効期限（24時間）
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// キャッシュからデータを取得する関数
function getFromCache(beatmapId: number): BeatmapData | null {
  if (typeof window === 'undefined') return null;

  const cached = localStorage.getItem(`beatmap_${beatmapId}`);
  if (!cached) return null;

  const { data, timestamp }: BeatmapCacheData = JSON.parse(cached);
  const now = Date.now();

  // キャッシュが有効期限内かチェック
  if (now - timestamp < CACHE_DURATION) {
    return data;
  }

  // 期限切れの場合はキャッシュを削除
  localStorage.removeItem(`beatmap_${beatmapId}`);
  return null;
}

// データをキャッシュに保存する関数
function saveToCache(beatmapId: number, data: BeatmapData): void {
  if (typeof window === 'undefined') return;

  const cacheData: BeatmapCacheData = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(`beatmap_${beatmapId}`, JSON.stringify(cacheData));
}

export default function BeatmapPage() {
  const params = useParams();
  const [beatmapData, setBeatmapData] = useState<BeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBeatmapData = async () => {
      try {
        const beatmapId = params.id as string;

        // キャッシュからデータを取得
        const cachedData = getFromCache(parseInt(beatmapId));
        if (cachedData) {
          setBeatmapData(cachedData);
          setIsLoading(false);
          return;
        }

        // キャッシュになければAPIから取得
        const response = await fetch(`/api/osu/beatmap/${beatmapId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch beatmap data: ${response.statusText}`);
        }
        const data = await response.json();

        // 取得したデータをキャッシュに保存
        saveToCache(parseInt(beatmapId), data);
        setBeatmapData(data);
      } catch (err) {
        console.error('Error fetching beatmap data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch beatmap data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBeatmapData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !beatmapData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
          <p className="text-red-200">{error || 'Failed to load beatmap data'}</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/beatmaps" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Beatmaps
          </Link>
          <h1 className="text-3xl font-bold mb-2">{beatmapData.beatmapset.title}</h1>
          <p className="text-xl text-gray-400">{beatmapData.beatmapset.artist}</p>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 左カラム: カバー画像 */}
          <div className="md:col-span-1">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={beatmapData.beatmapset.covers['cover@2x']}
                alt={beatmapData.beatmapset.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* 右カラム: 詳細情報 */}
          <div className="md:col-span-2">
            <div className="bg-[#2a2a2a] rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Difficulty Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Difficulty</p>
                  <p className="text-xl font-semibold">{beatmapData.version}</p>
                </div>
                <div>
                  <p className="text-gray-400">Star Rating</p>
                  <p className="text-xl font-semibold">{beatmapData.difficulty_rating.toFixed(2)}★</p>
                </div>
                <div>
                  <p className="text-gray-400">Length</p>
                  <p className="text-xl font-semibold">{formatTime(beatmapData.total_length)}</p>
                </div>
                <div>
                  <p className="text-gray-400">BPM</p>
                  <p className="text-xl font-semibold">{beatmapData.bpm}</p>
                </div>
                <div>
                  <p className="text-gray-400">Circles</p>
                  <p className="text-xl font-semibold">{formatNumber(beatmapData.count_circles)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Sliders</p>
                  <p className="text-xl font-semibold">{formatNumber(beatmapData.count_sliders)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Spinners</p>
                  <p className="text-xl font-semibold">{formatNumber(beatmapData.count_spinners)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Max Combo</p>
                  <p className="text-xl font-semibold">{formatNumber(beatmapData.max_combo)}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold mb-2">Difficulty Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Approach Rate</p>
                    <p className="text-xl font-semibold">{beatmapData.ar}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Circle Size</p>
                    <p className="text-xl font-semibold">{beatmapData.cs}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">HP Drain</p>
                    <p className="text-xl font-semibold">{beatmapData.drain}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Accuracy</p>
                    <p className="text-xl font-semibold">{beatmapData.accuracy}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold mb-2">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Play Count</p>
                    <p className="text-xl font-semibold">{formatNumber(beatmapData.playcount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pass Count</p>
                    <p className="text-xl font-semibold">{formatNumber(beatmapData.passcount)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={beatmapData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  View on osu! website
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
