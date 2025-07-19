
// Background service worker for ScreenScribe AI Extension

// Install and activate event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('ScreenScribe AI Extension installed');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.action === 'requestScreenshot') {
    handleScreenshotRequest(message, sender, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'screenshotCaptured') {
    handleScreenshotCaptured(message, sender, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'openChat') {
    // Store selected area data
    chrome.storage.local.set({
      selectedArea: message.selectedArea,
      screenshot: message.screenshot
    }, () => {
      // Notify popup that data is saved
      chrome.runtime.sendMessage({
        action: 'chatDataSaved',
        success: true
      });
      sendResponse({ success: true });
    });
    return true;
  }
});

function handleScreenshotRequest(message, sender, sendResponse) {
  // Get the tab that requested the screenshot
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    
    // Capture visible tab
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Screenshot capture failed:', chrome.runtime.lastError);
        
        // Send failure back to popup
        chrome.runtime.sendMessage({
          action: 'screenshotResult',
          success: false,
          error: chrome.runtime.lastError.message
        });
        
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('Screenshot captured successfully');
        
        // Send screenshot to content script for overlay display
        chrome.tabs.sendMessage(tab.id, {
          action: 'displayScreenshot',
          screenshot: dataUrl
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to send screenshot to content script:', chrome.runtime.lastError);
            
            // Send failure back to popup
            chrome.runtime.sendMessage({
              action: 'screenshotResult',
              success: false,
              error: 'Failed to display screenshot overlay'
            });
          } else {
            // Send success back to popup
            chrome.runtime.sendMessage({
              action: 'screenshotResult',
              success: true,
              screenshot: dataUrl
            });
          }
        });
        
        sendResponse({ success: true, screenshot: dataUrl });
      }
    });
  });
}

function handleScreenshotCaptured(message, sender, sendResponse) {
  // Store the captured screenshot and selected area
  chrome.storage.local.set({
    currentScreenshot: message.screenshot,
    selectedArea: message.selectedArea,
    timestamp: Date.now()
  }, () => {
    // Notify popup that screenshot is ready
    chrome.runtime.sendMessage({
      action: 'screenshotReady',
      screenshot: message.screenshot,
      selectedArea: message.selectedArea
    });
    
    sendResponse({ success: true });
  });
}
