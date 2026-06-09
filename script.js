// Your live Remove.bg API key
const API_KEY = "C8dbuL1rVr5JZcdfjSNCbu8T";

const imageInput = document.getElementById('imageInput');
const fileName = document.getElementById('fileName');
const removeBgBtn = document.getElementById('removeBgBtn');

const originalWrapper = document.getElementById('originalWrapper');
const resultWrapper = document.getElementById('resultWrapper');
const originalImage = document.getElementById('originalImage');
const resultImage = document.getElementById('resultImage');

const downloadBtn = document.getElementById('downloadBtn');
const statusMessage = document.getElementById('statusMessage');

// New animated elements
const progressContainer = document.getElementById('progressContainer');
const scanLine = document.getElementById('scanLine');

let selectedFile = null;

// Handle file selection
imageInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        fileName.textContent = selectedFile.name;
        removeBgBtn.disabled = false;
        
        // Reset the UI for a new image
        resultWrapper.style.display = 'none';
        downloadBtn.style.display = 'none';
        statusMessage.textContent = "";
        
        // Show original image
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage.src = event.target.result;
            originalWrapper.style.display = 'block';
        };
        reader.readAsDataURL(selectedFile);
    }
});

// Handle API Request
removeBgBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Start loading state
    statusMessage.textContent = "AI is casting its magic... Please wait.";
    removeBgBtn.disabled = true;
    progressContainer.style.display = 'block'; // Show progress bar
    scanLine.classList.add('active'); // Start scanner animation

    const formData = new FormData();
    formData.append('image_file', selectedFile);
    formData.append('size', 'auto');

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - Check your API key limits or image size.`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Show result
        resultImage.src = url;
        resultWrapper.style.display = 'block';
        
        // Setup download button
        downloadBtn.href = url;
        downloadBtn.style.display = 'inline-block';
        
        statusMessage.textContent = "Background removed successfully!";
    } catch (error) {
        console.error(error);
        statusMessage.textContent = "Failed to process image. Make sure your API key has credits remaining.";
    } finally {
        // Stop loading state
        removeBgBtn.disabled = false;
        progressContainer.style.display = 'none'; // Hide progress bar
        scanLine.classList.remove('active'); // Stop scanner animation
    }
});
