import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import WaveformEditor from './components/WaveformEditor';
import PadGrid from './components/PadGrid';
import { analyzeAudioAndGetSlices } from './services/geminiService';
import { fileToBase64 } from './utils/audioHelper';
import { ProcessingStatus, SliceResponse } from './types';

const App: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [slices, setSlices] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveformReady, setWaveformReady] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>({ isProcessing: false, message: '' });
  const [metaData, setMetaData] = useState<{ bpm?: number; genre?: string }>({});

  // Handle File Upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Immediately reset readiness and playing state
      setWaveformReady(false);
      setIsPlaying(false);
      
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setAudioFile(file);
      setSlices([]); // Reset slices for new file
      setMetaData({});
      
      setStatus({ isProcessing: true, message: 'Initializing audio stream...' });
    }
  }, []);

  // Handle Auto Chop (Gemini API)
  const handleAutoChop = useCallback(async () => {
    if (!audioFile) return;

    setStatus({ isProcessing: true, message: 'Extracting audio signature...' });

    try {
      // 1. Convert File to Base64
      const base64Audio = await fileToBase64(audioFile);
      
      setStatus({ isProcessing: true, message: 'Gemini analysis in progress...' });
      
      // 2. Call Gemini Service
      const result: SliceResponse = await analyzeAudioAndGetSlices(base64Audio, audioFile.type);
      
      // 3. Apply Results
      if (result.slices && result.slices.length > 0) {
        // Ensure unique and sorted slices
        const uniqueSlices = Array.from(new Set(result.slices)).sort((a, b) => a - b);
        setSlices(uniqueSlices);
        setMetaData({ bpm: result.bpm, genre: result.genre });
        setStatus({ isProcessing: false, message: 'Analysis complete' });
      } else {
        throw new Error("No slices identified.");
      }

    } catch (error) {
      console.error(error);
      setStatus({ isProcessing: false, message: 'Analysis failed' });
      alert("Failed to analyze audio. Please try a shorter clip or different file.");
    }
  }, [audioFile]);

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (isWaveformReady) {
      window.dispatchEvent(new CustomEvent('beatslicer:toggle-play'));
    }
  };

  return (
    <div className="min-h-screen technical-grid flex flex-col font-sans text-zinc-50 selection:bg-blue-500/30">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8 relative">
        
        {/* Hero / Instructions */}
        {!audioUrl && (
           <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in slide-in-from-bottom-5 duration-700">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full opacity-50"></div>
                <h2 className="relative text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                  BEAT<span className="text-blue-500">SLICER</span>
                </h2>
              </div>
              <p className="text-lg text-zinc-400 max-w-xl text-center font-light leading-relaxed">
                Upload audio. Deconstruct rhythm. <br/>
                <span className="font-mono text-sm text-blue-400">AI-Powered Sample Architecture.</span>
              </p>
           </div>
        )}

        {/* Editor Area */}
        <div className={`transition-all duration-700 ease-out ${audioUrl ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 hidden'}`}>
           <WaveformEditor 
              audioUrl={audioUrl} 
              slices={slices}
              onSlicesChange={setSlices}
              onReady={() => {
                setWaveformReady(true);
                setStatus({ isProcessing: false, message: '' });
              }}
              onPlayPause={setIsPlaying}
           />
        </div>

        {/* Controls */}
        <ControlPanel 
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onAutoChop={handleAutoChop}
          onClearSlices={() => setSlices([])}
          onFileUpload={handleFileUpload}
          status={status}
          hasAudio={!!audioUrl}
          isWaveformReady={isWaveformReady}
          bpm={metaData.bpm}
          genre={metaData.genre}
        />

        {/* Pads (Only show if audio is loaded) */}
        {audioUrl && (
          <div className="animate-in slide-in-from-bottom-5 duration-500 delay-150 pb-20">
             <PadGrid 
                slices={slices}
                hasAudio={!!audioUrl}
                isWaveformReady={isWaveformReady}
             />
          </div>
        )}
      
      </main>
    </div>
  );
};

export default App;