
# ScreenScribe AI Chrome Extension Setup Guide

## Step 1: Download Extension Files

You need to copy these files from the Lovable project to your local machine:

### Required Files:
- `public/manifest.json`
- `public/background.js`
- `public/content.js`
- `public/content.css`
- `public/popup.html`
- `public/popup.js`
- `public/overlay.html`
- `public/icons/` (directory with icon files)

## Step 2: Create Local Extension Directory

1. Create a new folder on your computer (e.g., `screenscribe-extension`)
2. Copy all the files from the `public/` directory into this folder
3. Your folder structure should look like:

```
screenscribe-extension/
├── manifest.json
├── background.js
├── content.js
├── content.css
├── popup.html
├── popup.js
├── overlay.html
├── generate-icons.js
└── icons/
    ├── icon.svg
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Step 3: Generate Icons (if needed)

If the PNG icon files are missing or corrupted:

1. Install Node.js if you haven't already
2. In your extension directory, run:
   ```bash
   node generate-icons.js
   ```
3. Alternatively, create simple 16x16, 32x32, 48x48, and 128x128 PNG files manually

## Step 4: Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right corner)
3. Click "Load unpacked"
4. Select your `screenscribe-extension` folder
5. The extension should now appear in your extensions list

## Step 5: Test the Extension

1. Click the ScreenScribe AI icon in the Chrome toolbar
2. Try the "Capture Screenshot" button
3. Test the annotation tools on any webpage
4. Verify the chat interface opens properly

## Troubleshooting

### Common Issues:

1. **"Manifest not found" error**:
   - Ensure `manifest.json` is in the root of your extension folder
   - Check that the file is properly formatted JSON

2. **Icons not displaying**:
   - Verify icon files exist in the `icons/` directory
   - Run the `generate-icons.js` script
   - Or create simple PNG files manually

3. **Extension not loading**:
   - Check the Chrome Extensions page for error messages
   - Ensure all file paths in manifest.json are correct
   - Refresh the extension after making changes

4. **Screenshot not working**:
   - Ensure you've granted necessary permissions
   - Try refreshing the webpage before using the extension
   - Check browser console for JavaScript errors

### Development Tips:

- Use "Reload" button in Chrome Extensions page after making changes
- Check the browser console and extension console for errors
- Test on different websites to ensure compatibility

## Next Steps

Once the extension is working:

1. Set up your backend server with LangChain and Azure OpenAI
2. Update the API endpoints in `popup.js`
3. Add proper error handling and user feedback
4. Test thoroughly before distribution

## File Transfer Instructions

To get the extension files from this Lovable project:

1. **Download from Lovable**: Use the download/export feature if available
2. **Manual Copy**: Copy the content of each file from the Lovable editor
3. **GitHub**: If the project is connected to GitHub, clone the repository

### Files to Copy:
```
public/manifest.json → manifest.json
public/background.js → background.js
public/content.js → content.js
public/content.css → content.css
public/popup.html → popup.html
public/popup.js → popup.js
public/overlay.html → overlay.html
public/generate-icons.js → generate-icons.js
public/icons/icon.svg → icons/icon.svg
```

After copying, follow the installation steps above.
