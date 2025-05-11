'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { mappoolConfig } from '@/data/mappool';
import { extractIdsFromUrl } from '@/lib/utils';

// カテゴリの定義
const CATEGORIES = ['NM', 'HD', 'HR', 'DT', 'FM', 'TB'] as const;
type Category = typeof CATEGORIES[number];

interface Map {
  id: string;
  url: string;
  beatmapId: string;
  artist: string;
  title: string;
  difficulty: string;
  difficultyRating: number;
  creator: string;
  coverUrl: string;
  category: Category;
  number: number;
}

export default function MapsPage() {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [maps, setMaps] = useState<Map[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('NM');
  const [selectedNumber, setSelectedNumber] = useState<number>(1);
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin');
      return;
    }

    // mappoolConfigから初期データを読み込む
    const initialMaps = mappoolConfig.map(config => {
      const match = config.mapNo.match(/^([A-Z]+)(\d+)$/);
      if (!match) return null;
      const [, category, number] = match;
      return {
        id: '',
        url: config.url,
        beatmapId: '',
        artist: '',
        title: '',
        difficulty: '',
        difficultyRating: 0,
        creator: '',
        coverUrl: '',
        category: category as Category,
        number: parseInt(number, 10),
      };
    }).filter((map): map is Map => map !== null);

    setMaps(initialMaps);
    setIsLoading(false);
  }, [isAuthenticated, router]);

  const handleMapsUpdate = async (newMaps: Map[]) => {
    try {
      const configResponse = await fetch('/api/admin/mappool-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maps: newMaps }),
      });

      if (!configResponse.ok) throw new Error('Failed to update mappool config');

      setSuccessMessage('マッププールの更新が完了しました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('マップ情報の更新に失敗しました');
      console.error(err);
    }
  };

  const handleMapAdd = () => {
    if (!inputUrl) return;
    try {
      extractIdsFromUrl(inputUrl); // 検証
      const newMap: Map = {
        id: '',
        url: inputUrl,
        beatmapId: '',
        artist: '',
        title: '',
        difficulty: '',
        difficultyRating: 0,
        creator: '',
        coverUrl: '',
        category: selectedCategory,
        number: selectedNumber,
      };

      // 同じカテゴリ・番号のマップがある場合は上書き
      const existingIndex = maps.findIndex(
        m => m.category === selectedCategory && m.number === selectedNumber
      );

      if (existingIndex >= 0) {
        const newMaps = [...maps];
        newMaps[existingIndex] = newMap;
        setMaps(newMaps);
      } else {
        setMaps([...maps, newMap]);
      }

      setInputUrl('');
    } catch (e) {
      setError('URLの形式が正しくありません');
    }
  };

  // カテゴリごとのマップを取得
  const getMapsByCategory = (category: Category) => {
    return maps
      .filter(m => m.category === category)
      .sort((a, b) => a.number - b.number);
  };

  // 編集開始
  const handleEdit = (index: string, url: string) => {
    setEditingIndex(index);
    setEditingUrl(url);
  };

  // 編集保存
  const handleSave = (map: Map, newUrl: string) => {
    setMaps(maps.map(m =>
      m.category === map.category && m.number === map.number
        ? { ...m, url: newUrl }
        : m
    ));
    setEditingIndex(null);
    setEditingUrl('');
  };

  // 編集キャンセル
  const handleCancel = () => {
    setEditingIndex(null);
    setEditingUrl('');
  };

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#050813]">
      <div className="container mx-auto px-2 py-8">
        {successMessage && (
          <div className="mb-4 p-3 bg-green-600 text-white text-center rounded font-bold animate-fade-in-down">
            {successMessage}
          </div>
        )}
        <h1 className="text-4xl font-bold mb-8 text-center text-white animate-fade-in-down">マッププール管理</h1>
        {/* カテゴリごとのマップ一覧 */}
        <div className="space-y-8">
          {CATEGORIES.map(category => {
            const categoryMaps = getMapsByCategory(category);
            if (categoryMaps.length === 0) return null;

            return (
              <div key={category} className="bg-[#181c24] p-4 rounded-lg shadow animate-fade-in-down">
                <h2 className="text-2xl font-bold mb-4 text-white">{category}</h2>
                <div className="space-y-4">
                  {categoryMaps.map((map, index) => {
                    const idx = `${map.category}-${map.number}`;
                    const rowColor = index % 2 === 0 ? 'bg-[#222] text-white' : 'bg-[#181c24] text-white';
                    return (
                      <div key={idx} className={`flex items-center space-x-4 p-2 rounded ${rowColor} hover:bg-[#23263a]`}>
                        <span className="w-16 text-base font-bold text-white">{map.category}{map.number}</span>
                        {editingIndex === idx ? (
                          <>
                            <input
                              type="text"
                              value={editingUrl}
                              onChange={e => setEditingUrl(e.target.value)}
                              className="flex-grow border rounded px-2 text-white bg-[#23263a]"
                              style={{ minWidth: 200 }}
                            />
                            <button
                              onClick={() => handleSave(map, editingUrl)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                            >保存</button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 font-semibold"
                            >キャンセル</button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-white break-all flex-grow">{map.url}</span>
                            <button
                              onClick={() => handleEdit(idx, map.url)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                            >編集</button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* 更新ボタン */}
        <div className="mt-8">
          <button
            onClick={() => handleMapsUpdate(maps)}
            className="w-full px-4 py-3 bg-indigo-700 text-white text-lg rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-bold"
          >
            更新
          </button>
        </div>
      </div>
    </div>
  );
} 