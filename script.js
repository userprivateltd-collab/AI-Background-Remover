// WARNING: Do not upload your actual API key to a public GitHub repository.
const API_KEY = '5FuThBereFUKQM3eDK5GpvS4'; 

const imageInput = document.getElementById('imageInput');
const fileName = document.getElementById('fileName');
const removeBgBtn = document.getElementById('removeBgBtn');
const originalImage = document.getElementById('originalImage');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');
const statusMessage = document.getElementById('statusMessage');

let selectedFile = null;

// Handle file selection
imageInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        fileName.textContent = selectedFile.name;
        removeBgBtn.disabled = false;
        
        // Show original image
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage.src = event.target.result;
            originalImage.style.display = 'block';
            resultImage.style.display = 'none';
            downloadBtn.style.display = 'none';
        };
        reader.readAsDataURL(selectedFile);
    }
});

// Handle API Request
removeBgBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    statusMessage.textContent = "Processing... Please wait.";
    removeBgBtn.disabled = true;

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
            throw new Error(`API Error: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        resultImage.src = url;
        resultImage.style.display = 'block';
        
        downloadBtn.href = url;
        downloadBtn.style.display = 'inline-block';
        
        statusMessage.textContent = "Success!";
    } catch (error) {
        console.error(error);
        statusMessage.textContent = "Failed to process image. Check console for details.";
    } finally {
        removeBgBtn.disabled = false;
    }
});
