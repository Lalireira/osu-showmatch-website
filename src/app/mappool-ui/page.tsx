"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { extractIdsFromUrl } from '@/lib/utils';

interface MapConfig {
  id: number;
  mapNo: string;
  url: string;
}

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
function groupByCategory(mappoolConfig: MapConfig[]) {
  const groups: Record<string, MapConfig[]> = {};
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

// テーブルセルのスタイル設定
const tableCellStyles = {
  default: 'px-3 py-2',
  header: 'px-3 py-2 font-bold text-white uppercase tracking-wider text-base',
  mapNo: 'px-3 py-2 font-bold text-center text-base',
  title: 'px-3 py-2 font-medium max-w-xs break-words text-base',
  mapper: 'px-3 py-2 font-medium break-words text-base',
  id: 'px-3 py-2 font-medium text-base',
  length: 'px-3 py-2 font-medium text-base',
  stats: 'px-3 py-2 font-medium text-base',
  link: 'hover:text-[#79b0ea] transition-colors duration-200'
};

// カテゴリごとのスタイルマップ
const categoryStyles: Record<string, { bg: string, text: string, header: string, titleBg: string }> = {
  NM: {
    bg: 'bg-[#1a1a22]',
    text: 'text-[#f0f0f0]',
    header: 'bg-[#222228]',
    titleBg: 'bg-[#15151d]'
  },
  HD: {
    bg: 'bg-[#22220e]',
    text: 'text-[#f0f0f0]',
    header: 'bg-[#2a2a14]',
    titleBg: 'bg-[#1a1a08]'
  },
  HR: {
    bg: 'bg-[#220e0e]',
    text: 'text-[#f0f0f0]',
    header: 'bg-[#2a1414]',
    titleBg: 'bg-[#1a0808]'
  },
  DT: {
    bg: 'bg-[#1a0e22]',
    text: 'text-[#f0f0f0]',
    header: 'bg-[#22142a]',
    titleBg: 'bg-[#15081a]'
  },
  FM: {
    bg: 'bg-[#0e220e]',
    text: 'text-[#f0f0f0]',
    header: 'bg-[#142a14]',
    titleBg: 'bg-[#081a08]'
  },
  TB: {
    bg: 'bg-[#1a1a22]',
    text: 'text-[#f0f0f0]',
    header: 'bg-[#222228]',
    titleBg: 'bg-[#15151d]'
  },
};

export default function MappoolTable() {
  const [maps, setMaps] = useState<MapConfig[]>([]);
  const [beatmaps, setBeatmaps] = useState<Beatmap[]>([]);
  const [visible, setVisible] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMaps() {
      const response = await fetch('/api/admin/mappool-config');
      if (!response.ok) return;
      const data = await response.json();
      setMaps(data);
    }
    fetchMaps();
  }, []);

  useEffect(() => {
    async function fetchBeatmaps() {
      if (maps.length === 0) return;
      setIsLoading(true);
      const results: Beatmap[] = [];
      const promises = maps.map(async (map) => {
        try {
          const { beatmap_id } = extractIdsFromUrl(map.url);
          const beatmapId = beatmap_id.toString();
          const response = await fetch(`/api/osu/beatmap/${beatmapId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch beatmap data');
          }
          const data = await response.json();
          return {
            id: data.id,
            beatmapset_id: data.beatmapset_id,
            version: data.version,
            total_length: data.total_length,
            difficulty_rating: data.difficulty_rating,
            bpm: data.bpm,
            cs: data.cs,
            ar: data.ar,
            accuracy: data.accuracy,
            drain: data.drain,
            artist: data.beatmapset?.artist || data.artist,
            title: data.beatmapset?.title || data.title,
            creator: data.beatmapset?.creator || data.creator,
            beatmapset: {
              artist: data.beatmapset?.artist || data.artist,
              title: data.beatmapset?.title || data.title,
              creator: data.beatmapset?.creator || data.creator
            }
          };
        } catch (e) {
          console.error(`Error fetching beatmap data for ${map.url}:`, e);
          const { beatmap_id, beatmapset_id } = extractIdsFromUrl(map.url);
          return {
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
          };
        }
      });

      const beatmapResults = await Promise.all(promises);
      setBeatmaps(beatmapResults);
      setVisible(Array(beatmapResults.length).fill(false));
      setIsLoading(false);
    }
    fetchBeatmaps();
  }, [maps]);

  useEffect(() => {
    if (beatmaps.length === 0 || isLoading) return;

    // カテゴリごとにグループ化
    const grouped = groupByCategory(maps);
    const categoryOrder = ['NM', 'HD', 'HR', 'DT', 'FM', 'TB'];

    // 各カテゴリ内のマップを順番に表示
    let currentIndex = 0;
    categoryOrder.forEach((category) => {
      const mapsInCategory = grouped[category] || [];
      mapsInCategory.forEach((map) => {
        const mapIndex = maps.findIndex(m => m.mapNo === map.mapNo);
        setTimeout(() => {
          setVisible(v => {
            const next = [...v];
            next[mapIndex] = true;
            return next;
          });
        }, currentIndex * 100);
        currentIndex++;
      });
    });
  }, [beatmaps, isLoading, maps]);

  // 並び順を保証するためにmapNoでソート
  const sortedMaps = [...maps].sort((a, b) => a.mapNo.localeCompare(b.mapNo, undefined, { numeric: true }));
  const grouped = groupByCategory(sortedMaps);
  const categoryOrder = ['NM', 'HD', 'HR', 'DT', 'FM', 'TB'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#030408] to-[#050810] font-sans overflow-hidden">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-white animate-fade-in-down tracking-wider" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
          Mappool
        </h1>
        <div className="space-y-8">
          {categoryOrder.map((category, catIdx) => {
            const mapsInCategory = grouped[category];
            if (!mapsInCategory) return null;
            const globalIndices = mapsInCategory.map(map => maps.findIndex(m => m.mapNo === map.mapNo));
            const anyVisible = globalIndices.some(idx => visible[idx]);
            return (
              <div
                key={category}
                className="animate-fade-in-down rounded-xl overflow-hidden shadow-2xl"
                style={{
                  animationDelay: `${catIdx * 150}ms`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  background: 'rgba(10, 10, 15, 0.7)'
                }}
              >
                <h2 className={`text-2xl font-bold p-4 text-white ${categoryStyles[category].titleBg}`}>{category}</h2>
                <div className="overflow-x-hidden overflow-y-hidden min-h-[60px]">
                  {!anyVisible ? (
                    <div className="flex items-center justify-center h-20">
                      <span className="text-white text-lg animate-pulse">loading...</span>
                    </div>
                  ) : (
                    <table className="min-w-full text-sm text-left">
                      <colgroup>
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '6%' }} />
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
                      <thead className={`${categoryStyles[category].header} text-white uppercase tracking-wider`}>
                        <tr>
                          <th className={tableCellStyles.header}>MapNo</th>
                          <th className={tableCellStyles.header}>Banner</th>
                          <th className={tableCellStyles.header}>Artist - Title [Diff]</th>
                          <th className={tableCellStyles.header}>Mapper</th>
                          <th className={tableCellStyles.header}>ID</th>
                          <th className={tableCellStyles.header}>Length</th>
                          <th className={tableCellStyles.header}>SR</th>
                          <th className={tableCellStyles.header}>BPM</th>
                          <th className={tableCellStyles.header}>CS</th>
                          <th className={tableCellStyles.header}>AR</th>
                          <th className={tableCellStyles.header}>OD</th>
                          <th className={tableCellStyles.header}>HP</th>
                        </tr>
                      </thead>
                      <tbody className="overflow-visible">
                        {mapsInCategory.map((map, idx) => {
                          const globalIdx = maps.findIndex(m => m.mapNo === map.mapNo);
                          const beatmap = beatmaps[globalIdx];
                          const isVisible = visible[globalIdx];
                          if (!isVisible) return null;
                          const style = categoryStyles[category] || {
                            bg: 'bg-[#1a1a22]',
                            text: 'text-[#f0f0f0]',
                            header: 'bg-[#222228]',
                            titleBg: 'bg-[#15151d]'
                          };
                          return (
                            <tr
                              key={map.mapNo}
                              className={`${style.bg} ${style.text} hover:bg-[#181928] hover:scale-102 shadow-md rounded-xl relative overflow-hidden transition-transform duration-200 cursor-pointer`}
                              style={{
                                animation: 'fadeIn 0.3s ease-in-out forwards',
                                animationDelay: `${idx * 80}ms`,
                                opacity: 0,
                                height: '30px'
                              }}
                            >
                              <td className={tableCellStyles.mapNo}>{map.mapNo}</td>
                              <td className={tableCellStyles.default}>
                                <div className="relative w-16 h-8 hover:scale-110 transition-transform duration-200">
                                  <Image
                                    src={`https://assets.ppy.sh/beatmaps/${beatmap?.beatmapset_id}/covers/card.jpg`}
                                    alt={`${beatmap?.artist} - ${beatmap?.title}`}
                                    fill
                                    className="object-cover rounded shadow"
                                    style={{ filter: 'brightness(1.1)' }}
                                  />
                                </div>
                              </td>
                              <td className={tableCellStyles.title}>
                                <a
                                  href={map.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={tableCellStyles.link}
                                >
                                  {beatmap?.artist} - {beatmap?.title} <span className="text-gray-400">[{beatmap?.version}]</span>
                                </a>
                              </td>
                              <td className={tableCellStyles.mapper}>{beatmap?.creator}</td>
                              <td className={tableCellStyles.id}>{beatmap?.id}</td>
                              <td className={tableCellStyles.length}>
                                {beatmap ? `${Math.floor(beatmap.total_length / 60)}:${String(beatmap.total_length % 60).padStart(2, '0')}` : ''}
                              </td>
                              <td className={tableCellStyles.stats}>{beatmap?.difficulty_rating?.toFixed(2)}</td>
                              <td className={tableCellStyles.stats}>{beatmap ? Math.round(beatmap.bpm) : ''}</td>
                              <td className={tableCellStyles.stats}>{beatmap?.cs?.toFixed(1)}</td>
                              <td className={tableCellStyles.stats}>{beatmap?.ar?.toFixed(1)}</td>
                              <td className={tableCellStyles.stats}>{beatmap?.accuracy?.toFixed(1)}</td>
                              <td className={tableCellStyles.stats}>{beatmap?.drain?.toFixed(1)}</td>
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
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
