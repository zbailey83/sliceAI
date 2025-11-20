import React from 'react';
import { Play, Pause, Trash2, Wand2, Upload, Disc, Mic2 } from 'lucide-react';
import { ProcessingStatus } from '../types';

interface ControlPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onAutoChop: () => void;
  onClearSlices: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  status: ProcessingStatus;
  hasAudio: boolean;
  isWaveformReady: boolean;
  bpm?: number;
  genre?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  onPlayPause,
  onAutoChop,
  onClearSlices,
  onFileUpload,
  status,
  hasAudio,
  isWaveformReady,
  bpm,
  genre
}) => {
  return (
    <div className="w-full bg-zinc-900/30 border border-dashed border-zinc-700 rounded-xl backdrop-blur-sm p-6 relative group">
      
      {/* Decorative Corners */}
      <div className="absolute -top-px -left-px w-4 h-4 border-t border-l border-zinc-500 opacity-50"></div>
      <div className="absolute -top-px -right-px w-4 h-4 border-t border-r border-zinc-500 opacity-50"></div>
      <div className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-zinc-500 opacity-50"></div>
      <div className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-zinc-500 opacity-50"></div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Left: Transport & Info */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={() => {
              if (hasAudio && isWaveformReady) {
                onPlayPause();
              }
            }}
            disabled={!hasAudio || !isWaveformReady}
            className={`w-12 h-12 flex items-center justify-center rounded border transition-all duration-200 ${
              !hasAudio || !isWaveformReady
                ? 'bg-zinc-900 border-zinc-800 text-zinc-700 cursor-not-allowed'
                : isPlaying 
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-zinc-100'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Analysis Data</div>
            <div className="flex items-center gap-4 font-mono text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <Disc className="w-3.5 h-3.5 text-zinc-500" />
                {bpm ? `${Math.round(bpm)} BPM` : '---'}
              </div>
              <div className="w-px h-4 bg-zinc-800"></div>
              <div className="flex items-center gap-2 text-zinc-300 uppercase">
                <Mic2 className="w-3.5 h-3.5 text-zinc-500" />
                {genre || '---'}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Status / Primary Upload */}
        <div className="flex-1 flex justify-center w-full md:w-auto">
            {!hasAudio ? (
                <label className="cursor-pointer group/upload relative w-full md:w-auto">
                    <div className="flex items-center justify-center gap-3 px-8 py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-700 border-dashed hover:border-blue-500/50 rounded transition-all duration-300">
                        <Upload className="w-4 h-4 text-zinc-400 group-hover/upload:text-blue-400 transition-colors" />
                        <span className="text-sm font-medium text-zinc-400 group-hover/upload:text-zinc-200">Select Audio Source</span>
                    </div>
                    <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={onFileUpload} 
                        className="hidden" 
                    />
                </label>
            ) : (
                <div className="flex flex-col items-center min-w-[200px]">
                     {status.isProcessing ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-1 h-4 bg-blue-500 animate-[pulse_1s_ease-in-out_infinite]"></div>
                              <div className="w-1 h-4 bg-blue-500 animate-[pulse_1s_ease-in-out_0.2s_infinite]"></div>
                              <div className="w-1 h-4 bg-blue-500 animate-[pulse_1s_ease-in-out_0.4s_infinite]"></div>
                            </div>
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">{status.message}</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded border border-zinc-800 bg-zinc-900/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">Ready</span>
                        </div>
                     )}
                </div>
            )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* New File Upload Button */}
          {hasAudio && (
            <label className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded transition-all cursor-pointer" title="New Upload">
                <Upload className="w-4 h-4" />
                <input 
                    type="file" 
                    accept="audio/*" 
                    onChange={onFileUpload} 
                    className="hidden" 
                />
            </label>
          )}

          <button
            onClick={onClearSlices}
            disabled={!hasAudio || status.isProcessing}
            className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded transition-all disabled:opacity-30"
            title="Clear Slices"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onAutoChop}
            disabled={!hasAudio || status.isProcessing || !isWaveformReady}
            className={`
              relative flex items-center gap-2 px-6 py-2.5 rounded font-medium text-sm transition-all duration-200 border
              ${!hasAudio || status.isProcessing || !isWaveformReady
                ? 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 hover:border-blue-400 shadow-lg shadow-blue-900/20'}
            `}
          >
            <Wand2 className={`w-4 h-4 ${status.isProcessing ? 'animate-spin' : ''}`} />
            <span>Auto Chop</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;