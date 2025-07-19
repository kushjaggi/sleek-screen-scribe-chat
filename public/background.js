// Background service worker for ScreenScribe AI Extension

// Install and activate event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('ScreenScribe AI Extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Inject content script if not already injected
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    // Send message to content script to start screenshot capture
    chrome.tabs.sendMessage(tab.id, { action: 'captureScreenshot' });
  } catch (error) {
    console.error('Error injecting content script:', error);
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureTab') {
    // Capture visible tab
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Screenshot capture failed:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, dataUrl: dataUrl });
      }
    });
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'openChat') {
    // Store selected area data
    chrome.storage.local.set({
      selectedArea: message.selectedArea,
      screenshot: message.screenshot
    });
    
    // Open extension popup or side panel
    chrome.action.openPopup();
    sendResponse({ success: true });
  }
});