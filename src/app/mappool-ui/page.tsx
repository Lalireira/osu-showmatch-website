"use client";

import Image from 'next/image';
import { mappoolConfig } from '@/data/mappool';
import { getBeatmapData } from '@/lib/osuApi';
import { useEffect, useState } from 'react';
import { CACHE_DURATIONS, CACHE_VERSIONS, getFromLocalStorage, saveToLocalStorage } from '@/lib/cacheConfig';
import { extractIdsFromUrl } from '@/lib/utils';

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

// テーブルセルのカテゴリごとのスタイルマップ
const categoryStyles: Record<string, { bg: string, text: string }> = {
  NM: { bg: 'bg-[#222]', text: 'text-[#d2d2d2]' },
  HD: { bg: 'bg-[#26261c]', text: 'text-[#d2d2d2]' },
  HR: { bg: 'bg-[#261c1c]', text: 'text-[#d2d2d2]' },
  DT: { bg: 'bg-[#221c26]', text: 'text-[#d2d2d2]' },
  FM: { bg: 'bg-[#1d261c]', text: 'text-[#d2d2d2]' },
  TB: { bg: 'bg-[#222]', text: 'text-[#d2d2d2]' },
};

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
        <div className="space-y-4">
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
                      {/* Column widths: MapNo(6%), Banner(10%), Artist-Title(28%), Mapper(10%), ID(8%), Length(7%), SR(5%), BPM(5%), CS/AR/OD/HP(4% each) */}
                      <colgroup>
                        <col style={{ width: '6%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '28%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '7%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '4%' }} />
                        <col style={{ width: '4%' }} />
                        <col style={{ width: '4%' }} />
                        <col style={{ width: '4%' }} />
                      </colgroup>
                      <thead className="bg-[#1a1a1a] text-white">
                        <tr>
                          <th className="px-2 py-2 font-bold">MapNo</th>
                          <th className="px-2 py-2 font-bold">Banner</th>
                          <th className="px-2 py-2 font-bold">Artist - Title [Diff]</th>
                          <th className="px-2 py-2 font-bold">Mapper</th>
                          <th className="px-2 py-2 font-bold">ID</th>
                          <th className="px-2 py-2 font-bold">Length</th>
                          <th className="px-2 py-2 font-bold">SR</th>
                          <th className="px-2 py-2 font-bold">BPM</th>
                          <th className="px-2 py-2 font-bold">CS</th>
                          <th className="px-2 py-2 font-bold">AR</th>
                          <th className="px-2 py-2 font-bold">OD</th>
                          <th className="px-2 py-2 font-bold">HP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maps.map((map, idx) => {
                          const globalIdx = mappoolConfig.findIndex(m => m.mapNo === map.mapNo);
                          const beatmap = beatmaps[globalIdx];
                          const isVisible = visible[globalIdx];
                          if (!isVisible) return null;
                          const style = categoryStyles[category] || { bg: 'bg-[#222]', text: 'text-white' };
                          return (
                            <tr
                              key={map.mapNo}
                              className={`${style.bg} ${style.text} animate-fade-in-down`}
                            >
                              <td className="px-2 py-1 font-semibold">{map.mapNo}</td>
                              <td className="px-2 py-1">
                                {beatmap ? (
                                  <Image
                                    src={`https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/cover.jpg`}
                                    alt={`${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title}`}
                                    width={64}
                                    height={36}
                                    className="rounded"
                                    loading="lazy"
                                    quality={75}
                                    priority={false}
                                  />
                                ) : ''}
                              </td>
                              <td className="px-2 py-1 font-normal">{beatmap ? `${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]` : ''}</td>
                              <td className="px-2 py-1 font-normal">{beatmap ? (beatmap.creator || beatmap.beatmapset.creator) : ''}</td>
                              <td className="px-2 py-1 font-normal">{beatmap ? beatmap.id : ''}</td>
                              <td className="px-2 py-1 font-normal">{beatmap ? `${Math.floor(beatmap.total_length / 60)}:${(beatmap.total_length % 60).toString().padStart(2, '0')}` : ''}</td>
                              <td className="px-2 py-1 font-normal">{beatmap ? beatmap.difficulty_rating?.toFixed(2) : ''}</td>
                              <td className="px-2 py-1 font-normal">{beatmap ? beatmap.bpm : ''}</td>
                              <td className="px-2 py-1 font-normal">{beatmap ? beatmap.cs : ''}</td>
                              <td className="px-2 py-1 font-normal">{beatmap ? beatmap.ar : ''}</td>
                              <td className="px-2 py-1 font-normal">{beatmap ? beatmap.accuracy : ''}</td>
                              <td className="px-2 py-1 font-normal">{beatmap ? beatmap.drain : ''}</td>
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