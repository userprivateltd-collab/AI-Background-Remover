import React, { useState, useRef } from 'react';
import imglyRemoveBackground from '@imgly/background-removal';
import { Upload, Download, RefreshCw, Sparkles, Image as ImageIcon, Terminal } from 'lucide-react';

export default function App() {
  const [imageFile, setImageFile] = useState(null);     
  const [imagePreview, setImagePreview] = useState(null); 
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      addLog(`[System] File selected: ${file.name} (${file.type})`);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setProcessedImage(null);
      setProgress(0);
      setLogs([]); 
    }
  };

  const processImage = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    setProgress(1); // Force state visually to show initialization instantly
    setStatusText('Spinning up WASM Worker...');
    addLog('[Action] "Remove Background" button tapped.');

    try {
      addLog('[Config] Initializing AI Engine and parsing parameters...');
      
      const config = {
        // Option A (Recommended): Use local public assets path to bypass cross-origin restrictions
        publicPath: `${window.location.origin}/modelfiles/`, 
        
        // Option B (Fallback): If using CDN, crossOrigin must be allowed on standard configurations
        // publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.5.5/dist/",
        
        fetchArgs: {
          mode: 'cors'
        },
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setProgress(percent);
          
          addLog(`[AI Engine] Working... ${percent}%`);

          if (percent < 30) setStatusText('Downloading AI Models (First time only)...');
          else if (percent < 70) setStatusText('Analyzing foreground boundaries...');
          else setStatusText('Refining transparent edges...');
        }
      };

      addLog('[Execution] Passing raw file to WebAssembly Worker...');
      
      // Call with safe fallback execution parameter check
      const blob = await imglyRemoveBackground(imageFile, config);
      
      addLog('[Execution] AI finished successfully. Generating PNG...');
      const resultUrl = URL.createObjectURL(blob);
      
      setProcessedImage(resultUrl);
      setStatusText('Complete!');
      addLog('[Success] Background removed!');
      
    } catch (error) {
      addLog(`[CRITICAL ERROR] ${error.message || "Execution setup failure"}`);
      console.error("Detailed Error Logs:", error);
      setStatusText('Processing Failed.');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'studio_transparent.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('[Action] Image downloaded to device.');
  };

  const resetWorkspace = () => {
    setImageFile(null);
    setImagePreview(null);
    setProcessedImage(null);
    setProgress(0);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F1F1F] font-sans flex flex-col">
      <header className="h-16 bg-white border-b border-[#C4C7C5] px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 font-medium text-lg">
          <div className="bg-[#E8F0FE] text-[#0B57D0] p-2 rounded-lg">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight">Studio Tools</span>
        </div>
        <div className="bg-[#E8F0FE] text-[#0B57D0] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          Diagnostic Build
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        <div className="bg-white rounded-[24px] shadow-md p-6 md:p-10 w-full border border-[#E3E3E3]">
          {!imagePreview ? (
            <label className="border-2 border-dashed border-[#C4C7C5] hover:border-[#0B57D0] bg-[#FDFDFD] rounded-[24px] p-12 md:p-16 flex flex-col items-center justify-center cursor-pointer transition-all group">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="bg-[#E8F0FE] text-[#0B57D0] w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <Upload size={28} />
              </div>
              <h3 className="font-bold text-lg mb-1">Upload an image</h3>
              <p className="text-[#444746] text-sm text-center">Tap to browse JPG, PNG, or WebP</p>
            </label>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Window */}
                <div className="bg-[#F8F9FA] rounded-[16px] border border-[#E3E3E3] p-4 aspect-square flex items-center justify-center relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-white/90 text-[#444746] text-[10px] font-bold uppercase px-3 py-1 rounded-md">Original</span>
                  <img src={imagePreview} alt="Original" className="max-w-full max-h-full object-contain rounded-lg" />
                </div>

                {/* Result Window */}
                <div className="bg-[#F8F9FA] rounded-[16px] border border-[#E3E3E3] p-4 aspect-square flex items-center justify-center relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-white/90 text-[#444746] text-[10px] font-bold uppercase px-3 py-1 rounded-md z-10">Result</span>
                  
                  {isProcessing ? (
                    <div className="w-full max-w-[80%] space-y-4 bg-white p-6 rounded-2xl shadow border border-[#E3E3E3]">
                      <div className="flex justify-between text-xs font-bold text-[#0B57D0] mb-2">
                        <span>{statusText}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#E8F0FE] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0B57D0] rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  ) : processedImage ? (
                    <div className="w-full h-full rounded-lg flex items-center justify-center bg-[linear-gradient(45deg,#E3E3E3_25%,transparent_25%),linear-gradient(-45deg,#E3E3E3_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#E3E3E3_75%),linear-gradient(-45deg,transparent_75%,#E3E3E3_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0]">
                      <img src={processedImage} alt="Transparent" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                    </div>
                  ) : (
                    <div className="text-[#444746] flex flex-col items-center">
                      <ImageIcon size={32} className="opacity-50 mb-2" />
                      <p className="text-sm font-medium">Click Process to Begin</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button onClick={resetWorkspace} disabled={isProcessing} className="px-6 py-3 rounded-full border border-[#C4C7C5] font-bold text-sm hover:bg-[#F8F9FA] disabled:opacity-50 transition-colors flex items-center gap-2">
                  <RefreshCw size={18} /> Start Over
                </button>

                {!processedImage ? (
                  <button onClick={processImage} disabled={isProcessing} className="px-8 py-3 rounded-full bg-[#0B57D0] text-white font-bold text-sm hover:bg-[#0842A0] disabled:bg-slate-400 transition-colors flex items-center gap-2 shadow-lg">
                    <Sparkles size={18} /> {isProcessing ? 'Working...' : 'Remove Background'}
                  </button>
                ) : (
                  <button onClick={triggerDownload} className="px-8 py-3 rounded-full bg-[#146C2E] text-white font-bold text-sm hover:bg-[#0F5323] transition-colors flex items-center gap-2 shadow-lg">
                    <Download size={18} /> Download Image
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- LIVE DIAGNOSTIC TERMINAL --- */}
        <div className="bg-[#1F1F1F] rounded-xl p-4 w-full shadow-inner border border-slate-700 font-mono text-xs overflow-hidden flex flex-col h-48">
          <div className="flex items-center gap-2 text-slate-400 mb-2 pb-2 border-b border-slate-800">
            <Terminal size={14} />
            <span className="font-bold tracking-widest uppercase text-[10px]">System Diagnostics</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-emerald-400">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">Awaiting actions...</p>
            ) : (
              logs.map((log, i) => (
                <p key={i}>
                  <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  <span className={log.includes('ERROR') ? 'text-red-400 font-bold' : ''}>{log}</span>
                </p>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
