// Content script for ScreenScribe AI Extension

let isOverlayActive = false;
let overlay = null;
let screenshotData = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureScreenshot') {
    captureScreenshot();
  }
});

function captureScreenshot() {
  if (isOverlayActive) return;
  
  // Request screenshot from background script
  chrome.runtime.sendMessage({ action: 'captureTab' }, (response) => {
    if (response.success) {
      screenshotData = response.dataUrl;
      createOverlay();
    } else {
      console.error('Failed to capture screenshot:', response.error);
    }
  });
}

function createOverlay() {
  if (overlay) return;
  
  isOverlayActive = true;
  
  // Create overlay container
  overlay = document.createElement('div');
  overlay.id = 'screenscribe-overlay';
  overlay.innerHTML = `
    <div class="screenscribe-overlay-content">
      <div class="screenscribe-header">
        <h3>ScreenScribe AI - Select Area</h3>
        <button id="screenscribe-close">×</button>
      </div>
      <div class="screenscribe-canvas-container">
        <canvas id="screenscribe-canvas"></canvas>
        <canvas id="screenscribe-overlay-canvas"></canvas>
      </div>
      <div class="screenscribe-tools">
        <button id="screenscribe-rectangle" class="tool-btn active">Rectangle</button>
        <button id="screenscribe-circle" class="tool-btn">Circle</button>
        <button id="screenscribe-clear" class="tool-btn">Clear</button>
        <button id="screenscribe-chat" class="tool-btn primary">Open Chat</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Initialize canvas with screenshot
  initializeCanvas();
  
  // Add event listeners
  setupEventListeners();
}

function initializeCanvas() {
  const canvas = document.getElementById('screenscribe-canvas');
  const overlayCanvas = document.getElementById('screenscribe-overlay-canvas');
  const ctx = canvas.getContext('2d');
  
  const img = new Image();
  img.onload = () => {
    // Set canvas size
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.6;
    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
    
    // Draw screenshot
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = screenshotData;
}

function setupEventListeners() {
  // Close button
  document.getElementById('screenscribe-close').addEventListener('click', closeOverlay);
  
  // Tool buttons
  document.getElementById('screenscribe-rectangle').addEventListener('click', () => setTool('rectangle'));
  document.getElementById('screenscribe-circle').addEventListener('click', () => setTool('circle'));
  document.getElementById('screenscribe-clear').addEventListener('click', clearSelection);
  document.getElementById('screenscribe-chat').addEventListener('click', openChat);
  
  // Canvas drawing
  const overlayCanvas = document.getElementById('screenscribe-overlay-canvas');
  let isDrawing = false;
  let startPos = { x: 0, y: 0 };
  let currentTool = 'rectangle';
  
  overlayCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = overlayCanvas.getBoundingClientRect();
    startPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  });
  
  overlayCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = overlayCanvas.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    drawSelection(startPos, currentPos, currentTool);
  });
  
  overlayCanvas.addEventListener('mouseup', (e) => {
    isDrawing = false;
  });
  
  function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`screenscribe-${tool}`).classList.add('active');
  }
}

function drawSelection(start, end, tool) {
  const overlayCanvas = document.getElementById('screenscribe-overlay-canvas');
  const ctx = overlayCanvas.getContext('2d');
  
  // Clear overlay
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  
  // Draw selection
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  const width = end.x - start.x;
  const height = end.y - start.y;
  
  if (tool === 'rectangle') {
    ctx.strokeRect(start.x, start.y, width, height);
  } else if (tool === 'circle') {
    const centerX = start.x + width / 2;
    const centerY = start.y + height / 2;
    const radius = Math.sqrt(width * width + height * height) / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function clearSelection() {
  const overlayCanvas = document.getElementById('screenscribe-overlay-canvas');
  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

function openChat() {
  // Get selected area data (simplified for demo)
  const canvas = document.getElementById('screenscribe-canvas');
  const selectedArea = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
  };
  
  // Send to background script
  chrome.runtime.sendMessage({
    action: 'openChat',
    selectedArea: selectedArea,
    screenshot: screenshotData
  });
  
  closeOverlay();
}

function closeOverlay() {
  if (overlay) {
    overlay.remove();
    overlay = null;
    isOverlayActive = false;
  }
}