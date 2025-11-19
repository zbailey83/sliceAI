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
      
      setStatus({ isProcessing: true, message: 'Loading audio...' });
    }
  }, []);

  // Handle Auto Chop (Gemini API)
  const handleAutoChop = useCallback(async () => {
    if (!audioFile) return;

    setStatus({ isProcessing: true, message: 'Extracting audio data...' });

    try {
      // 1. Convert File to Base64
      const base64Audio = await fileToBase64(audioFile);
      
      setStatus({ isProcessing: true, message: 'Gemini is listening & analyzing...' });
      
      // 2. Call Gemini Service
      const result: SliceResponse = await analyzeAudioAndGetSlices(base64Audio, audioFile.type);
      
      // 3. Apply Results
      if (result.slices && result.slices.length > 0) {
        // Ensure unique and sorted slices
        const uniqueSlices = Array.from(new Set(result.slices)).sort((a, b) => a - b);
        setSlices(uniqueSlices);
        setMetaData({ bpm: result.bpm, genre: result.genre });
        setStatus({ isProcessing: false, message: 'Complete!' });
      } else {
        throw new Error("No slices identified.");
      }

    } catch (error) {
      console.error(error);
      setStatus({ isProcessing: false, message: 'Error analyzing audio.' });
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
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Hero / Instructions */}
        {!audioUrl && (
           <div className="text-center py-20 space-y-4 animate-in slide-in-from-bottom-10 duration-700">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                Sample. Slice. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Create.</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Upload an MP3. Let Gemini AI listen to the groove and automatically chop it into perfect loops and one-shots.
              </p>
           </div>
        )}

        {/* Editor Area */}
        <div className={`transition-all duration-500 ${audioUrl ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 hidden'}`}>
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
          <div className="animate-in slide-in-from-bottom-5 duration-500 delay-150">
             <PadGrid 
                slices={slices}
                hasAudio={!!audioUrl}
                isWaveformReady={isWaveformReady}
             />
          </div>
        )}
      
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/10 blur-[120px]"></div>
      </div>

    </div>
  );
};

export default App;