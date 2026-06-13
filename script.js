document.addEventListener('DOMContentLoaded', () => {
    // Array containing both keys for automatic backup failover handling
    const API_KEYS = [
        "C8dbuL1rVr5JZcdfjSNCbu8T", // Primary Key
        "5FuThBereFUKQM3eDK5GpvS4"  // Secondary Backup Key
    ];

    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const fileNameElement = document.getElementById('fileName');
    const promptContent = document.getElementById('promptContent');
    const previewStage = document.getElementById('previewStage');
    const originalImage = document.getElementById('originalImage');
    const resultImage = document.getElementById('resultImage');
    const removeBgBtn = document.getElementById('removeBgBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn'); // The new reset trigger
    
    const progressContainer = document.getElementById('progressContainer');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercent = document.getElementById('progressPercent');
    const statusMessage = document.getElementById('statusMessage');
    const originalWrapper = document.getElementById('originalWrapper');

    // Object URL store to safely manage browser memory lifecycles
    let currentResultUrl = null;

    // Trigger local system file picking explorer
    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('.controls-belt') || e.target.closest('.preview-stage')) return;
        imageInput.click();
    });

    imageInput.addEventListener('change', handleFileSelection);

    // Interactive Drag and Drop Setup Rules
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            imageInput.files = files;
            handleFileSelection();
        }
    });

    function handleFileSelection() {
        const file = imageInput.files[0];
        if (!file) return;

        // Show selected file name inside specifications text placeholder area
        fileNameElement.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            
            promptContent.style.display = 'none';
            previewStage.style.display = 'grid';
            
            resultImage.src = '';
            removeBgBtn.disabled = false;
            downloadBtn.style.display = 'none';
            resetBtn.style.display = 'none';
            progressContainer.classList.remove('active');
            progressBarFill.style.width = '0%';
            progressPercent.textContent = '0%';
            statusMessage.textContent = 'Ready to extract background.';
        }
        reader.readAsDataURL(file);
    }

    // Live execution loop containing both keys
    removeBgBtn.addEventListener('click', async () => {
        const file = imageInput.files[0];
        if (!file) return;

        removeBgBtn.disabled = true;
        progressContainer.classList.add('active');
        originalWrapper.classList.add('scanning');
        
        updateProgress(25, 'Initializing engine models...');

        const formData = new FormData();
        formData.append('image_file', file);
        formData.append('size', 'auto');

        let outputBlob = null;
        let successfulKeyIndex = -1;

        // Try sequentially parsing keys to avoid crashing on user tier limits
        for (let i = 0; i < API_KEYS.length; i++) {
            updateProgress(45 + (i * 15), `Running subject isolation (Key Matrix ${i + 1})...`);
            
            try {
                const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: { 'X-Api-Key': API_KEYS[i] },
                    body: formData
                });

                if (response.ok) {
                    outputBlob = await response.blob();
                    successfulKeyIndex = i;
                    break; 
                } else {
                    const errText = await response.text();
                    console.warn(`Key ${i + 1} failed. Response:`, errText);
                }
            } catch (networkError) {
                console.error(`Network error on Key ${i + 1}:`, networkError);
            }
        }

        if (outputBlob) {
            updateProgress(90, 'Assembling clean vector alpha masks...');
            
            // Clear any old image URLs to save browser ram usage
            if (currentResultUrl) URL.revokeObjectURL(currentResultUrl);
            
            currentResultUrl = URL.createObjectURL(outputBlob);
            resultImage.src = currentResultUrl;
            downloadBtn.href = currentResultUrl;
            
            setTimeout(() => {
                originalWrapper.classList.remove('scanning');
                updateProgress(100, `Success! Processed via Key Matrix ${successfulKeyIndex + 1}.`);
                downloadBtn.style.display = 'inline-flex';
                resetBtn.style.display = 'inline-flex'; // Reveal upload button safely
            }, 600);
            
        } else {
            originalWrapper.classList.remove('scanning');
            removeBgBtn.disabled = false;
            updateProgress(0, 'Error: All configured API keys are empty or restricted.');
            alert('Unable to process request. Please check your Remove.bg API credit logs.');
        }
    });

    // Reset workflow engine handler for continuous asset dropping loops
    resetBtn.addEventListener('click', () => {
        // Clear input values completely
        imageInput.value = '';
        fileNameElement.textContent = 'Supports PNG, JPEG, WEBP';
        
        // Clean dynamic source wrappers
        originalImage.src = '';
        resultImage.src = '';
        
        if (currentResultUrl) {
            URL.revokeObjectURL(currentResultUrl);
            currentResultUrl = null;
        }

        // Toggle visibility back to clear upload configuration state
        previewStage.style.display = 'none';
        promptContent.style.display = 'block';
        
        // Hide control actions
        downloadBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        removeBgBtn.disabled = true;
        
        // Reset loader status rows
        progressContainer.classList.remove('active');
        progressBarFill.style.width = '0%';
        progressPercent.textContent = '0%';
        statusMessage.textContent = 'Ready to process';
    });

    function updateProgress(percentage, statusText) {
        progressBarFill.style.width = `${percentage}%`;
        progressPercent.textContent = `${percentage}%`;
        statusMessage.textContent = statusText;
    }
});
