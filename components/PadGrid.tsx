import React, { useEffect, useCallback, useState } from 'react';

interface PadGridProps {
  slices: number[];
  hasAudio: boolean;
  isWaveformReady: boolean;
}

const KEY_MAP = ['1', '2', '3', '4', 'q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];

// Light, distinct pastel colors for the pads (unchanged)
const PAD_COLORS = [
  'bg-red-300 hover:bg-red-200', 
  'bg-orange-300 hover:bg-orange-200', 
  'bg-amber-300 hover:bg-amber-200', 
  'bg-yellow-300 hover:bg-yellow-200',
  
  'bg-lime-300 hover:bg-lime-200', 
  'bg-green-300 hover:bg-green-200', 
  'bg-emerald-300 hover:bg-emerald-200', 
  'bg-teal-300 hover:bg-teal-200',
  
  'bg-cyan-300 hover:bg-cyan-200', 
  'bg-sky-300 hover:bg-sky-200', 
  'bg-blue-300 hover:bg-blue-200', 
  'bg-indigo-300 hover:bg-indigo-200',
  
  'bg-violet-300 hover:bg-violet-200', 
  'bg-purple-300 hover:bg-purple-200', 
  'bg-fuchsia-300 hover:bg-fuchsia-200', 
  'bg-pink-300 hover:bg-pink-200',
];

const PadGrid: React.FC<PadGridProps> = ({ slices, hasAudio, isWaveformReady }) => {
  const [activePad, setActivePad] = useState<number | null>(null);

  const triggerPad = useCallback((index: number) => {
    if (!hasAudio || !isWaveformReady || index >= slices.length) return;

    // Visual feedback
    setActivePad(index);
    setTimeout(() => setActivePad(null), 150);

    // Dispatch event for WaveformEditor
    window.dispatchEvent(new CustomEvent('beatslicer:play-slice', { detail: { index } }));
  }, [hasAudio, isWaveformReady, slices.length]);

  // Handle Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      const keyIndex = KEY_MAP.indexOf(e.key.toLowerCase());
      if (keyIndex !== -1) {
        triggerPad(keyIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerPad]);

  // Create 16 pads
  const pads = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
          Performance Pads
        </h3>
        <span className="text-[10px] text-zinc-500 dark:text-zinc-600 font-mono">KEYBOARD MAPPED</span>
      </div>
      
      <div className="grid grid-cols-4 gap-3 p-4 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-colors duration-300">
        {pads.map((index) => {
          const hasSlice = index < slices.length;
          const colorClass = PAD_COLORS[index % PAD_COLORS.length];
          const isActive = activePad === index;
          const keyLabel = KEY_MAP[index].toUpperCase();

          return (
            <button
              key={index}
              onClick={() => triggerPad(index)}
              disabled={!hasSlice || !isWaveformReady}
              className={`
                aspect-square relative rounded-lg transition-all duration-100
                flex flex-col items-center justify-center
                ${!hasSlice 
                  ? 'bg-zinc-100 dark:bg-zinc-800/50 opacity-50 cursor-not-allowed border border-zinc-200 dark:border-zinc-700/50' 
                  : `${colorClass} shadow-lg cursor-pointer border-b-4 border-black/10 active:border-b-0 active:translate-y-1`
                }
                ${isActive ? 'brightness-110 scale-95' : 'hover:-translate-y-0.5'}
              `}
            >
              {/* Label */}
              <div className={`text-lg font-bold transition-colors ${hasSlice ? 'text-zinc-900' : 'text-zinc-400 dark:text-zinc-600'}`}>
                {index + 1}
              </div>

              {/* Key binding hint */}
              <div className={`text-[10px] font-mono mt-1 ${hasSlice ? 'text-zinc-800/70' : 'text-zinc-400 dark:text-zinc-600'}`}>
                {keyLabel}
              </div>
              
              {/* Light reflection effect */}
              {hasSlice && (
                 <div className="absolute top-2 left-2 right-2 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-md pointer-events-none"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PadGrid;