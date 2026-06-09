import React, { useState, useEffect, useRef } from 'react';
import imglyRemoveBackground from '@imgly/background-removal';
import { Upload, Download, RefreshCw, ShieldCheck, Info, Sparkles, Image as ImageIcon, AlertTriangle } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null); // New Error State
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Prevent double-firing in React Strict Mode
    if (image && !processedImage && !isProcessing && !errorMessage) {
      processImage(image);
    }
  }, [image]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setProcessedImage(null);
      setProgress(0);
      setErrorMessage(null);
    }
  };

  const processImage = async (imageUrl) => {
    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);
    setStatusText('Connecting to AI Engine...');

    try {
      // THE FIX: The official static data path for the AI models
      const config = {
        publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.5.5/dist/",
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setProgress(percent);
          
          if (percent < 30) setStatusText('Downloading AI Models (First time only)...');
          else if (percent < 70) setStatusText('Analyzing foreground boundaries...');
          else setStatusText('Refining transparent edges...');
        }
      };

      const blob = await imglyRemoveBackground(imageUrl, config);
      const resultUrl = URL.createObjectURL(blob);
      
      setProcessedImage(resultUrl);
      setStatusText('Complete!');
    } catch (error) {
      console.error("AI Processing Error:", error);
      // Display the exact error to the user so we aren't guessing
      setErrorMessage(error.message || "The AI engine failed to load. Please check your internet connection.");
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const triggerDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'yellow_studios_transparent.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetWorkspace = () => {
    setImage(null);
    setProcessedImage(null);
    setProgress(0);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F1F1F] font-sans flex flex-col selection:bg-blue-200">
      
      <header className="h-16 bg-white border-b border-[#C4C7C5] px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 font-medium text-lg">
          <div className="bg-[#E8F0FE] text-[#0B57D0] p-2 rounded-lg">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight">Studio Tools</span>
        </div>
        <div className="bg-[#E8F0FE] text-[#0B57D0] px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          100% Free
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        <div className="bg-white rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 md:p-10 w-full border border-[#E3E3E3]">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-medium text-[#1F1F1F] mb-2">Remove Image Background</h1>
            <p className="text-[#444746] text-sm">Automatic, instant, and completely private.</p>
          </div>

          {!image ? (
            <label className="border-2 border-dashed border-[#C4C7C5] hover:border-[#0B57D0] bg-[#FDFDFD] hover:bg-[#F4F7FC] rounded-[24px] p-12 md:p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group shadow-inner">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="bg-[#E8F0FE] text-[#0B57D0] w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                <Upload size={28} />
              </div>
              <h3 className="font-bold text-lg mb-1">Upload an image</h3>
              <p className="text-[#444746] text-sm text-center">Tap to browse JPG, PNG, or WebP</p>
            </label>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Original Image */}
                <div className="bg-[#F8F9FA] rounded-[16px] border border-[#E3E3E3] p-4 aspect-square flex items-center justify-center relative overflow-hidden shadow-inner">
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#444746] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm">Original</span>
                  <img src={image} alt="Original" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                </div>

                {/* Result Window */}
                <div className="bg-[#F8F9FA] rounded-[16px] border border-[#E3E3E3] p-4 aspect-square flex items-center justify-center relative overflow-hidden shadow-inner">
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#444746] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm z-10">Result</span>
                  
                  {errorMessage ? (
                    /* The Error Screen */
                    <div className="w-full max-w-[80%] bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col items-center text-center">
                      <AlertTriangle className="text-red-500 mb-2" size={32} />
                      <h4 className="font-bold text-red-700 text-sm mb-1">Processing Failed</h4>
                      <p className="text-red-600 text-xs">{errorMessage}</p>
                    </div>
                  ) : isProcessing ? (
                    /* The Loading Screen */
                    <div className="w-full max-w-[80%] space-y-4 px-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-[#E3E3E3]">
                      <div className="flex justify-between text-xs font-bold text-[#0B57D0] mb-2">
                        <span>{statusText}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#E8F0FE] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0B57D0] rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : processedImage ? (
                    /* The Success Screen */
                    <div className="w-full h-full rounded-lg flex items-center justify-center bg-[linear-gradient(45deg,#E3E3E3_25%,transparent_25%),linear-gradient(-45deg,#E3E3E3_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#E3E3E3_75%),linear-gradient(-45deg,transparent_75%,#E3E3E3_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0]">
                      <img src={processedImage} alt="Transparent" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button 
                  onClick={resetWorkspace}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-full border border-[#C4C7C5] text-[#1F1F1F] font-bold text-sm hover:bg-[#F8F9FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={18} /> Start Over
                </button>

                {processedImage && (
                  <button
                    onClick={triggerDownload}
                    className="px-8 py-3 rounded-full bg-[#0B57D0] text-white font-bold text-sm hover:bg-[#0842A0] transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <Download size={18} /> Download Image
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E3E3E3] hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-[#0B57D0] mb-3">
              <ShieldCheck size={20} />
              <h3 className="font-bold text-lg text-[#1F1F1F]">100% Privacy First</h3>
            </div>
            <p className="text-[#444746] text-sm leading-relaxed">
              Unlike other cloud-based tools, this application utilizes WebAssembly to process your images <strong>directly on your own device</strong>. Your photos are never uploaded to any external servers, ensuring absolute data privacy.
            </p>
          </div>

          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E3E3E3] hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-[#0B57D0] mb-3">
              <Info size={20} />
              <h3 className="font-bold text-lg text-[#1F1F1F]">Open Source Engine</h3>
            </div>
            <p className="text-[#444746] text-sm leading-relaxed mb-3">
              Powered by the <a href="https://github.com/imgly/background-removal-js" target="_blank" rel="noreferrer" className="text-[#0B57D0] font-bold hover:underline">@imgly/background-removal</a> library under the Dual License model. 
            </p>
            <p className="text-xs text-[#747775]">
              UI and Application layer © 2026 Yellow sTudios. Released under the MIT License for educational and utility purposes.
            </p>
          </div>
        </div>

      </main>

      <footer className="py-6 text-center text-[#444746] text-sm font-medium border-t border-[#E3E3E3] bg-white mt-auto">
        <p>Founded by Rajesh | Yellow sTudios</p>
        <a href="https://instagram.com/notrazx" target="_blank" rel="noreferrer" className="text-[#0B57D0] hover:underline mt-1 inline-block">@notrazx</a>
      </footer>
    </div>
  );
}
