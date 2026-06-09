:root {
    --primary: #0b57d0;
    --surface: #f3f6fc;
    --text: #1f1f1f;
    --radius: 24px;
}

body {
    font-family: system-ui, -apple-system, sans-serif;
    background-color: var(--surface);
    color: var(--text);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: var(--radius);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    width: 100%;
    max-width: 600px;
    text-align: center;
}

header h1 {
    margin-top: 0;
    font-size: 1.5rem;
}

.upload-section {
    margin: 2rem 0;
}

input[type="file"] {
    display: none;
}

.upload-btn, button, .download-btn {
    background-color: var(--primary);
    color: white;
    padding: 10px 24px;
    border-radius: 100px;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: background 0.2s;
    font-weight: 500;
}

.upload-btn:hover, button:hover, .download-btn:hover {
    background-color: #0842a0;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* Progress Bar Styles */
.progress-container {
    width: 100%;
    height: 6px;
    background: #e0e0e0;
    border-radius: 10px;
    margin-top: 15px;
    overflow: hidden;
    display: none; /* Hidden by default */
}

.progress-bar {
    height: 100%;
    width: 40%;
    background: var(--primary);
    border-radius: 10px;
    animation: loading 1.5s infinite ease-in-out;
}

@keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
}

/* Image Container & Scanning Effect */
.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 1.5rem;
}

.image-wrapper {
    position: relative;
    width: 48%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

img {
    width: 100%;
    display: block;
    background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), 
                      linear-gradient(135deg, #ccc 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                      linear-gradient(135deg, transparent 75%, #ccc 75%);
    background-size: 20px 20px;
    background-position: 0 0, 10px 0, 10px -10px, 0px 10px;
}

.scan-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(11, 87, 208, 0.9);
    box-shadow: 0 0 15px rgba(11, 87, 208, 1);
    display: none; /* Hidden by default */
}

/* Animate the scan line up and down */
.scan-line.active {
    display: block;
    animation: scan 2s infinite linear;
}

@keyframes scan {
    0% { top: 0; }
    50% { top: 100%; }
    100% { top: 0; }
}

#statusMessage {
    font-size: 0.9rem;
    color: #555;
    margin-top: 10px;
    min-height: 20px;
}

/* About Section */
.about-section {
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e0e0e0;
    text-align: left;
}

.about-section h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #333;
}

.about-section p {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.5;
}
