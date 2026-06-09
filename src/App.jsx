import React, { useState } from 'react';
import imglyRemoveBackground from '@imgly/background-removal';

function App() {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setProcessing(true);
    setResultImage(null);

    try {
      // Pass the cloud CDN URL directly in the configuration object
      const blob = await imglyRemoveBackground(file, {
        publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.5.5/dist/"
      });
      
      const resultUrl = URL.createObjectURL(blob);
      setResultImage(resultUrl);
    } catch (error) {
      console.error("Background removal failed:", error);
      alert("Failed to remove background. Check console for details.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>AI Background Remover</h2>
      
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        {image && (
          <div>
            <h3>Original Image</h3>
            <img src={image} alt="Original" style={{ maxWidth: '300px', maxHeight: '300px' }} />
          </div>
        )}
        
        {resultImage && (
          <div>
            <h3>Background Removed</h3>
            <img src={resultImage} alt="Result" style={{ maxWidth: '300px', maxHeight: '300px' }} />
          </div>
        )}
      </div>

      {processing && <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#007ece' }}>Processing image with AI models... Please wait...</p>}
    </div>
  );
}

export default App;
