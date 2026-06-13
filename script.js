document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const promptContent = document.getElementById('promptContent');
    const previewStage = document.getElementById('previewStage');
    const originalImage = document.getElementById('originalImage');
    const resultImage = document.getElementById('resultImage');
    const removeBgBtn = document.getElementById('removeBgBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    const progressContainer = document.getElementById('progressContainer');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercent = document.getElementById('progressPercent');
    const statusMessage = document.getElementById('statusMessage');
    const originalWrapper = document.getElementById('originalWrapper');

    // Trigger window file navigation click handling
    dropZone.addEventListener('click', (e) => {
        // Prevent clicking inside images/controls from loops
        if (e.target.closest('.controls-belt') || e.target.closest('.preview-stage')) return;
        imageInput.click();
    });

    imageInput.addEventListener('change', handleFileSelection);

    // Drag-and-drop structural styling events
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

        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            
            // Layout transformations transitions
            promptContent.style.display = 'none';
            previewStage.style.display = 'grid';
            
            // Clean interface slate
            resultImage.src = '';
            removeBgBtn.disabled = false;
            downloadBtn.style.display = 'none';
            progressContainer.classList.remove('active');
            progressBarFill.style.width = '0%';
            progressPercent.textContent = '0%';
            statusMessage.textContent = 'File verified. Ready to isolate.';
        }
        reader.readAsDataURL(file);
    }

    // Interactive extraction loop logic emulation
    removeBgBtn.addEventListener('click', () => {
        removeBgBtn.disabled = true;
        progressContainer.classList.add('active');
        originalWrapper.classList.add('scanning');
        statusMessage.textContent = 'Analyzing asset dimensions...';

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                finalizeExtraction();
            }
            
            progressBarFill.style.width = `${progress}%`;
            progressPercent.textContent = `${progress}%`;

            if (progress > 30 && progress < 70) {
                statusMessage.textContent = 'Executing semantic subject extraction...';
            } else if (progress >= 70) {
                statusMessage.textContent = 'Refining object alpha masks...';
            }
        }, 120);
    });

    function finalizeExtraction() {
        originalWrapper.classList.remove('scanning');
        statusMessage.textContent = 'Extraction processing complete.';
        
        // Pass original image to results window for demonstration purposes
        resultImage.src = originalImage.src; 
        
        // Expose action buttons safely
        downloadBtn.href = originalImage.src;
        downloadBtn.style.display = 'inline-flex';
    }
});
