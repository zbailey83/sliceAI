import React from 'react';
import { Play, Pause, Trash2, Wand2, Upload } from 'lucide-react';
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
    <div className="w-full max-w-5xl mx-auto mt-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (hasAudio && isWaveformReady) {
                onPlayPause();
              }
            }}
            disabled={!hasAudio || !isWaveformReady}
            className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 ${
              !hasAudio || !isWaveformReady
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : isPlaying 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                  : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Track Info</span>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-200 font-mono text-sm">
                {bpm ? `${Math.round(bpm)} BPM` : '-- BPM'}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-400 font-mono text-xs uppercase">
                {genre || 'Unknown Genre'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Status / Upload */}
        <div className="flex-1 flex justify-center">
            {!hasAudio ? (
                <label className="cursor-pointer group relative">
                    <div className="flex items-center gap-3 px-8 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 border-dashed hover:border-cyan-500/50 rounded-xl transition-all duration-300">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">Upload MP3 / WAV</span>
                    </div>
                    <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={onFileUpload} 
                        className="hidden" 
                    />
                </label>
            ) : (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                     {status.isProcessing ? (
                        <div className="flex items-center gap-3 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                            <span className="text-xs font-medium text-indigo-300 ml-2">{status.message}</span>
                        </div>
                     ) : (
                        <div className="text-center">
                            <p className="text-xs text-slate-500 mb-1">Gemini AI Ready</p>
                            <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full mx-auto"></div>
                        </div>
                     )}
                </div>
            )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* New File Upload Button (Visible only when audio is loaded) */}
          {hasAudio && (
            <label className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors cursor-pointer" title="Upload New File">
                <Upload className="w-5 h-5" />
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
            className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30"
            title="Clear Slices"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <button
            onClick={onAutoChop}
            disabled={!hasAudio || status.isProcessing || !isWaveformReady}
            className={`
              relative group flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200
              ${!hasAudio || status.isProcessing || !isWaveformReady
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/20'}
            `}
          >
            <Wand2 className={`w-4 h-4 ${status.isProcessing ? 'animate-spin' : ''}`} />
            <span>{status.isProcessing ? 'Thinking...' : 'Auto Chop'}</span>
            
            {!status.isProcessing && hasAudio && isWaveformReady && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;