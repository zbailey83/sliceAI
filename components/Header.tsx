import React from 'react';
import { Activity } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded">
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-zinc-100 uppercase">
              BeatSlicer <span className="text-zinc-600">///</span> AI
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
              Version 1.0.0 <span className="text-zinc-700 mx-1">|</span> Gemini 2.5 Flash
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse"></span>
            System Online
          </div>
          
          <a 
            href="https://ai.google.dev/" 
            target="_blank" 
            rel="noreferrer"
            className="px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-600 rounded transition-colors"
          >
            API Docs
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;