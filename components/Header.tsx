import React from 'react';
import { Scissors, Music, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
          <Music className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            BeatSlicer <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <a 
          href="https://ai.google.dev/" 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors hidden sm:block"
        >
          Gemini API Docs
        </a>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-slate-300 font-medium">System Ready</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
