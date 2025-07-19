
// Popup script for ScreenScribe AI Extension

let currentScreenshot = null;
let selectedArea = null;
let isCapturing = false;

document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('captureBtn');
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const status = document.getElementById('status');
  const screenshotPreview = document.getElementById('screenshotPreview');
  
  // Load saved data
  loadSavedData();
  
  // Event listeners
  captureBtn.addEventListener('click', captureScreenshot);
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleBackgroundMessage(message);
  });
  
  function loadSavedData() {
    chrome.storage.local.get(['currentScreenshot', 'selectedArea', 'timestamp'], (result) => {
      console.log('Loaded saved data:', result);
      
      if (result.currentScreenshot) {
        currentScreenshot = result.currentScreenshot;
        displayScreenshot(result.currentScreenshot);
        
        if (result.selectedArea) {
          selectedArea = result.selectedArea;
          status.textContent = 'Screenshot loaded with selected area! You can chat about it.';
          addMessage('bot', 'I can see your selected area! What would you like to know about it?');
        } else {
          status.textContent = 'Screenshot loaded! Select an area to analyze.';
        }
      }
    });
  }
  
  function captureScreenshot() {
    if (isCapturing) return;
    
    isCapturing = true;
    captureBtn.disabled = true;
    captureBtn.textContent = 'Capturing...';
    status.textContent = 'Preparing screenshot capture...';
    
    // Get current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      
      // Check if tab URL is accessible
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        resetCaptureState();
        status.textContent = 'Error: Cannot capture screenshots on this page type. Please try on a regular webpage.';
        return;
      }
      
      // Send screenshot request to background script
      chrome.runtime.sendMessage({
        action: 'requestScreenshot',
        tabId: tab.id
      }, (response) => {
        if (chrome.runtime.lastError) {
          resetCaptureState();
          status.textContent = 'Error: Failed to request screenshot.';
          console.error('Screenshot request failed:', chrome.runtime.lastError);
        } else if (!response.success) {
          resetCaptureState();
          status.textContent = `Error: ${response.error}`;
        } else {
          status.textContent = 'Screenshot captured! Close popup and select an area on the page.';
          // Don't close popup immediately - let user see the status
          setTimeout(() => {
            window.close();
          }, 1500);
        }
      });
    });
  }
  
  function handleBackgroundMessage(message) {
    console.log('Popup received message:', message);
    
    switch (message.action) {
      case 'screenshotResult':
        if (message.success) {
          status.textContent = 'Screenshot ready! Close popup to select area.';
          resetCaptureState();
        } else {
          resetCaptureState();
          status.textContent = `Error: ${message.error}`;
        }
        break;
        
      case 'screenshotReady':
        currentScreenshot = message.screenshot;
        selectedArea = message.selectedArea;
        displayScreenshot(message.screenshot);
        status.textContent = 'Area selected! You can now chat about it.';
        addMessage('bot', 'Perfect! I can see your selected area. What would you like to know about it?');
        break;
        
      case 'chatDataSaved':
        status.textContent = 'Chat session ready!';
        break;
    }
  }
  
  function resetCaptureState() {
    isCapturing = false;
    captureBtn.disabled = false;
    captureBtn.textContent = '📷 Capture Screenshot';
  }
  
  function displayScreenshot(dataUrl) {
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.borderRadius = '6px';
    screenshotPreview.innerHTML = '';
    screenshotPreview.appendChild(img);
  }
  
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    if (!currentScreenshot) {
      addMessage('bot', 'Please capture a screenshot first before asking questions.');
      return;
    }
    
    // Add user message
    addMessage('user', message);
    chatInput.value = '';
    
    // Simulate AI response with context about screenshot
    setTimeout(() => {
      const responses = [
        "I can analyze your screenshot. Based on the selected area, I can see various UI elements and content.",
        "Looking at your selected region, I notice specific interface components. What particular aspect interests you?",
        "I'm examining the screenshot data from your selection. The visual elements show interesting patterns.",
        "Based on your screenshot selection, I can provide insights about the UI design and layout.",
        "Your selected area contains rich visual information. What specific analysis would you like me to focus on?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage('bot', randomResponse);
    }, 1000);
  }
  
  function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
