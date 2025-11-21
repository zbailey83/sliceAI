import React, { useState, useCallback, useEffect } from 'react';
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
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply Theme Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

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
        // Filter out duplicates and sort
        let uniqueSlices = Array.from(new Set(result.slices)).sort((a, b) => a - b);
        
        // Defensive: Ensure the first slice is exactly 0.0
        if (Math.abs(uniqueSlices[0] - 0) > 0.001) {
            uniqueSlices.unshift(0);
        } else {
            uniqueSlices[0] = 0;
        }

        // Limit to 16 slices for the pads
        if (uniqueSlices.length > 16) {
            uniqueSlices = uniqueSlices.slice(0, 16);
        }

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
    <div className="min-h-screen technical-grid flex flex-col font-sans text-zinc-900 dark:text-zinc-50 selection:bg-blue-500/30 transition-colors duration-300">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8 relative">
        
        {/* Hero / Instructions */}
        {!audioUrl && (
           <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in slide-in-from-bottom-5 duration-700">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full opacity-50"></div>
                <h2 className="relative text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
                  REDACT⚔️<span className="text-blue-600 dark:text-blue-500">SLICE AI</span>
                </h2>
              </div>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl text-center font-light leading-relaxed">
                Upload // Slice // Get REDACTED.<br/>
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">AI-Powered Sample Architecture.</span>
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
              isDarkMode={isDarkMode}
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