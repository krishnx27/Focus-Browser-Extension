# FocusBoard Chrome Extension

FocusBoard is a calm, minimal personal productivity dashboard that replaces Chrome's default New Tab page. It features a daily focus priority reminder, a glassmorphic task list, and an integrated Focus Mode distraction blocker.

---

## Features

- **Live Clock & Date**: Clean centered typography with 12-hour or 24-hour display options.
- **Dynamic Greeting**: Time-aware greeting personalized with your name.
- **Daily Focus**: Enter one main priority for the day that automatically resets at midnight.
- **Sidebar Task List**: Fast, glassmorphic right-hand sidebar to add, complete, and delete tasks with smooth animations.
- **Focus Mode Blocker**: Block distracting websites (Instagram, YouTube, Reddit, X/Twitter, etc.) with automatic redirection to an inspiring "Take a Moment" block screen.
- **Custom Wallpaper**: Upload your own wallpaper (up to 5MB) or reset to the calm default background anytime.
- **Zero Cloud / Privacy-First**: All your data is stored locally on your machine using `chrome.storage.local`.

---

## How to Install & Run in Google Chrome

Follow these simple steps to load the extension:

1. **Open Chrome Extensions Page**:
   - In Google Chrome, type or paste `chrome://extensions` in the address bar and press **Enter**.
2. **Enable Developer Mode**:
   - In the top-right corner of the page, toggle the **Developer mode** switch to **ON**.
3. **Load Unpacked Extension**:
   - Click the **"Load unpacked"** button in the top-left corner.
   - In the folder picker dialog, select this extension folder (`A:\Extension`).
   - Click **Select Folder**.
4. **Open a New Tab**:
   - Press `Ctrl + T` (or click `+`) to open a new tab.
   - Your FocusBoard dashboard is now active!

---

## Project Structure

```text
├── manifest.json       # Manifest V3 extension configuration
├── background.js       # Background service worker handling Declarative Net Request rules
├── newtab.html         # New Tab dashboard DOM structure
├── newtab.css          # Modern glassmorphic styles and animations
├── newtab.js           # Clock, greeting, daily focus, tasks, and focus mode toggle
├── settings.js         # Settings modal, wallpaper upload, and domain blocklist
├── blocked.html        # Interceptor screen when visiting paused sites
├── blocked.css         # Styling for the blocked interception screen
├── blocked.js          # Logic for blocked page reminders and navigation
├── assets/
│   └── default-wallpaper.jpg
├── icons/              # Extension icons (16px, 48px, 128px)
└── README.md           # Setup and usage guide
```
