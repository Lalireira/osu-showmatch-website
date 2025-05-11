'use client';

import { useAdminAuth } from '@/lib/auth/client';
import LoginForm from '@/components/admin/LoginForm';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const { isAuthenticated, logout } = useAdminAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // クライアントサイドでのみレンダリング
  if (!isClient) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">管理者画面</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* チーム管理カード */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  チーム管理
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>チーム情報の更新と管理を行います。</p>
                </div>
                <div className="mt-5">
                  <Link
                    href="/admin/teams"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    チーム管理へ
                  </Link>
                </div>
              </div>
            </div>

            {/* マップ管理カード */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  マップ管理
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>マッププールの更新と管理を行います。</p>
                </div>
                <div className="mt-5">
                  <Link
                    href="/admin/maps"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    マップ管理へ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 