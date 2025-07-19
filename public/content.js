
// Content script for ScreenScribe AI Extension

let isOverlayActive = false;
let overlay = null;
let screenshotData = null;
let selectedAreaData = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.action === 'displayScreenshot') {
    screenshotData = message.screenshot;
    createOverlay();
    sendResponse({ success: true });
  } else if (message.action === 'ping') {
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});

function createOverlay() {
  if (overlay || !screenshotData) return;
  
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
        <button id="screenscribe-rectangle" class="tool-btn active">Rectangle Select</button>
        <button id="screenscribe-clear" class="tool-btn">Clear Selection</button>
        <button id="screenscribe-chat" class="tool-btn primary">Continue to Chat</button>
      </div>
      <div class="screenscribe-instructions">
        Click and drag on the screenshot to select an area for analysis
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
    // Set canvas size to fit in overlay while maintaining aspect ratio
    const maxWidth = Math.min(window.innerWidth * 0.7, 800);
    const maxHeight = Math.min(window.innerHeight * 0.6, 600);
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
  document.getElementById('screenscribe-clear').addEventListener('click', clearSelection);
  document.getElementById('screenscribe-chat').addEventListener('click', continueToChat);
  
  // Canvas drawing
  const overlayCanvas = document.getElementById('screenscribe-overlay-canvas');
  let isDrawing = false;
  let startPos = { x: 0, y: 0 };
  let endPos = { x: 0, y: 0 };
  
  overlayCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = overlayCanvas.getBoundingClientRect();
    startPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    endPos = startPos;
  });
  
  overlayCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = overlayCanvas.getBoundingClientRect();
    endPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    drawSelection(startPos, endPos);
  });
  
  overlayCanvas.addEventListener('mouseup', (e) => {
    if (isDrawing) {
      isDrawing = false;
      
      // Store selected area
      selectedAreaData = {
        startX: Math.min(startPos.x, endPos.x),
        startY: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        timestamp: Date.now()
      };
      
      console.log('Area selected:', selectedAreaData);
      
      // Enable chat button
      const chatBtn = document.getElementById('screenscribe-chat');
      chatBtn.disabled = false;
      chatBtn.textContent = 'Continue to Chat ✓';
    }
  });
}

function drawSelection(start, end) {
  const overlayCanvas = document.getElementById('screenscribe-overlay-canvas');
  const ctx = overlayCanvas.getContext('2d');
  
  // Clear overlay
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  
  // Draw selection rectangle
  ctx.strokeStyle = '#3b82f6';
  ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  const width = end.x - start.x;
  const height = end.y - start.y;
  
  ctx.fillRect(start.x, start.y, width, height);
  ctx.strokeRect(start.x, start.y, width, height);
}

function clearSelection() {
  const overlayCanvas = document.getElementById('screenscribe-overlay-canvas');
  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  
  selectedAreaData = null;
  
  // Reset chat button
  const chatBtn = document.getElementById('screenscribe-chat');
  chatBtn.disabled = false;
  chatBtn.textContent = 'Continue to Chat';
}

function continueToChat() {
  if (!selectedAreaData) {
    alert('Please select an area on the screenshot first');
    return;
  }
  
  // Send screenshot and selected area data to background script
  chrome.runtime.sendMessage({
    action: 'screenshotCaptured',
    screenshot: screenshotData,
    selectedArea: selectedAreaData
  }, (response) => {
    if (response && response.success) {
      console.log('Screenshot data sent to background successfully');
      closeOverlay();
    } else {
      console.error('Failed to send screenshot data');
    }
  });
}

function closeOverlay() {
  if (overlay) {
    overlay.remove();
    overlay = null;
    isOverlayActive = false;
    screenshotData = null;
    selectedAreaData = null;
  }
}
