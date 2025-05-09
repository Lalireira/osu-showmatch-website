'use client';

import PlayerCard from '@/components/PlayerCard';

export default function TeamsPage() {
  // 実際のプレイヤー名（テスト用）
  const teamA = ['mrekk', 'Vaxei', 'WhiteCat', 'Aricin'];
  const teamB = ['Cookiezi', 'Rafis', 'Ephemeral', 'Toy'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Tournament Teams</h1>
      
      {/* Team A */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Team A</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamA.map((username) => (
            <PlayerCard key={username} username={username} />
          ))}
        </div>
      </section>

      {/* Team B */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Team B</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamB.map((username) => (
            <PlayerCard key={username} username={username} />
          ))}
        </div>
      </section>
    </div>
  );
} 