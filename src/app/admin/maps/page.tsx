'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

interface MapConfig {
  id: number;
  mapNo: string;
  url: string;
}

export default function AdminMapsPage() {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [maps, setMaps] = useState<MapConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin');
      return;
    }

    const fetchMaps = async () => {
      try {
        const response = await fetch('/api/admin/mappool-config');
        if (!response.ok) {
          throw new Error('Failed to fetch mappool');
        }
        const data = await response.json();
        setMaps(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch mappool');
      } finally {
        setLoading(false);
      }
    };
    fetchMaps();
  }, [isAuthenticated, router]);

  const handleMapsUpdate = async (newMaps: MapConfig[]) => {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // カテゴリごとのスタイル（mappoolページと同じ）
  const categoryStyles: Record<string, { bg: string, text: string }> = {
    NM: { bg: 'bg-[#1a1a22]', text: 'text-[#f0f0f0]' },
    HD: { bg: 'bg-[#22220e]', text: 'text-[#f0f0f0]' },
    HR: { bg: 'bg-[#220e0e]', text: 'text-[#f0f0f0]' },
    DT: { bg: 'bg-[#1a0e22]', text: 'text-[#f0f0f0]' },
    FM: { bg: 'bg-[#0e220e]', text: 'text-[#f0f0f0]' },
    TB: { bg: 'bg-[#1a1a22]', text: 'text-[#f0f0f0]' },
  };

  return (
    <div className="min-h-screen bg-[#050813]">
      <div className="container mx-auto px-2 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white animate-fade-in-down">マッププール管理</h1>
        {successMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="p-6 bg-green-600 text-white text-center rounded-xl font-bold shadow-lg animate-fade-in-down text-2xl">
              {successMessage}
            </div>
          </div>
        )}
        {/* カテゴリごとに色分けして表示 */}
        {['NM', 'HD', 'HR', 'DT', 'FM', 'TB'].map(category => {
          const mapsInCategory = maps.filter(m => m.mapNo.startsWith(category));
          if (mapsInCategory.length === 0) return null;
          const style = categoryStyles[category] || { bg: '', text: '' };
          return (
            <div key={category} className={`mb-8 p-4 rounded-lg shadow ${style.bg} ${style.text}`}>
              <h2 className="text-2xl font-bold mb-4">{category}</h2>
              <ul>
                {mapsInCategory.map((map) => {
                  const idx = String(map.id);
                  return (
                    <li key={map.id} className="flex items-center gap-2 mb-2">
                      <span className="w-24 inline-block font-semibold">{map.mapNo}</span>
                      {editingIndex === idx ? (
                        <>
                          <input
                            type="text"
                            value={editingUrl}
                            onChange={e => setEditingUrl(e.target.value)}
                            className="flex-grow border rounded px-2 text-black bg-white"
                            style={{ minWidth: 200 }}
                          />
                          <button
                            onClick={async () => {
                              const newMaps = maps.map(m =>
                                m.id === map.id ? { ...m, url: editingUrl, mapNo: m.mapNo } : m
                              );
                              setMaps(newMaps);
                              setEditingIndex(null);
                              setEditingUrl('');
                              await handleMapsUpdate(newMaps);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                          >保存</button>
                          <button
                            onClick={() => { setEditingIndex(null); setEditingUrl(''); }}
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 font-semibold"
                          >キャンセル</button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm break-all flex-grow">{map.url}</span>
                          <button
                            onClick={() => { setEditingIndex(String(map.id)); setEditingUrl(map.url); }}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                          >編集</button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
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
