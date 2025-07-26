# Notion Emoji Blocker

A Chrome extension that blocks Notion from replacing system emoji with the Twitter emoji spritesheet, allowing you to see your system's native emoji instead.

## What it does

This extension prevents Notion from loading the Twitter emoji spritesheet (`twitter-emoji-spritesheet-64.2d0a6b9b.png`) by:
- Using Chrome's declarativeNetRequest API to block the network request
- Intercepting fetch() and XMLHttpRequest calls as a backup method
- Logging blocked requests to the console for debugging

## Installation

1. **Download the extension files**
   - Save all files in this folder to your computer

2. **Enable Developer Mode in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" on (top right corner)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the folder containing these extension files
   - The extension should now appear in your extensions list

4. **Verify installation**
   - Navigate to Notion.so
   - Open Developer Tools (F12) and check the Console tab
   - You should see "Notion Emoji Blocker: Content script loaded"
   - Any blocked emoji requests will be logged

## How to test

1. Go to any Notion page with emoji
2. Open Chrome DevTools (F12) → Console tab
3. Look for messages like "Blocked Twitter emoji spritesheet request"
4. Emoji should now display using your system's native emoji instead of Twitter's

## Files included

- `manifest.json` - Extension configuration
- `rules.json` - Network request blocking rules
- `content.js` - Content script for additional protection
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons
- `README.md` - This installation guide

## Troubleshooting

If the extension isn't working:
1. Make sure it's enabled in `chrome://extensions/`
2. Try refreshing the Notion page
3. Check the Console for any error messages
4. Ensure you're using Chrome (Manifest V3 required)