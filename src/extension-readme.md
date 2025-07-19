# ScreenScribe AI Chrome Extension

## Chrome Extension Files Created

The following files have been added to create a fully functional Chrome extension:

### Core Extension Files
- `public/manifest.json` - Extension manifest with permissions and configuration
- `public/background.js` - Background service worker for handling extension logic
- `public/content.js` - Content script injected into web pages
- `public/content.css` - Styles for the overlay interface
- `public/popup.html` - Extension popup interface
- `public/popup.js` - Popup functionality and chat interface

## How to Install the Extension

1. **Build the React App** (if needed):
   ```bash
   npm run build
   ```

2. **Open Chrome Extensions Page**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `public` folder from this project
   - The extension should now appear in your extensions list

## How to Use

1. **Activate Extension**: Click the ScreenScribe AI icon in the Chrome toolbar
2. **Capture Screenshot**: The extension will automatically capture the current tab
3. **Select Area**: Use rectangle or circle tools to select areas of interest
4. **Chat**: Click "Open Chat" to analyze the selected area

## Extension Features

### 🎯 Core Functionality
- ✅ Automatic screenshot capture of current tab
- ✅ Interactive overlay with selection tools (rectangle/circle)
- ✅ Popup chat interface for AI interaction
- ✅ Persistent storage of screenshots and selections

### 🛠️ Technical Features
- ✅ Manifest V3 compliance
- ✅ Content script injection
- ✅ Background service worker
- ✅ Cross-origin permissions
- ✅ Storage API integration

### 🎨 UI/UX Features
- ✅ Professional overlay design
- ✅ Smooth animations and interactions
- ✅ Responsive popup interface
- ✅ Visual feedback and status updates

## Backend Integration

To connect with Azure OpenAI and LangChain:

1. **Set up a backend server** (Node.js/Python) that can:
   - Receive screenshot data and selected areas
   - Process images with Azure Computer Vision
   - Send prompts to Azure OpenAI
   - Return AI responses

2. **Update the extension** to send requests to your backend:
   - Modify `popup.js` sendMessage function
   - Add your backend API endpoint
   - Handle authentication and API keys securely

## Extension Permissions Explained

- `activeTab` - Access current tab for screenshots
- `storage` - Save screenshot and selection data
- `scripting` - Inject content scripts
- `tabs` - Capture tab screenshots
- `<all_urls>` - Work on any website

## File Structure
```
public/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker
├── content.js         # Page injection script
├── content.css        # Overlay styles
├── popup.html         # Extension popup UI
├── popup.js          # Popup functionality
└── icons/            # Extension icons (you need to add these)
```

## Next Steps

1. **Add Icons**: Create icon files (16x16, 32x32, 48x48, 128x128) and place them in `public/icons/`
2. **Backend Setup**: Create your LangChain + Azure OpenAI backend
3. **API Integration**: Connect the extension to your backend API
4. **Testing**: Test on various websites and refine the user experience
5. **Publishing**: Submit to Chrome Web Store when ready

The extension is now ready to be loaded as an unpacked extension in Chrome Developer mode!