"use client";

import Image from 'next/image';
import { mappoolConfig } from '@/data/mappool';
import { getBeatmapData } from '@/lib/osuApi';
import { useEffect, useState } from 'react';
import { CACHE_DURATIONS, CACHE_VERSIONS, getFromLocalStorage, saveToLocalStorage } from '@/lib/cacheConfig';

interface Beatmap {
  id: number;
  beatmapset_id: number;
  version: string;
  total_length: number;
  difficulty_rating: number;
  bpm: number;
  cs: number;
  ar: number;
  accuracy: number;
  drain: number;
  artist: string;
  title: string;
  creator: string;
  beatmapset: {
    artist: string;
    title: string;
    creator: string;
  };
}

// URLからbeatmapset_idとbeatmap_idを抽出する関数
function extractIdsFromUrl(url: string): { beatmapset_id: number; beatmap_id: number } {
  const match = url.match(/beatmapsets\/(\d+)#osu\/(\d+)/);
  if (!match) {
    throw new Error(`Invalid beatmap URL format: ${url}`);
  }
  return {
    beatmapset_id: parseInt(match[1], 10),
    beatmap_id: parseInt(match[2], 10)
  };
}

// カテゴリごとにグループ化
function groupByCategory() {
  const groups: Record<string, typeof mappoolConfig> = {};
  for (const map of mappoolConfig) {
    // カテゴリ名を抽出（数字を除去）
    const category = map.mapNo.replace(/\d+$/, '');
    // TBの場合は特別処理
    if (map.mapNo === 'TB') {
      if (!groups['TB']) groups['TB'] = [];
      groups['TB'].push(map);
    } else {
      if (!groups[category]) groups[category] = [];
      groups[category].push(map);
    }
  }
  return groups;
}

export default function MappoolTable() {
  const [beatmaps, setBeatmaps] = useState<Beatmap[]>([]);
  const [visible, setVisible] = useState<boolean[]>([]);

  useEffect(() => {
    async function fetchBeatmaps() {
      const results: Beatmap[] = [];
      for (const map of mappoolConfig) {
        try {
          const { beatmap_id } = extractIdsFromUrl(map.url);
          const beatmapId = beatmap_id.toString();

          // キャッシュからデータを取得
          const cachedData = getFromLocalStorage<Beatmap>(`beatmap_${beatmapId}`, CACHE_VERSIONS.BEATMAP);
          if (cachedData) {
            results.push(cachedData);
            continue;
          }

          // キャッシュになければAPIから取得
          const data = await getBeatmapData(beatmapId);
          // 取得したデータをキャッシュに保存
          saveToLocalStorage(`beatmap_${beatmapId}`, data, CACHE_VERSIONS.BEATMAP);
          results.push(data);
        } catch (e) {
          console.error(`Error fetching beatmap data for ${map.url}:`, e);
          const { beatmap_id, beatmapset_id } = extractIdsFromUrl(map.url);
          results.push({
            id: beatmap_id,
            beatmapset_id: beatmapset_id,
            version: 'Error',
            total_length: 0,
            difficulty_rating: 0,
            bpm: 0,
            cs: 0,
            ar: 0,
            accuracy: 0,
            drain: 0,
            artist: '',
            title: '',
            creator: '',
            beatmapset: {
              artist: '',
              title: '',
              creator: ''
            }
          });
        }
      }
      setBeatmaps(results);
      setVisible(Array(results.length).fill(false));
    }
    fetchBeatmaps();
  }, []);

  // 全データ取得後、順次visibleをtrueにしていく
  useEffect(() => {
    if (beatmaps.length === 0) return;
    beatmaps.forEach((_, idx) => {
      setTimeout(() => {
        setVisible(v => {
          const next = [...v];
          next[idx] = true;
          return next;
        });
      }, idx * 80); // 遅延はお好みで
    });
  }, [beatmaps]);

  // カテゴリごとにグループ化
  const grouped = groupByCategory();

  // カテゴリの表示順
  const categoryOrder = ['NM', 'HD', 'HR', 'DT', 'FM', 'TB'];

  return (
    <main className="min-h-screen bg-[#050813]">
      <div className="container mx-auto px-2 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white animate-fade-in-down">Mappool</h1>
        <div className="space-y-12">
          {categoryOrder.map((category, catIdx) => {
            const maps = grouped[category];
            if (!maps) return null;
            // このカテゴリのグローバルインデックス配列
            const globalIndices = maps.map(map => mappoolConfig.findIndex(m => m.mapNo === map.mapNo));
            // このカテゴリで1つでもvisibleがtrueならテーブル表示、なければローディング
            const anyVisible = globalIndices.some(idx => visible[idx]);
            return (
              <div
                key={category}
                className="animate-fade-in-down"
                style={{ animationDelay: `${catIdx * 120}ms` }}
              >
                <h2 className="text-2xl font-bold mb-4 text-white">{category}</h2>
                <div className="overflow-x-auto rounded-lg min-h-[60px]">
                  {!anyVisible ? (
                    <div className="flex items-center justify-center h-16">
                      <span className="text-white text-lg animate-pulse">loading...</span>
                    </div>
                  ) : (
                    <table className="min-w-full text-sm text-left">
                      <colgroup>
                        <col style={{ width: '6%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '28%' }} />
                        <col style={{ width: '13%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '7%' }} />
                        <col style={{ width: '7%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '6%' }} />
                      </colgroup>
                      <thead className="bg-[#1a1a1a] text-white">
                        <tr>
                          <th className="px-2 py-2">MapNo</th>
                          <th className="px-2 py-2">Banner</th>
                          <th className="px-2 py-2">Artist - Title [Diff]</th>
                          <th className="px-2 py-2">Mapper</th>
                          <th className="px-2 py-2">ID</th>
                          <th className="px-2 py-2">Length</th>
                          <th className="px-2 py-2">SR</th>
                          <th className="px-2 py-2">BPM</th>
                          <th className="px-2 py-2">CS</th>
                          <th className="px-2 py-2">AR</th>
                          <th className="px-2 py-2">OD</th>
                          <th className="px-2 py-2">HP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maps.map((map, idx) => {
                          const globalIdx = mappoolConfig.findIndex(m => m.mapNo === map.mapNo);
                          const beatmap = beatmaps[globalIdx];
                          const rowColor = idx % 2 === 0 ? 'bg-[#222] text-white' : 'bg-[#181c24] text-white';
                          const isVisible = visible[globalIdx];
                          if (!isVisible) return null;
                          return (
                            <tr
                              key={map.mapNo}
                              className={`${rowColor} animate-fade-in-down`}
                            >
                              <td className="px-2 py-1">{map.mapNo}</td>
                              <td className="px-2 py-1">
                                {beatmap ? (
                                  <Image src={`https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/cover.jpg`} alt={beatmap.id?.toString() || ''} width={64} height={36} className="rounded" />
                                ) : ''}
                              </td>
                              <td className="px-2 py-1">{beatmap ? `${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]` : ''}</td>
                              <td className="px-2 py-1">{beatmap ? (beatmap.creator || beatmap.beatmapset.creator) : ''}</td>
                              <td className="px-2 py-1">{beatmap ? beatmap.id : ''}</td>
                              <td className="px-2 py-1">{beatmap ? `${Math.floor(beatmap.total_length / 60)}:${(beatmap.total_length % 60).toString().padStart(2, '0')}` : ''}</td>
                              <td className="px-2 py-1">{beatmap ? beatmap.difficulty_rating?.toFixed(2) : ''}</td>
                              <td className="px-2 py-1">{beatmap ? beatmap.bpm : ''}</td>
                              <td className="px-2 py-1">{beatmap ? beatmap.cs : ''}</td>
                              <td className="px-2 py-1">{beatmap ? beatmap.ar : ''}</td>
                              <td className="px-2 py-1">{beatmap ? beatmap.accuracy : ''}</td>
                              <td className="px-2 py-1">{beatmap ? beatmap.drain : ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
} 