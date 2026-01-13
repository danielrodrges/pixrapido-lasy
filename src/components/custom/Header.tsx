'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-yellow-400 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
              <Ticket className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl md:text-2xl leading-none">
                PIX<span className="text-yellow-400">RÁPIDO</span>
              </span>
              <span className="text-emerald-100 text-[10px] md:text-xs font-medium">
                Sorteios Instantâneos
              </span>
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`font-bold transition-colors ${
                isActive('/')
                  ? 'text-yellow-400'
                  : 'text-white hover:text-yellow-300'
              }`}
            >
              Início
            </Link>
            <Link
              href="/#sorteios"
              className="text-white hover:text-yellow-300 font-bold transition-colors"
            >
              Sorteios
            </Link>
            <Link
              href="/minha-conta"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                isActive('/minha-conta')
                  ? 'bg-yellow-400 text-emerald-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <User className="w-5 h-5" />
              Minha Conta
            </Link>
          </nav>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {menuAberto && (
          <nav className="md:hidden py-4 border-t border-white/20 space-y-2">
            <Link
              href="/"
              onClick={() => setMenuAberto(false)}
              className={`block px-4 py-3 rounded-lg font-bold transition-colors ${
                isActive('/')
                  ? 'bg-yellow-400 text-emerald-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Início
            </Link>
            <Link
              href="/#sorteios"
              onClick={() => setMenuAberto(false)}
              className="block px-4 py-3 rounded-lg text-white hover:bg-white/10 font-bold transition-colors"
            >
              Sorteios
            </Link>
            <Link
              href="/minha-conta"
              onClick={() => setMenuAberto(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold transition-colors ${
                isActive('/minha-conta')
                  ? 'bg-yellow-400 text-emerald-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <User className="w-5 h-5" />
              Minha Conta
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
