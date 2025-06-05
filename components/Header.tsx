'use client';

import React from 'react';
import Link from 'next/link';
import { UserCircle2 } from 'lucide-react'; // Ícone de placeholder para o avatar

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-bg-secondary/80 backdrop-blur-md border-b border-bg-tertiary shadow-lg transition-all duration-300 ease-smooth">
      <div className="container mx-auto flex items-center justify-between h-14 sm:h-16 md:h-20 px-2 sm:px-4 md:px-8 max-w-7xl">
        <Link href="/" className="text-sm sm:text-lg md:text-xl font-bold text-text-primary uppercase tracking-wider sm:tracking-widest">
          <span className="shadow-text-title" data-text="Raid">Raid</span>
          <span className="mx-1 sm:mx-2">&nbsp;</span>
          <span className="shadow-text-title" data-text="S&S">S&S</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Placeholder para funcionalidades futuras como notificação ou menu */}
          {/* <button className="text-text-secondary hover:text-text-primary">
            <Bell size={18} />
          </button> */}
          
          <div className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full bg-bg-tertiary text-text-primary border border-text-secondary/50 text-[8px] sm:text-xs md:text-sm font-semibold shadow-inner">
            {/* <UserCircle2 size={20} className="opacity-70" /> */}
            US
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 