import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* メインビジュアル */}
      <section className="mb-12">
        <div className="relative h-[400px] bg-[#2a2a2a] rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold">osu! Showmatch</h1>
          </div>
        </div>
      </section>

      {/* Schedule & Details */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Schedule & Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Important Dates</h3>
            <ul className="space-y-2">
              <li>Mappool Announcement: TBA</li>
              <li>Match Day: TBA</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Staff</h3>
            <ul className="space-y-2">
              <li>Manager: TBA</li>
              <li>Mappool Selector: TBA</li>
              <li>Commentator: TBA</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Team Formation</h3>
            <p>Details about team formation will be announced soon.</p>
          </div>
          <div className="bg-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Match Format</h3>
            <p>Match format details will be announced soon.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
