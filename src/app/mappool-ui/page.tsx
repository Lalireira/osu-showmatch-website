"use client";

import Image from 'next/image';
import { mappoolConfig } from '@/data/mappool';
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

// カラーテーマの定義
const categoryColors = {
  NM: {
    light: '#282830',
    dark: '#1a1a25',
    accent: '#2a2a35'
  },
  HD: {
    light: '#33331a',
    dark: '#26260e',
    accent: '#404020'
  },
  HR: {
    light: '#331a1a',
    dark: '#260e0e',
    accent: '#402020'
  },
  DT: {
    light: '#2a1a33',
    dark: '#1e0e26',
    accent: '#352040'
  },
  FM: {
    light: '#1a331a',
    dark: '#0e260e',
    accent: '#204020'
  },
  TB: {
    light: '#282830',
    dark: '#1a1a25',
    accent: '#2a2a35'
  }
};

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

          // サーバーサイドAPIを使用
          const response = await fetch(`/api/osu/beatmap/${beatmapId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch beatmap data');
          }
          const data = await response.json();

          // APIレスポンスの構造に合わせてデータを整形
          const formattedData: Beatmap = {
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

          // 取得したデータをキャッシュに保存
          saveToLocalStorage(`beatmap_${beatmapId}`, formattedData, CACHE_VERSIONS.BEATMAP);
          results.push(formattedData);
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
      }, idx * 100); // アニメーション間隔を少し長めに
    });
  }, [beatmaps]);

  // カテゴリごとにグループ化
  const grouped = groupByCategory();

  // カテゴリの表示順
  const categoryOrder = ['NM', 'HD', 'HR', 'DT', 'FM', 'TB'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#030408] to-[#050810] font-sans overflow-hidden">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-white animate-fade-in-down tracking-wider" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
          Mappool
        </h1>
        <div className="space-y-8">
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
                          <th className="px-3 py-2 font-bold">MapNo</th>
                          <th className="px-3 py-2 font-bold">Banner</th>
                          <th className="px-3 py-2 font-bold">Artist - Title [Diff]</th>
                          <th className="px-3 py-2 font-bold">Mapper</th>
                          <th className="px-3 py-2 font-bold">ID</th>
                          <th className="px-3 py-2 font-bold">Length</th>
                          <th className="px-3 py-2 font-bold">SR</th>
                          <th className="px-3 py-2 font-bold">BPM</th>
                          <th className="px-3 py-2 font-bold">CS</th>
                          <th className="px-3 py-2 font-bold">AR</th>
                          <th className="px-3 py-2 font-bold">OD</th>
                          <th className="px-3 py-2 font-bold">HP</th>
                        </tr>
                      </thead>
                      <tbody className="overflow-visible">
                        {maps.map((map, idx) => {
                          const globalIdx = mappoolConfig.findIndex(m => m.mapNo === map.mapNo);
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
                              <td className="px-3 py-2 font-semibold border-b border-[#222] text-center">{map.mapNo}</td>
                              <td className="px-3 py-2 border-b border-[#222]">
                                <div className="relative w-16 h-8 hover:scale-110 transition-transform duration-200">
                                  <Image
                                    src={`https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/card.jpg`}
                                    alt={`${beatmap.artist} - ${beatmap.title}`}
                                    fill
                                    className="object-cover rounded shadow"
                                    style={{ filter: 'brightness(1.1)' }}
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-2 font-medium border-b border-[#222] max-w-xs break-words">
                                <a
                                  href={map.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-[#ff66aa] transition-colors duration-200"
                                >
                                  {beatmap.artist} - {beatmap.title} <span className="text-gray-400">[{beatmap.version}]</span>
                                </a>
                              </td>
                              <td className="px-3 py-2 border-b border-[#222] break-words">{beatmap.creator}</td>
                              <td className="px-3 py-2 font-mono text-xs border-b border-[#222]">{beatmap.id}</td>
                              <td className="px-3 py-2 border-b border-[#222]">
                                {Math.floor(beatmap.total_length / 60)}:{String(beatmap.total_length % 60).padStart(2, '0')}
                              </td>
                              <td className="px-3 py-2 font-semibold border-b border-[#222]">{beatmap.difficulty_rating.toFixed(2)}</td>
                              <td className="px-3 py-2 border-b border-[#222]">{Math.round(beatmap.bpm)}</td>
                              <td className="px-3 py-2 border-b border-[#222]">{beatmap.cs.toFixed(1)}</td>
                              <td className="px-3 py-2 border-b border-[#222]">{beatmap.ar.toFixed(1)}</td>
                              <td className="px-3 py-2 border-b border-[#222]">{beatmap.accuracy.toFixed(1)}</td>
                              <td className="px-3 py-2 border-b border-[#222]">{beatmap.drain.toFixed(1)}</td>
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
