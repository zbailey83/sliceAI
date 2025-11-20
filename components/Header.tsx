import React from 'react';
import { Activity, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
              REDACT<span className="text-zinc-400 dark:text-zinc-600">⚔️</span>SLICE AI
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
              Version 1.0.0 <span className="text-zinc-300 dark:text-zinc-700 mx-1">|</span> [REDACTED//AUDIO]
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse"></span>
            System Online
          </div>
          
        </div>
      </div>
    </header>
  );
};

export default Header;