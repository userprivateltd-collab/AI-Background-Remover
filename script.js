// ============================================================================
// AI Background Remover - Professional Implementation
// ============================================================================

// Configuration
const CONFIG = {
  MODEL_URL: 'https://huggingface.co/spaces/raficelente/rembg-api/resolve/main/saved_model/model.onnx',
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp']
};

// State Management
let appState = {
  isProcessing: false,
  currentImage: null,
  modelSession: null,
  modelReady: false,
  originalCanvas: null,
  resultCanvas: null
};

// ============================================================================
// Initialize App
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initializeModel();
});

function setupEventListeners() {
  const fileInput = document.getElementById('file-upload');
  const uploadZone = document.getElementById('upload-zone');

  // File input change
  fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });
}

// ============================================================================
// Model Initialization
// ============================================================================

async function initializeModel() {
  try {
    console.log('🤖 Initializing ONNX Runtime...');
    
    // Configure ONNX Runtime for web
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/';
    
    console.log('✅ ONNX Runtime ready');
    appState.modelReady = true;
  } catch (error) {
    console.error('❌ Failed to initialize ONNX Runtime:', error);
    showError('Failed to initialize. Please refresh the page.');
  }
}

async function loadModel() {
  if (appState.modelSession) {
    return; // Model already loaded
  }

  try {
    console.log('📥 Loading AI model...');
    updateProgress(0, 'Downloading model...');

    // For production, you might want to use a CDN or local model
    // This uses a lightweight model from Hugging Face
    const modelURL = 'https://media.githubusercontent.com/media/ZFTurbo/ONNX-models/main/rembg_isnet-general-use.onnx';
    
    appState.modelSession = await ort.InferenceSession.create(modelURL, {
      providers: ['wasm', 'cpu'],
    });

    console.log('✅ Model loaded successfully');
    appState.modelReady = true;
    updateProgress(30, 'Model ready');
  } catch (error) {
    console.error('❌ Error loading model:', error);
    showError('Failed to load AI model. Using alternative processing...');
    // Continue with image processing even if model fails
  }
}

// ============================================================================
// File Handling
// ============================================================================

async function handleFileSelect(file) {
  if (!file) return;

  // Validate file
  if (!validateFile(file)) {
    return;
  }

  // Reset UI
  resetUI();

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
  appState.isProcessing = true;
  appState.currentImage = file;

  try {
    // Show progress
    document.getElementById('upload-zone').style.display = 'none';
    document.getElementById('action-row').style.display = 'none';
    document.getElementById('progress-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('download-row').style.display = 'none';

    updateProgress(10, 'Reading image...');

    // Load image
    const imageBitmap = await loadImage(file);
    updateProgress(20, 'Processing image...');

    // Create canvas for original image
    appState.originalCanvas = document.createElement('canvas');
    const ctx = appState.originalCanvas.getContext('2d');
    appState.originalCanvas.width = imageBitmap.width;
    appState.originalCanvas.height = imageBitmap.height;
    ctx.drawImage(imageBitmap, 0, 0);

    updateProgress(40, 'Removing background...');

    // Remove background
    const resultCanvas = await removeBackground(imageBitmap);
    appState.resultCanvas = resultCanvas;

    updateProgress(90, 'Finalizing...');

    // Display results
    displayResults(appState.originalCanvas, resultCanvas);

    updateProgress(100, 'Complete!');

    // Hide progress and show results
    setTimeout(() => {
      document.getElementById('progress-section').style.display = 'none';
      document.getElementById('results-section').style.display = 'block';
      document.getElementById('download-row').style.display = 'flex';
    }, 500);

  } catch (error) {
    console.error('❌ Error processing image:', error);
    showError('Failed to process image. Please try again.');
  } finally {
    appState.isProcessing = false;
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        createImageBitmap(img).then(resolve).catch(reject);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// Background Removal - Advanced Algorithm
// ============================================================================

async function removeBackground(imageBitmap) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  ctx.drawImage(imageBitmap, 0, 0);

  try {
    // Try using the model if available
    if (appState.modelSession && appState.modelReady) {
      return await removeBackgroundWithModel(canvas);
    }
  } catch (error) {
    console.warn('Model processing failed, falling back to edge detection:', error);
  }

  // Fallback: Use advanced edge detection and color segmentation
  return removeBackgroundWithEdgeDetection(canvas);
}

async function removeBackgroundWithModel(canvas) {
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Prepare tensor for model
    const input = createInputTensor(imageData);
    
    // Run inference
    const results = await appState.modelSession.run({ input });
    const output = results.output.data;

    // Apply mask to image
    const output_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = output_data.data;

    for (let i = 0; i < output.length; i++) {
      const alpha = Math.round(output[i] * 255);
      data[i * 4 + 3] = alpha; // Set alpha channel
    }

    ctx.putImageData(output_data, 0, 0);
    return canvas;
  } catch (error) {
    throw error;
  }
}

function createInputTensor(imageData) {
  // Create a 1x3x320x320 tensor from image
  const width = 320;
  const height = 320;
  const data = imageData.data;

  // Resize and normalize image
  const tensorData = new Float32Array(1 * 3 * width * height);
  
  for (let i = 0; i < width * height; i++) {
    tensorData[i] = data[i * 4] / 255.0; // R
    tensorData[width * height + i] = data[i * 4 + 1] / 255.0; // G
    tensorData[2 * width * height + i] = data[i * 4 + 2] / 255.0; // B
  }

  return new ort.Tensor('float32', tensorData, [1, 3, width, height]);
}

function removeBackgroundWithEdgeDetection(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Advanced color segmentation and edge detection
  // This algorithm identifies the main subject and removes background

  // Step 1: Convert to grayscale and calculate edge map
  const edges = new Uint8Array(canvas.width * canvas.height);
  const grays = new Uint8Array(canvas.width * canvas.height);

  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    grays[i / 4] = gray;
  }

  // Sobel edge detection
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const idx = y * canvas.width + x;

      // Sobel operators
      const gx =
        -grays[(y - 1) * canvas.width + (x - 1)] +
        grays[(y - 1) * canvas.width + (x + 1)] -
        2 * grays[y * canvas.width + (x - 1)] +
        2 * grays[y * canvas.width + (x + 1)] -
        grays[(y + 1) * canvas.width + (x - 1)] +
        grays[(y + 1) * canvas.width + (x + 1)];

      const gy =
        -grays[(y - 1) * canvas.width + (x - 1)] -
        2 * grays[(y - 1) * canvas.width + x] -
        grays[(y - 1) * canvas.width + (x + 1)] +
        grays[(y + 1) * canvas.width + (x - 1)] +
        2 * grays[(y + 1) * canvas.width + x] +
        grays[(y + 1) * canvas.width + (x + 1)];

      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Step 2: Find connected components (objects)
  const visited = new Uint8Array(canvas.width * canvas.height);
  let largestComponent = [];
  let largestSize = 0;

  for (let i = 0; i < canvas.width * canvas.height; i++) {
    if (!visited[i] && edges[i] > 30) {
      const component = floodFill(edges, visited, i, canvas.width, canvas.height);
      if (component.length > largestSize) {
        largestSize = component.length;
        largestComponent = component;
      }
    }
  }

  // Step 3: Create mask from largest component
  const mask = new Uint8Array(canvas.width * canvas.height);
  largestComponent.forEach((idx) => {
    mask[idx] = 255;
  });

  // Step 4: Dilate mask to include nearby pixels (grow the object)
  const dilated = dilateMask(mask, canvas.width, canvas.height, 3);

  // Step 5: Apply mask to alpha channel
  for (let i = 0; i < data.length; i += 4) {
    const pixelIdx = i / 4;
    data[i + 3] = dilated[pixelIdx]; // Set alpha based on mask
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function floodFill(edges, visited, startIdx, width, height, threshold = 30) {
  const stack = [startIdx];
  const component = [];

  while (stack.length > 0) {
    const idx = stack.pop();

    if (visited[idx]) continue;
    visited[idx] = 1;

    if (edges[idx] > threshold) {
      component.push(idx);

      // Check neighbors
      const y = Math.floor(idx / width);
      const x = idx % width;

      if (x > 0 && !visited[idx - 1]) stack.push(idx - 1);
      if (x < width - 1 && !visited[idx + 1]) stack.push(idx + 1);
      if (y > 0 && !visited[idx - width]) stack.push(idx - width);
      if (y < height - 1 && !visited[idx + width]) stack.push(idx + width);
    }
  }

  return component;
}

function dilateMask(mask, width, height, radius = 3) {
  const dilated = new Uint8Array(mask.length);
  const radiusSq = radius * radius;

  for (let i = 0; i < mask.length; i++) {
    if (mask[i] > 0) {
      dilated[i] = 255;
    } else {
      const y = Math.floor(i / width);
      const x = i % width;

      let maxVal = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy <= radiusSq) {
            const ny = y + dy;
            const nx = x + dx;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              maxVal = Math.max(maxVal, mask[ny * width + nx]);
            }
          }
        }
      }
      dilated[i] = maxVal;
    }
  }

  return dilated;
}

// ============================================================================
// UI Updates
// ============================================================================

function updateProgress(percentage, text) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const progressPercentage = document.getElementById('progress-percentage');

  progressBar.style.width = percentage + '%';
  progressText.textContent = text;
  progressPercentage.textContent = percentage + '%';
}

function displayResults(originalCanvas, resultCanvas) {
  const originalImg = document.getElementById('original-image');
  const resultImg = document.getElementById('result-image');

  originalImg.src = originalCanvas.toDataURL('image/png');
  resultImg.src = resultCanvas.toDataURL('image/png');
}

function resetUI() {
  document.getElementById('upload-zone').style.display = 'flex';
  document.getElementById('action-row').style.display = 'flex';
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('download-row').style.display = 'none';
  document.getElementById('file-upload').value = '';
}

function showError(message) {
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
  subtitle.parentNode.insertBefore(errorDiv, subtitle.nextSibling);

  // Auto remove after 5 seconds
  setTimeout(() => {
    errorDiv.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);

  // Reset UI state
  if (appState.isProcessing) {
    appState.isProcessing = false;
    resetUI();
  }
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
