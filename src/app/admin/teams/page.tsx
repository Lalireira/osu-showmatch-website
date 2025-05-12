'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

interface Player {
  userNo: string;
  url: string;
}

interface Team {
  team: string;
  members: Player[];
}

export default function AdminTeamsPage() {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
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
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/admin/teams-config');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        setTeams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [isAuthenticated, router]);

  // 編集開始
  const handleEdit = (team: string, userNo: string, url: string) => {
    setEditingIndex(`${team}-${userNo}`);
    setEditingUrl(url);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
              <ul className="list-disc pl-8">
                {team.members.map((member) => {
                  const idx = `${team.team}-${member.userNo}`;
                  return (
                    <li key={member.userNo} className="text-white flex items-center gap-2 mb-2">
                      <span className="w-32 inline-block">{member.userNo}</span>
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
                              const newTeams = teams.map(t =>
                                t.team === team.team
                                  ? {
                                      ...t,
                                      members: t.members.map(m =>
                                        m.userNo === member.userNo ? { ...m, url: editingUrl } : m
                                      ),
                                    }
                                  : t
                              );
                              setTeams(newTeams);
                              setEditingIndex(null);
                              setEditingUrl('');
                              await handleTeamsUpdate(newTeams);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                          >保存</button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 font-semibold"
                          >キャンセル</button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm break-all flex-grow">{member.url}</span>
                          <button
                            onClick={() => handleEdit(team.team, member.userNo, member.url)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                          >編集</button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
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
