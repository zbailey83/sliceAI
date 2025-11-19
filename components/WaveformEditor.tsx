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
}

const WaveformEditor: React.FC<WaveformEditorProps> = ({
  audioUrl,
  slices,
  onSlicesChange,
  onReady,
  onPlayPause,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const [zoom, setZoom] = useState(50); // Default zoom
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#475569', // slate-600
      progressColor: '#22d3ee', // cyan-400
      cursorColor: '#f472b6', // pink-400
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 250,
      url: audioUrl || undefined,
      minPxPerSec: zoom,
      plugins: [regions],
      normalize: true, // Normalize waveform for better visuals
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
      // Stop playback before loading new file to avoid race conditions
      // Crucial: Check duration before calling pause to avoid "No audio loaded" error
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
    
    // Need wait for duration if it's 0 (track loading)
    if (trackDuration === 0 && slices.length > 0) return;

    const colors = [
      'rgba(244, 114, 182, 0.3)', // pink
      'rgba(167, 139, 250, 0.3)', // purple
      'rgba(34, 211, 238, 0.3)',  // cyan
      'rgba(52, 211, 153, 0.3)',  // emerald
    ];

    slices.forEach((startTime, index) => {
      // If next slice exists, end there. Else end a bit later or at track end.
      let endTime = slices[index + 1];
      if (!endTime) {
         // Last slice logic
         endTime = trackDuration;
      }

      if (startTime >= trackDuration) return;

      regionsRef.current!.addRegion({
        start: startTime,
        end: endTime,
        color: colors[index % colors.length],
        drag: false,
        resize: true,
        content: `Sample ${index + 1}`,
      });
    });

  }, [slices, duration]); // Re-run when duration is ready or slices change

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-xl relative group">
      
      {/* Time Display Overlay */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${duration > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
             <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Waveform View</span>
        </div>
        <div className="font-mono text-lg font-bold text-cyan-400 tabular-nums tracking-tighter">
           {formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(duration)}
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="w-full relative rounded-lg overflow-hidden cursor-pointer"
      />

      {/* Zoom Control */}
      <div className="mt-6 flex items-center gap-4 px-2">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Scale</span>
        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <input
            type="range"
            min="10"
            max="300"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10" 
            />
            <div className="h-full bg-slate-600 relative" style={{ width: '100%' }}></div>
        </div>
        <input
          type="range"
          min="10"
          max="300"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
      </div>
    </div>
  );
};

export default WaveformEditor;