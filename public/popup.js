
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
      
      try {
        // Inject content script if not already injected
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Also inject CSS
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content.css']
        });
        
        // Send message to content script to start screenshot capture
        chrome.tabs.sendMessage(tab.id, { action: 'captureScreenshot' }, (response) => {
          if (chrome.runtime.lastError) {
            status.textContent = 'Error: Please refresh the page and try again.';
            console.error('Content script communication error:', chrome.runtime.lastError);
          } else {
            status.textContent = 'Capturing screenshot... Please select an area on the page.';
            // Close popup to allow user interaction with page
            window.close();
          }
        });
        
      } catch (error) {
        status.textContent = 'Error: Unable to capture screenshot. Please refresh the page.';
        console.error('Script injection error:', error);
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
