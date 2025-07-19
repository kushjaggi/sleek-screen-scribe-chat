
// Background service worker for ScreenScribe AI Extension

// Install and activate event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('ScreenScribe AI Extension installed');
});

// Handle messages from content scripts and popup
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
    }, () => {
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }
});
