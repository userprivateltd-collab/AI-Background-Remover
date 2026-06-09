import React, { useState, useRef } from 'react';
import imglyRemoveBackground from '@imgly/background-removal';
import { Upload, Download, RefreshCw, ShieldCheck, Info, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setProcessedImage(null);
      setProgress(0);
    }
  };

  const processImage = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusText('Initializing AI Model...');

    try {
      const blob = await imglyRemoveBackground(image, {
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setProgress(percent);
          if (percent < 50) setStatusText('Fetching neural network assets...');
          else if (percent < 90) setStatusText('Analyzing foreground boundaries...');
          else setStatusText('Refining transparent edges...');
        }
      });
      
      const resultUrl = URL.createObjectURL(blob);
      setProcessedImage(resultUrl);
      setStatusText('Complete!');
    } catch (error) {
      console.error("Processing failed:", error);
      alert("Failed to process image. Please try a different photo or check your browser settings.");
    } finally {
      setIsProcessing(false);
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F1F1F] font-sans flex flex-col selection:bg-blue-200">
      
      {/* Material Header */}
      <header className="h-16 bg-white border-b border-[#C4C7C5] px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 font-medium text-lg">
          <div className="bg-[#E8F0FE] text-[#0B57D0] p-2 rounded-lg">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <span>Studio Tools</span>
        </div>
        <div className="bg-[#E8F0FE] text-[#0B57D0] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          100% Free
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        {/* Main Workspace Card */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-6 md:p-10 w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-normal text-[#1F1F1F] mb-2">Remove Image Background</h1>
            <p className="text-[#444746] text-sm">Automatic, free, and completely private.</p>
          </div>

          {!image ? (
            /* Upload Dropzone */
            <label className="border-2 border-dashed border-[#C4C7C5] hover:border-[#0B57D0] bg-[#FDFDFD] hover:bg-[#F4F7FC] rounded-[24px] p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="bg-[#E8F0FE] text-[#0B57D0] w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Upload size={28} />
              </div>
              <h3 className="font-medium text-lg mb-1">Upload an image</h3>
              <p className="text-[#444746] text-sm">JPG, PNG, or WebP</p>
            </label>
          ) : (
            /* Processing Workbench */
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Original Image */}
                <div className="bg-[#F8F9FA] rounded-[16px] border border-[#E3E3E3] p-4 aspect-square flex items-center justify-center relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#444746] text-xs font-bold uppercase px-3 py-1 rounded-md shadow-sm">Original</span>
                  <img src={image} alt="Original" className="max-w-full max-h-full object-contain rounded-lg" />
                </div>

                {/* Result Window */}
                <div className="bg-[#F8F9FA] rounded-[16px] border border-[#E3E3E3] p-4 aspect-square flex items-center justify-center relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#444746] text-xs font-bold uppercase px-3 py-1 rounded-md shadow-sm z-10">Result</span>
                  
                  {isProcessing ? (
                    <div className="w-full max-w-xs space-y-4 px-4">
                      <div className="flex justify-between text-xs font-medium text-[#444746] mb-1">
                        <span>{statusText}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#E3E3E3] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0B57D0] rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : processedImage ? (
                    <div className="w-full h-full rounded-lg flex items-center justify-center bg-[linear-gradient(45deg,#E3E3E3_25%,transparent_25%),linear-gradient(-45deg,#E3E3E3_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#E3E3E3_75%),linear-gradient(-45deg,transparent_75%,#E3E3E3_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0]">
                      <img src={processedImage} alt="Transparent" className="max-w-full max-h-full object-contain drop-shadow-xl" />
                    </div>
                  ) : (
                    <div className="text-[#444746] flex flex-col items-center">
                      <ImageIcon size={32} className="opacity-50 mb-2" />
                      <p className="text-sm">Ready to process</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 rounded-full border border-[#C4C7C5] text-[#1F1F1F] font-medium hover:bg-[#F8F9FA] transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={18} /> New Photo
                </button>

                {!processedImage ? (
                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="px-8 py-2.5 rounded-full bg-[#0B57D0] text-white font-medium hover:bg-[#0842A0] disabled:bg-[#E3E3E3] disabled:text-[#444746] transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={18} /> {isProcessing ? 'Processing...' : 'Remove Background'}
                  </button>
                ) : (
                  <button
                    onClick={triggerDownload}
                    className="px-8 py-2.5 rounded-full bg-[#146C2E] text-white font-medium hover:bg-[#0F5323] transition-colors flex items-center gap-2 shadow-md"
                  >
                    <Download size={18} /> Download Image
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* About & License Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E3E3E3]">
            <div className="flex items-center gap-2 text-[#0B57D0] mb-3">
              <ShieldCheck size={20} />
              <h3 className="font-medium text-lg text-[#1F1F1F]">Privacy First</h3>
            </div>
            <p className="text-[#444746] text-sm leading-relaxed">
              Unlike other cloud-based tools, this application
