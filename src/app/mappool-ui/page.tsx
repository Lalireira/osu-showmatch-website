export default function MappoolPage() {
  const categories = [
    { name: 'NoMod', count: 5 },
    { name: 'Hidden', count: 3 },
    { name: 'HardRock', count: 3 },
    { name: 'DoubleTime', count: 3 },
    { name: 'FreeMod', count: 3 },
    { name: 'TieBreaker', count: 1 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mappool</h1>

      {categories.map((category) => (
        <section key={category.name} className="mb-12">
          <h2 className="text-3xl font-bold mb-6">{category.name} ({category.count}譜面)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: category.count }).map((_, i) => (
              <div key={i} className="bg-[#2a2a2a] p-6 rounded-lg">
                <div className="aspect-video bg-gray-700 rounded-lg mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Song Title {i + 1}</h3>
                <div className="space-y-2 text-gray-400">
                  <p>Artist: TBA</p>
                  <p>Difficulty: TBA</p>
                  <p>Mapper: TBA</p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <p>Length: TBA</p>
                    <p>BPM: TBA</p>
                    <p>SR: TBA</p>
                    <p>CS: TBA</p>
                    <p>AR: TBA</p>
                    <p>OD: TBA</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
} 