import Image from 'next/image';
import { mappool } from '@/data/mappool';

export default function MappoolTable() {
  return (
    <main className="min-h-screen bg-[#050813]">
      <div className="container mx-auto px-2 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white animate-fade-in-down">Mappool</h1>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm text-left text-white">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="px-2 py-2">MapNo</th>
                <th className="px-2 py-2">Banner</th>
                <th className="px-2 py-2">Artist - Title [Diff]</th>
                <th className="px-2 py-2">Mapper</th>
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">Length</th>
                <th className="px-2 py-2">SR</th>
                <th className="px-2 py-2">BPM</th>
                <th className="px-2 py-2">CS</th>
                <th className="px-2 py-2">AR</th>
                <th className="px-2 py-2">OD</th>
                <th className="px-2 py-2">HP</th>
                <th className="px-2 py-2">PACK</th>
              </tr>
            </thead>
            <tbody>
              {mappool.map((map, idx) => (
                <tr key={map.mapNo} className={idx % 2 === 0 ? 'bg-[#222]' : 'bg-[#181c24]'}>
                  <td className="px-2 py-1">{map.mapNo}</td>
                  <td className="px-2 py-1">
                    <Image src={map.banner} alt={map.mapNo} width={64} height={36} className="rounded" />
                  </td>
                  <td className="px-2 py-1">{map.artistTitle}</td>
                  <td className="px-2 py-1">{map.mapper}</td>
                  <td className="px-2 py-1">{map.id}</td>
                  <td className="px-2 py-1">{map.length}</td>
                  <td className="px-2 py-1">{map.sr}</td>
                  <td className="px-2 py-1">{map.bpm}</td>
                  <td className="px-2 py-1">{map.cs}</td>
                  <td className="px-2 py-1">{map.ar}</td>
                  <td className="px-2 py-1">{map.od}</td>
                  <td className="px-2 py-1">{map.hp}</td>
                  <td className="px-2 py-1">{map.pack}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 