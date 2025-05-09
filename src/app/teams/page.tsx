import PlayerCard from '@/components/PlayerCard';

interface Player {
  id: number;
  username: string;
}

const TEAM_A: Player[] = [
  { id: 1234567, username: 'Reira' },
  { id: 2345678, username: 'Reira2' },
  { id: 3456789, username: 'Reira3' },
  { id: 4567890, username: 'Reira4' },
  { id: 5678901, username: 'Reira5' },
  { id: 6789012, username: 'Reira6' },
];

const TEAM_B: Player[] = [
  { id: 7890123, username: 'Reira7' },
  { id: 8901234, username: 'Reira8' },
  { id: 9012345, username: 'Reira9' },
  { id: 0123456, username: 'Reira10' },
  { id: 1234567, username: 'Reira11' },
  { id: 2345678, username: 'Reira12' },
];

export default function TeamsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Teams</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team A */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Team A</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEAM_A.map((player) => (
              <PlayerCard key={player.id} userId={player.id} username={player.username} />
            ))}
          </div>
        </div>

        {/* Team B */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Team B</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEAM_B.map((player) => (
              <PlayerCard key={player.id} userId={player.id} username={player.username} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 