import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { formatTime } from '../utils/audioHelper';

interface WaveformEditorProps {
  audioUrl: string | null;
  slices: number[];
  onSlicesChange: (slices: number[]) => void;
  onReady: () => void;
  onPlayPause: (isPlaying: boolean) => void;
  isDarkMode: boolean;
}

const WaveformEditor: React.FC<WaveformEditorProps> = ({
  audioUrl,
  slices,
  onSlicesChange,
  onReady,
  onPlayPause,
  isDarkMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const [zoom, setZoom] = useState(50); // Default zoom
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Define colors based on theme
  const getThemeColors = (dark: boolean) => ({
    waveColor: dark ? '#52525b' : '#d4d4d8', // zinc-600 : zinc-300
    progressColor: '#3b82f6', // blue-500
    cursorColor: dark ? '#ffffff' : '#18181b', // white : zinc-900
  });

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const colors = getThemeColors(isDarkMode);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: colors.waveColor,
      progressColor: colors.progressColor,
      cursorColor: colors.cursorColor,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 280,
      url: audioUrl || undefined,
      minPxPerSec: zoom,
      plugins: [regions],
      normalize: true, 
      interact: true,
      hideScrollbar: false,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      const d = ws.getDuration();
      setDuration(d);
      if (d > 0) {
        onReady();
      }
    });

    ws.on('error', (err) => {
        console.warn('WaveSurfer Error:', err);
    });

    ws.on('play', () => onPlayPause(true));
    ws.on('pause', () => onPlayPause(false));
    ws.on('timeupdate', (t) => setCurrentTime(t));
    ws.on('finish', () => onPlayPause(false));

    // Region Events
    regions.on('region-clicked', (region, e) => {
      e.stopPropagation();
      // Safe play check
      if (ws.getDuration() > 0) {
        try {
          region.play();
        } catch (err) {
          console.warn('Region play prevented:', err);
        }
      }
    });

    // Cleanup
    return () => {
      ws.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Update WaveSurfer options when theme changes
  useEffect(() => {
    if (wavesurferRef.current) {
      const colors = getThemeColors(isDarkMode);
      wavesurferRef.current.setOptions({
        waveColor: colors.waveColor,
        cursorColor: colors.cursorColor,
      });
    }
  }, [isDarkMode]);

  // Listen for custom toggle event from App.tsx
  useEffect(() => {
    const handleToggle = () => {
      if (wavesurferRef.current) {
        const d = wavesurferRef.current.getDuration();
        if (d > 0) {
            try {
              wavesurferRef.current.playPause();
            } catch (err) {
              console.warn("Playback failed:", err);
            }
        }
      }
    };
    
    const handlePlaySlice = (e: Event) => {
        const customEvent = e as CustomEvent;
        const index = customEvent.detail.index;
        
        if (regionsRef.current) {
            const regions = regionsRef.current.getRegions();
            // Sort by start time to ensure index matches visual order
            const sortedRegions = regions.sort((a, b) => a.start - b.start);
            
            if (sortedRegions[index]) {
                try {
                  sortedRegions[index].play();
                } catch (err) {
                  console.warn("Slice play failed:", err);
                }
            }
        }
    };

    window.addEventListener('beatslicer:toggle-play', handleToggle);
    window.addEventListener('beatslicer:play-slice', handlePlaySlice);
    
    return () => {
        window.removeEventListener('beatslicer:toggle-play', handleToggle);
        window.removeEventListener('beatslicer:play-slice', handlePlaySlice);
    };
  }, []);

  // Handle Audio URL Changes
  useEffect(() => {
    if (wavesurferRef.current && audioUrl) {
      if (wavesurferRef.current.getDuration() > 0) {
        try {
            wavesurferRef.current.pause();
        } catch (e) { 
            console.warn("Safe pause failed:", e);
        }
      }
      
      regionsRef.current?.clearRegions();
      try {
          wavesurferRef.current.load(audioUrl);
      } catch (e) {
          console.error("Failed to load audio URL:", e);
      }
    }
  }, [audioUrl]);

  // Handle Zoom Changes
  useEffect(() => {
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.zoom(zoom);
      } catch (e) {
          console.warn("Zoom update failed:", e);
      }
    }
  }, [zoom]);

  // Handle Slices (Regions)
  useEffect(() => {
    if (!regionsRef.current || !wavesurferRef.current) return;

    regionsRef.current.clearRegions();
    const trackDuration = wavesurferRef.current.getDuration();
    
    if (trackDuration === 0 && slices.length > 0) return;

    // Using theme colors for slices (keep consistent)
    const colors = [
      'rgba(59, 130, 246, 0.2)',  // blue
      'rgba(161, 161, 170, 0.2)', // zinc
      'rgba(34, 197, 94, 0.2)',   // green
    ];

    slices.forEach((startTime, index) => {
      let endTime = slices[index + 1];
      if (!endTime) {
         endTime = trackDuration;
      }

      if (startTime >= trackDuration) return;

      regionsRef.current!.addRegion({
        start: startTime,
        end: endTime,
        color: colors[index % colors.length],
        drag: false,
        resize: true,
        content: `${index + 1}`,
      });
    });

  }, [slices, duration]);

  return (
    <div className="w-full bg-white/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 backdrop-blur-md relative group overflow-hidden transition-colors duration-300">
       {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-zinc-300 dark:border-zinc-600"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-zinc-300 dark:border-zinc-600"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-zinc-300 dark:border-zinc-600"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-zinc-300 dark:border-zinc-600"></div>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-sm ${duration > 0 ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-zinc-400 dark:bg-zinc-700'}`}></div>
             <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Waveform Visualization</span>
        </div>
        <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 tabular-nums tracking-tight">
           {formatTime(currentTime)} <span className="text-zinc-400 dark:text-zinc-700 mx-1">/</span> {formatTime(duration)}
        </div>
      </div>
      
      {/* Waveform Container */}
      <div 
        ref={containerRef} 
        className="w-full relative rounded border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950/50 transition-colors duration-300"
      />

      {/* Zoom Control */}
      <div className="mt-6 flex items-center gap-4 px-2">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Time Scale</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 relative">
             <div className="absolute top-1/2 -translate-y-1/2 w-full flex items-center">
                <input
                type="range"
                min="10"
                max="300"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-3 opacity-0 cursor-pointer absolute z-10" 
                />
                {/* Custom Track */}
                <div className="w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${((zoom - 10) / 290) * 100}%` }}
                   ></div>
                </div>
                {/* Custom Thumb */}
                <div 
                    className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-lg pointer-events-none"
                    style={{ left: `${((zoom - 10) / 290) * 100}%`, transform: 'translateX(-50%)' }}
                ></div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default WaveformEditor;