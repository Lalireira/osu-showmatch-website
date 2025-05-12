export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} osu! Showmatch. All rights reserved.
          </p>
          <p className="text-gray-500 mt-2">
            Created by <a href="https://x.com/lalireira" target="_blank" rel="noopener noreferrer" className="hover:text-[#79b0ea] transition-colors">Reira</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
