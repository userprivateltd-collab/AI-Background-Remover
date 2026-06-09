// ============================================================================
// AI Background Remover - Professional Implementation with Working Algorithm
// ============================================================================

// Configuration
const CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp']
};

// State Management
let appState = {
  isProcessing: false,
  currentImage: null,
  originalCanvas: null,
  resultCanvas: null
};

// ============================================================================
// Initialize App
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ App initialized');
  setupEventListeners();
});

function setupEventListeners() {
  const fileInput = document.getElementById('file-upload');
  const uploadZone = document.getElementById('upload-zone');

  // File input change
  fileInput.addEventListener('change', (e) => {
    console.log('File selected:', e.target.files[0]?.name);
    handleFileSelect(e.target.files[0]);
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      console.log('File dropped:', e.dataTransfer.files[0].name);
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });
}

// ============================================================================
// File Handling
// ============================================================================

async function handleFileSelect(file) {
  if (!file) {
    console.log('No file selected');
    return;
  }

  console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

  // Validate file
  if (!validateFile(file)) {
    return;
  }

  // Process image
  await processImage(file);
}

function validateFile(file) {
  // Check file type
  if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
    showError('❌ Unsupported file format. Please use JPG, PNG, or WebP.');
    return false;
  }

  // Check file size
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    showError(`❌ File too large. Maximum size is ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.`);
    return false;
  }

  return true;
}

// ============================================================================
// Image Processing
// ============================================================================

async function processImage(file) {
  if (appState.isProcessing) {
    console.log('Already processing, ignoring...');
    return;
  }

  appState.isProcessing = true;
  appState.currentImage = file;

  try {
    console.log('Starting image processing...');
    
    // Show progress UI
    document.getElementById('upload-zone').style.display = 'none';
    document.getElementById('action-row').style.display = 'none';
    document.getElementById('progress-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('download-row').style.display = 'none';

    updateProgress(5, 'Reading image...');
    await sleep(100);

    // Load image
    console.log('Loading image...');
    const imageBitmap = await loadImage(file);
    console.log('Image loaded:', imageBitmap.width, 'x', imageBitmap.height);
    updateProgress(15, 'Analyzing image...');
    await sleep(100);

    // Create canvas for original image
    appState.originalCanvas = document.createElement('canvas');
    const ctx = appState.originalCanvas.getContext('2d');
    appState.originalCanvas.width = imageBitmap.width;
    appState.originalCanvas.height = imageBitmap.height;
    ctx.drawImage(imageBitmap, 0, 0);

    updateProgress(35, 'Removing background...');
    await sleep(200);

    // Remove background using proven algorithm
    console.log('Processing with background removal algorithm...');
    const resultCanvas = await removeBackground(imageBitmap);
    appState.resultCanvas = resultCanvas;

    updateProgress(85, 'Finalizing results...');
    await sleep(200);

    // Display results
    console.log('Displaying results...');
    displayResults(appState.originalCanvas, resultCanvas);

    updateProgress(100, 'Complete!');
    await sleep(300);

    // Hide progress and show results
    document.getElementById('progress-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('download-row').style.display = 'flex';
    
    console.log('✅ Processing complete!');

  } catch (error) {
    console.error('❌ Error processing image:', error);
    showError('Failed to process image. Please try again.');
    resetUI();
  } finally {
    appState.isProcessing = false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        createImageBitmap(img).then(resolve).catch(reject);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// Background Removal - Advanced Color-Based Algorithm
// ============================================================================

async function removeBackground(imageBitmap) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  ctx.drawImage(imageBitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  console.log('Canvas size:', canvas.width, 'x', canvas.height);

  // Use adaptive background removal algorithm
  removeBackgroundAdvanced(data, canvas.width, canvas.height);

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function removeBackgroundAdvanced(data, width, height) {
  console.log('Using advanced background removal...');

  // Step 1: Analyze the image to find the background color
  // Usually, the background is at the edges
  const backgroundColor = detectBackgroundColor(data, width, height);
  console.log('Background color detected:', backgroundColor);

  // Step 2: Create mask based on color similarity
  const threshold = 50; // Color difference threshold
  const tolerance = 35;

  // Apply color-based background removal
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate color distance from background
    const colorDistance = Math.sqrt(
      Math.pow(r - backgroundColor.r, 2) +
      Math.pow(g - backgroundColor.g, 2) +
      Math.pow(b - backgroundColor.b, 2)
    );

    // Determine alpha based on color distance
    if (colorDistance < threshold) {
      data[i + 3] = Math.max(0, 255 - (colorDistance / threshold) * 255);
    } else {
      data[i + 3] = 255;
    }
  }

  // Step 3: Apply morphological operations to clean up edges
  const alpha = extractAlphaChannel(data);
  
  // Dilate to fill small holes
  dilateAlpha(alpha, width, height, 2);
  
  // Erode to clean edges
  erodeAlpha(alpha, width, height, 1);
  
  // Gaussian blur on alpha for smooth edges
  gaussianBlurAlpha(alpha, width, height, 2);

  // Apply back to data
  applyAlphaChannel(data, alpha);
}

function detectBackgroundColor(data, width, height) {
  // Sample colors from edges to detect background
  const samples = [];
  const sampleSize = 20; // Sample 20 pixels from each edge
  
  // Top edge
  for (let x = 0; x < width; x += Math.floor(width / sampleSize)) {
    const idx = x * 4;
    samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
  }
  
  // Bottom edge
  for (let x = 0; x < width; x += Math.floor(width / sampleSize)) {
    const idx = ((height - 1) * width + x) * 4;
    samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
  }
  
  // Left edge
  for (let y = 0; y < height; y += Math.floor(height / sampleSize)) {
    const idx = (y * width) * 4;
    samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
  }
  
  // Right edge
  for (let y = 0; y < height; y += Math.floor(height / sampleSize)) {
    const idx = (y * width + (width - 1)) * 4;
    samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
  }

  // Find most common color (mode)
  const colorMap = {};
  let maxCount = 0;
  let dominantColor = { r: 255, g: 255, b: 255 };

  samples.forEach(color => {
    const key = `${color.r},${color.g},${color.b}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
    if (colorMap[key] > maxCount) {
      maxCount = colorMap[key];
      dominantColor = color;
    }
  });

  return dominantColor;
}

function extractAlphaChannel(data) {
  const alpha = new Uint8Array(data.length / 4);
  for (let i = 0; i < data.length; i += 4) {
    alpha[i / 4] = data[i + 3];
  }
  return alpha;
}

function dilateAlpha(alpha, width, height, radius) {
  const output = new Uint8Array(alpha.length);
  
  for (let i = 0; i < alpha.length; i++) {
    let maxVal = alpha[i];
    const y = Math.floor(i / width);
    const x = i % width;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          maxVal = Math.max(maxVal, alpha[ny * width + nx]);
        }
      }
    }
    output[i] = maxVal;
  }

  alpha.set(output);
}

function erodeAlpha(alpha, width, height, radius) {
  const output = new Uint8Array(alpha.length);
  
  for (let i = 0; i < alpha.length; i++) {
    let minVal = alpha[i];
    const y = Math.floor(i / width);
    const x = i % width;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          minVal = Math.min(minVal, alpha[ny * width + nx]);
        }
      }
    }
    output[i] = minVal;
  }

  alpha.set(output);
}

function gaussianBlurAlpha(alpha, width, height, radius) {
  // Create Gaussian kernel
  const kernel = createGaussianKernel(radius);
  const output = new Uint8Array(alpha.length);

  for (let i = 0; i < alpha.length; i++) {
    const y = Math.floor(i / width);
    const x = i % width;
    
    let sum = 0;
    let weight = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const kernelVal = kernel[dy + radius][dx + radius];
          sum += alpha[ny * width + nx] * kernelVal;
          weight += kernelVal;
        }
      }
    }

    output[i] = Math.round(sum / weight);
  }

  alpha.set(output);
}

function createGaussianKernel(radius) {
  const size = radius * 2 + 1;
  const kernel = [];
  const sigma = radius / 2;
  const mean = radius;
  let sum = 0;

  for (let y = 0; y < size; y++) {
    kernel[y] = [];
    for (let x = 0; x < size; x++) {
      const exponent = -((Math.pow(x - mean, 2) + Math.pow(y - mean, 2)) / (2 * Math.pow(sigma, 2)));
      const value = Math.exp(exponent) / (2 * Math.PI * Math.pow(sigma, 2));
      kernel[y][x] = value;
      sum += value;
    }
  }

  // Normalize
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] /= sum;
    }
  }

  return kernel;
}

function applyAlphaChannel(data, alpha) {
  for (let i = 0; i < alpha.length; i++) {
    data[i * 4 + 3] = alpha[i];
  }
}

// ============================================================================
// UI Updates
// ============================================================================

function updateProgress(percentage, text) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const progressPercentage = document.getElementById('progress-percentage');

  if (progressBar) progressBar.style.width = percentage + '%';
  if (progressText) progressText.textContent = text;
  if (progressPercentage) progressPercentage.textContent = percentage + '%';
  
  console.log(`Progress: ${percentage}% - ${text}`);
}

function displayResults(originalCanvas, resultCanvas) {
  const originalImg = document.getElementById('original-image');
  const resultImg = document.getElementById('result-image');

  if (originalImg) originalImg.src = originalCanvas.toDataURL('image/png');
  if (resultImg) resultImg.src = resultCanvas.toDataURL('image/png');
  
  console.log('Results displayed');
}

function resetUI() {
  console.log('Resetting UI...');
  const uploadZone = document.getElementById('upload-zone');
  const actionRow = document.getElementById('action-row');
  const progressSection = document.getElementById('progress-section');
  const resultsSection = document.getElementById('results-section');
  const downloadRow = document.getElementById('download-row');
  const fileInput = document.getElementById('file-upload');

  if (uploadZone) uploadZone.style.display = 'flex';
  if (actionRow) actionRow.style.display = 'flex';
  if (progressSection) progressSection.style.display = 'none';
  if (resultsSection) resultsSection.style.display = 'none';
  if (downloadRow) downloadRow.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

function showError(message) {
  console.error('Error:', message);
  
  // Remove existing error if present
  const existingError = document.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Create error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;

  // Insert after subtitle
  const subtitle = document.querySelector('.app-subtitle');
  if (subtitle) {
    subtitle.parentNode.insertBefore(errorDiv, subtitle.nextSibling);
  }

  // Auto remove after 5 seconds
  setTimeout(() => {
    errorDiv.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 300);
  }, 5000);
}

function downloadImage() {
  if (!appState.resultCanvas) {
    showError('No image to download. Please process an image first.');
    return;
  }

  // Create download link
  const link = document.createElement('a');
  link.href = appState.resultCanvas.toDataURL('image/png');
  link.download = `background-removed-${Date.now()}.png`;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log('✅ Image downloaded successfully');
}

// Export functions for inline onclick handlers
window.downloadImage = downloadImage;
window.resetUI = resetUI;
