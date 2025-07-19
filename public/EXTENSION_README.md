
# ScreenScribe AI Chrome Extension

## Quick Start

1. Copy all files from this directory to a local folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select your folder
5. Click the extension icon to start using ScreenScribe AI

## Features

- 📸 Automatic screenshot capture
- 🎯 Interactive area selection (rectangle/circle)
- 💬 AI-powered chat interface
- 🎨 Professional overlay design
- 💾 Persistent storage of selections

## Files Overview

- `manifest.json` - Extension configuration
- `background.js` - Service worker for core functionality
- `content.js` - Injected script for page interaction
- `content.css` - Styles for overlay interface
- `popup.html/js` - Extension popup and chat interface
- `overlay.html` - Web accessible overlay page
- `icons/` - Extension icons in multiple sizes

## Backend Integration

To connect with Azure OpenAI:

1. Set up a backend server with LangChain
2. Update API endpoints in `popup.js`
3. Handle authentication securely
4. Process screenshots and selections

## Development

For development and testing:
- Reload extension after changes
- Check console for errors
- Test on various websites
- Use Developer Tools for debugging

Ready to use! 🚀
