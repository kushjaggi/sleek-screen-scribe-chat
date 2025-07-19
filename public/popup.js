
// Popup script for ScreenScribe AI Extension

let currentScreenshot = null;
let selectedArea = null;

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
  
  function loadSavedData() {
    chrome.storage.local.get(['selectedArea', 'screenshot'], (result) => {
      if (result.screenshot) {
        currentScreenshot = result.screenshot;
        displayScreenshot(result.screenshot);
        status.textContent = 'Screenshot loaded! You can now chat about it.';
      }
      
      if (result.selectedArea) {
        selectedArea = result.selectedArea;
        addMessage('bot', 'Selected area detected! What would you like to know about it?');
      }
    });
  }
  
  function captureScreenshot() {
    status.textContent = 'Starting screenshot capture...';
    
    // Get current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      
      // Check if tab URL is accessible
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        status.textContent = 'Error: Cannot capture screenshots on this page type. Please try on a regular webpage.';
        return;
      }
      
      try {
        // First try to send message to see if content script is already injected
        chrome.tabs.sendMessage(tab.id, { action: 'ping' }, async (response) => {
          if (chrome.runtime.lastError) {
            // Content script not injected, inject it
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
              });
              
              await chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ['content.css']
              });
              
              // Now send the capture message
              sendCaptureMessage(tab.id);
            } catch (injectionError) {
              console.error('Script injection failed:', injectionError);
              status.textContent = 'Error: Cannot access this page. Please refresh and try again.';
            }
          } else {
            // Content script already exists, send capture message
            sendCaptureMessage(tab.id);
          }
        });
        
      } catch (error) {
        status.textContent = 'Error: Cannot access this page. Please try on a regular webpage.';
        console.error('Tab access error:', error);
      }
    });
  }
  
  function sendCaptureMessage(tabId) {
    chrome.tabs.sendMessage(tabId, { action: 'captureScreenshot' }, (response) => {
      if (chrome.runtime.lastError) {
        status.textContent = 'Error: Content script communication failed. Please refresh the page.';
        console.error('Content script communication error:', chrome.runtime.lastError);
      } else {
        status.textContent = 'Capturing screenshot... Please select an area on the page.';
        window.close();
      }
    });
  }
  
  function displayScreenshot(dataUrl) {
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    screenshotPreview.innerHTML = '';
    screenshotPreview.appendChild(img);
  }
  
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    chatInput.value = '';
    
    // Simulate AI response (this would connect to your backend)
    setTimeout(() => {
      const responses = [
        "I can see the selected area from your screenshot. Based on the visual elements, I notice...",
        "The selected region contains interesting UI elements. To provide better analysis, please connect the extension to Azure OpenAI.",
        "This appears to be a specific part of the webpage. What specific aspect would you like me to analyze?",
        "I'm analyzing the screenshot data. For advanced AI insights, ensure the backend is connected to Azure OpenAI services."
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

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'screenshotCaptured') {
    currentScreenshot = message.dataUrl;
    displayScreenshot(message.dataUrl);
    document.getElementById('status').textContent = 'Screenshot captured! Select an area to analyze.';
  }
});
