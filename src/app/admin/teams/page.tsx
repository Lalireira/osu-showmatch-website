'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { teams as initialTeams } from '@/data/teams';

interface TeamMember {
  userNo: string;
  url: string;
}
interface Team {
  team: string;
  members: TeamMember[];
}

export default function TeamsAdminPage() {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin');
      return;
    }
    setTeams(initialTeams);
    setIsLoading(false);
  }, [isAuthenticated, router]);

  // 編集開始
  const handleEdit = (team: string, userNo: string, url: string) => {
    setEditingIndex(`${team}-${userNo}`);
    setEditingUrl(url);
  };

  // 編集保存
  const handleSave = (team: string, userNo: string, newUrl: string) => {
    setTeams(teams.map(t =>
      t.team === team
        ? {
            ...t,
            members: t.members.map(m =>
              m.userNo === userNo ? { ...m, url: newUrl } : m
            ),
          }
        : t
    ));
    setEditingIndex(null);
    setEditingUrl('');
  };

  // 編集キャンセル
  const handleCancel = () => {
    setEditingIndex(null);
    setEditingUrl('');
  };

  // 更新ボタン押下時
  const handleTeamsUpdate = async (newTeams: Team[]) => {
    try {
      const response = await fetch('/api/admin/teams-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teams: newTeams }),
      });
      if (!response.ok) throw new Error('Failed to update teams config');
      setSuccessMessage('チーム情報の更新が完了しました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('チーム情報の更新に失敗しました');
      console.error(err);
    }
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
        <h1 className="text-4xl font-bold mb-8 text-center text-white animate-fade-in-down">チーム管理</h1>
        <div className="space-y-8">
          {teams.map(team => (
            <div key={team.team} className="bg-[#181c24] p-4 rounded-lg shadow animate-fade-in-down">
              <h2 className="text-2xl font-bold mb-4 text-white">{team.team}</h2>
              {/* 2列分に分割 */}
              {Array.from({ length: 3 }).map((_, row) => {
                const col1 = team.members[row];
                const col2 = team.members[row + 3];
                return (
                  <div className="flex gap-4 mb-2" key={row}>
                    {[col1, col2].map((member, colIdx) => {
                      if (!member) return <div className="flex-1" key={colIdx}></div>;
                      const idx = `${team.team}-${member.userNo}`;
                      return (
                        <div className="flex-1 flex items-center space-x-4 p-2 rounded bg-[#222] text-white hover:bg-[#23263a]" key={colIdx}>
                          <span className="w-20 text-base font-bold text-white">{member.userNo}</span>
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
                                onClick={() => handleSave(team.team, member.userNo, editingUrl)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                              >保存</button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 font-semibold"
                              >キャンセル</button>
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-white break-all flex-grow">{member.url}</span>
                              <button
                                onClick={() => handleEdit(team.team, member.userNo, member.url)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                              >編集</button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-8">
          <button
            onClick={() => handleTeamsUpdate(teams)}
            className="w-full px-4 py-3 bg-indigo-700 text-white text-lg rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-bold"
          >
            更新
          </button>
        </div>
      </div>
    </div>
  );
} 