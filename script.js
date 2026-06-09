// ============================================================================
// AI Background Remover - WORKING VERSION
// ============================================================================

let appState = {
  isProcessing: false,
  originalCanvas: null,
  resultCanvas: null
};

// Initialize when DOM is ready
window.addEventListener('load', function() {
  console.log('PAGE LOADED - Setting up event listeners');
  setupEventListeners();
});

function setupEventListeners() {
  const fileInput = document.getElementById('file-upload');
  const uploadZone = document.getElementById('upload-zone');

  if (!fileInput) {
    console.error('❌ file-upload element not found');
    return;
  }

  console.log('✅ File input found:', fileInput);
  console.log('✅ Upload zone found:', uploadZone);

  // File input change event
  fileInput.addEventListener('change', function(e) {
    console.log('FILE SELECTED EVENT FIRED');
    if (e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  });

  // Drag and drop
  if (uploadZone) {
    uploadZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', function() {
      uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) {
        console.log('FILE DROPPED EVENT FIRED');
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
  }
}

async function handleFileSelect(file) {
  console.log('📁 File selected:', file.name, file.size, 'bytes');

  // Validate
  if (!file.type.startsWith('image/')) {
    showError('Please select an image file');
    return;
  }

  // Start processing
  await processImage(file);
}

async function processImage(file) {
  if (appState.isProcessing) {
    console.log('Already processing...');
    return;
  }

  appState.isProcessing = true;
  
  try {
    console.log('🚀 Starting processing...');
    
    // Hide upload, show progress
    document.getElementById('upload-zone').style.display = 'none';
    document.getElementById('action-row').style.display = 'none';
    document.getElementById('progress-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('download-row').style.display = 'none';

    // Step 1: Load image
    updateProgress(10, 'Loading image...');
    const imageBitmap = await loadImage(file);
    console.log('✅ Image loaded:', imageBitmap.width, 'x', imageBitmap.height);
    
    // Step 2: Store original
    updateProgress(20, 'Preparing canvas...');
    appState.originalCanvas = createCanvasFromBitmap(imageBitmap);

    // Step 3: Remove background
    updateProgress(40, 'Removing background...');
    const resultCanvas = await removeBackground(imageBitmap);
    appState.resultCanvas = resultCanvas;
    console.log('✅ Background removed');

    // Step 4: Display results
    updateProgress(90, 'Displaying results...');
    displayResults(appState.originalCanvas, resultCanvas);

    updateProgress(100, 'Complete!');
    await sleep(500);

    // Show results
    document.getElementById('progress-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('download-row').style.display = 'flex';
    
    console.log('✅ ALL DONE!');

  } catch (error) {
    console.error('❌ ERROR:', error.message, error);
    showError('Error: ' + error.message);
    resetUI();
  } finally {
    appState.isProcessing = false;
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        createImageBitmap(img)
          .then(resolve)
          .catch(reject);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function createCanvasFromBitmap(imageBitmap) {
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0);
  return canvas;
}

async function removeBackground(imageBitmap) {
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(imageBitmap, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  console.log('Processing', canvas.width, 'x', canvas.height);

  // Detect background color from edges
  const bgColor = getBackgroundColor(data, canvas.width, canvas.height);
  console.log('Background color:', bgColor);

  // Simple but effective algorithm
  const threshold = 40;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Distance from background color
    const dist = Math.sqrt(
      (r - bgColor.r) ** 2 +
      (g - bgColor.g) ** 2 +
      (b - bgColor.b) ** 2
    );

    // Set alpha based on distance
    if (dist < threshold) {
      data[i + 3] = Math.max(0, 255 - (dist / threshold) * 255);
    } else {
      data[i + 3] = 255;
    }
  }

  // Smooth the edges
  smoothAlphaChannel(data, canvas.width, canvas.height);

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function getBackgroundColor(data, width, height) {
  const samples = [];
  
  // Sample edges
  const step = 10;
  
  // Top row
  for (let x = 0; x < width; x += step) {
    const idx = x * 4;
    samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
  }
  
  // Bottom row
  for (let x = 0; x < width; x += step) {
    const idx = ((height - 1) * width + x) * 4;
    samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
  }

  // Find average
  let r = 0, g = 0, b = 0;
  samples.forEach(s => {
    r += s.r;
    g += s.g;
    b += s.b;
  });
  
  return {
    r: Math.round(r / samples.length),
    g: Math.round(g / samples.length),
    b: Math.round(b / samples.length)
  };
}

function smoothAlphaChannel(data, width, height) {
  const alpha = new Uint8Array(width * height);
  
  // Extract alpha
  for (let i = 0; i < data.length; i += 4) {
    alpha[i / 4] = data[i + 3];
  }

  // Simple blur
  const temp = new Uint8Array(alpha.length);
  for (let i = 0; i < alpha.length; i++) {
    const y = Math.floor(i / width);
    const x = i % width;
    let sum = 0, count = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          sum += alpha[ny * width + nx];
          count++;
        }
      }
    }
    temp[i] = Math.round(sum / count);
  }

  // Write back
  for (let i = 0; i < alpha.length; i++) {
    data[i * 4 + 3] = temp[i];
  }
}

function updateProgress(pct, text) {
  const bar = document.getElementById('progress-bar');
  const txt = document.getElementById('progress-text');
  const pctEl = document.getElementById('progress-percentage');

  if (bar) bar.style.width = pct + '%';
  if (txt) txt.textContent = text;
  if (pctEl) pctEl.textContent = pct + '%';

  console.log(`⏳ ${pct}% - ${text}`);
}

function displayResults(originalCanvas, resultCanvas) {
  const origImg = document.getElementById('original-image');
  const resImg = document.getElementById('result-image');

  if (origImg) {
    origImg.src = originalCanvas.toDataURL('image/png');
  }
  if (resImg) {
    resImg.src = resultCanvas.toDataURL('image/png');
  }
}

function resetUI() {
  console.log('Resetting UI');
  document.getElementById('upload-zone').style.display = 'flex';
  document.getElementById('action-row').style.display = 'flex';
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('download-row').style.display = 'none';
  document.getElementById('file-upload').value = '';
}

function showError(msg) {
  console.error('ERROR:', msg);
  alert('Error: ' + msg);
}

function downloadImage() {
  if (!appState.resultCanvas) {
    showError('No image to download');
    return;
  }

  const link = document.createElement('a');
  link.href = appState.resultCanvas.toDataURL('image/png');
  link.download = 'background-removed.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log('Downloaded');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Make functions global
window.downloadImage = downloadImage;
window.resetUI = resetUI;

console.log('✅ Script loaded successfully');
