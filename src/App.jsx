import React, { useState } from 'react';
import imglyRemoveBackground from '@imgly/background-removal';
import { Upload, Image as ImageIcon, Download, RefreshCw, Sparkles, Instagram } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setProcessedImage(null);
    }
  };

  const removeBackground = async () => {
    if (!image) return;
    setLoading(true);
    setStatusText('Downloading AI engine models locally...');
    
    try {
      // Fetches the pre-trained neural network straight into the user's browser memory
      const blob = await imglyRemoveBackground(image, {
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setStatusText(`Analyzing structural edges: ${percent}%`);
        }
      });
      
      const resultUrl = URL.createObjectURL(blob);
      setProcessedImage(resultUrl);
    } catch (error) {
      console.error("AI processing error:", error);
      alert("Failed to process image. Make sure your device has hardware acceleration turned on.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'yellow_studios_removed_bg.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between">
      
      {/* Top Brand Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-black text-xl tracking-tight">
          <span className="bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles size={18} strokeWidth={2.5} />
          </span>
          <span>AI Background Remover</span>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          100% Free & Unlimited
        </span>
      </header>

      {/* Main Studio Workbench Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center items-center">
        
        {!image ? (
          /* Empty Upload State Box */
          <label className="w-full max-w-xl aspect-video border-2 border-dashed border-slate-700 hover:border-orange-500 bg-slate-950/40 rounded-[32px] flex flex-col items-center justify-center p-6 cursor-pointer group transition-all duration-300 shadow-2xl">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <div className="bg-slate-800 p-4 rounded-2xl text-slate-400 group-hover:scale-110 group-hover:text-orange-400 transition-all shadow-md mb-4">
              <Upload size={28} />
            </div>
            <h3 className="font-bold text-base text-slate-200 mb-1">Upload your photo</h3>
            <p className="text-xs text-slate-500 text-center max-w-xs">Supports JPG, PNG, and WebP files. Processing runs completely on your device.</p>
          </label>
        ) : (
          /* Processing Workspace Grid */
          <div className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              
              {/* Left Panel: Original Image Preview */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-[28px] p-4 flex flex-col items-center justify-center aspect-square relative overflow-hidden group">
                <p className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-slate-700 text-slate-400 z-10">Original</p>
                <img src={image} alt="Original" className="max-h-full max-w-full object-contain rounded-xl shadow-lg" />
              </div>

              {/* Right Panel: Clean Output Image Preview */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-[28px] p-4 flex flex-col items-center justify-center aspect-square relative overflow-hidden min-h-[300px]">
                <p className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-slate-700 text-slate-400 z-10">Transparent Result</p>
                
                {loading ? (
                  <div className="text-center space-y-4 px-6">
                    <div className="w-10 h-10 border-4 border-slate-800 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-orange-400 animate-pulse tracking-wide">{statusText}</p>
                  </div>
                ) : processedImage ? (
                  /* Checkerboard background transparent grid texture style simulator */
                  <div className="w-full h-full rounded-xl flex items-center justify-center bg-[linear-gradient(45deg,#20293a_25%,transparent_25%),linear-gradient(-45deg,#20293a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#20293a_75%),linear-gradient(-45deg,transparent_75%,#20293a_75)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0] p-2">
                    <img src={processedImage} alt="Processed" className="max-h-full max-w-full object-contain drop-shadow-2xl" />
                  </div>
                ) : (
                  <div className="text-center text-slate-600">
                    <ImageIcon size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">Click the button below to extract object layers</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Interaction Controls Panel */}
            <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-950/30 border border-slate-800/60 p-4 rounded-2xl max-w-xl mx-auto w-full">
              <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 rounded-xl font-bold text-xs cursor-pointer transition-colors border border-slate-700">
                <RefreshCw size={14} /> Change Photo
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              {!processedImage ? (
                <button
                  onClick={removeBackground}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-orange-500/10 disabled:shadow-none disabled:border disabled:border-slate-700/50"
                >
                  <Sparkles size={14} /> {loading ? 'Processing...' : 'Remove Background'}
                </button>
              ) : (
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-xl shadow-emerald-500/10"
                >
                  <Download size={14} /> Download PNG
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Structured Yellow sTudios Core Footer Branding */}
      <footer className="p-4 border-t border-slate-800/60 bg-slate-950/20 text-center text-slate-500 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-slate-400">
          <div className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-[10px]">Y</div>
          <span>Founded by Rajesh | Yellow Studios</span>
        </div>
        <a href="https://instagram.com/notrazx" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-pink-500 transition-colors">
          <Instagram size={14} />
          <span>@notrazx</span>
        </a>
      </footer>

    </div>
  );
}
