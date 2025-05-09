import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-[#1a1a1a] text-white py-4">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            <Link href="/">osu! Showmatch</Link>
          </div>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-[#ff66aa] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/teams" className="hover:text-[#ff66aa] transition-colors">
                Teams
              </Link>
            </li>
            <li>
              <Link href="/mappool-ui" className="hover:text-[#ff66aa] transition-colors">
                Mappool
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 