import React, { useEffect, useCallback, useState } from 'react';

interface PadGridProps {
  slices: number[];
  hasAudio: boolean;
  isWaveformReady: boolean;
}

const KEY_MAP = ['1', '2', '3', '4', 'q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];

// Matching the colors used in WaveformEditor but fully opaque for pads
const COLORS = [
  'rgb(244, 114, 182)', // pink-400
  'rgb(167, 139, 250)', // purple-400
  'rgb(34, 211, 238)',  // cyan-400
  'rgb(52, 211, 153)',  // emerald-400
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
      
      // Don't trigger if user is typing in an input (though we don't have many inputs)
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
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
          Performance Pads
        </h3>
        <span className="text-xs text-slate-600 font-mono">Keyboard: 1-4, Q-R, A-F, Z-V</span>
      </div>
      
      <div className="grid grid-cols-4 gap-3 md:gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm">
        {pads.map((index) => {
          const hasSlice = index < slices.length;
          const color = COLORS[index % COLORS.length];
          const isActive = activePad === index;
          const keyLabel = KEY_MAP[index].toUpperCase();

          return (
            <button
              key={index}
              onClick={() => triggerPad(index)}
              disabled={!hasSlice || !isWaveformReady}
              className={`
                aspect-square rounded-xl relative overflow-hidden transition-all duration-100 group
                ${!hasSlice 
                  ? 'bg-slate-800/50 border border-slate-800 opacity-50 cursor-not-allowed' 
                  : 'bg-slate-800 border border-slate-700 hover:border-slate-500 hover:bg-slate-750 cursor-pointer shadow-lg active:scale-95'
                }
                ${isActive ? 'scale-95 brightness-125 ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-400' : ''}
              `}
              style={hasSlice && isActive ? {
                backgroundColor: color,
                borderColor: color,
                boxShadow: `0 0 20px ${color}`
              } : {}}
            >
              {/* Color Indicator Bar (Bottom) */}
              {hasSlice && (
                <div 
                  className={`absolute bottom-0 left-0 w-full h-1.5 opacity-80 transition-opacity group-hover:opacity-100`}
                  style={{ backgroundColor: color }}
                />
              )}

              {/* Pad LED (Top Right) */}
              {hasSlice && (
                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full transition-all duration-75 ${isActive ? 'bg-white shadow-[0_0_8px_white]' : 'bg-slate-900/80'}`}></div>
              )}

              {/* Label */}
              <div className="absolute top-2 left-3 text-xs font-mono font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                {index + 1}
              </div>

              {/* Key binding hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 pointer-events-none">
                <span className="text-4xl font-black text-white">{keyLabel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PadGrid;