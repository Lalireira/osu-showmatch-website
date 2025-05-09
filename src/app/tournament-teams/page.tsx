export default function TeamsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Tournament Teams</h1>
      
      {/* Team A */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Team A</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* プレイヤーカードのプレースホルダー */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#2a2a2a] p-6 rounded-lg">
              <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Player {i}</h3>
              <div className="space-y-2 text-gray-400">
                <p>Country: TBA</p>
                <p>PP: TBA</p>
                <p>Global Rank: TBA</p>
                <p>National Rank: TBA</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team B */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Team B</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* プレイヤーカードのプレースホルダー */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#2a2a2a] p-6 rounded-lg">
              <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Player {i}</h3>
              <div className="space-y-2 text-gray-400">
                <p>Country: TBA</p>
                <p>PP: TBA</p>
                <p>Global Rank: TBA</p>
                <p>National Rank: TBA</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 