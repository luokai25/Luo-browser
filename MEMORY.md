# Luo Desktop - Project Memory

## What is Luo Desktop?
A dual-access desktop environment for both humans and AI agents.
- Human users get a web-based desktop UI
- AI agents access via API with luo:// protocol
- Built by luokai25 (Abdelrahman/Luo Kai)

## Current Status: IN DEVELOPMENT

### Features Implemented (2026-03-04)
- [x] **Core Desktop UI** - index.html with all apps
- [x] **Visual Design** - Glassmorphism, dark theme, dynamic backgrounds, particles
- [x] **Advanced Window Manager** - Physics-based dragging, snap zones, resize from all edges
- [x] **Command Palette** - ⌘Space to search apps, files, commands, calculator
- [x] **Notification System** - Toast notifications, notification center, DND
- [x] **Advanced Taskbar** - Dock with magnification, system tray, clock
- [x] **Settings System** - Persistent settings with localStorage
- [x] **Window State Persistence** - Remembers window positions
- [x] **File System (IndexedDB)** - Basic file/folder CRUD
- [x] **Widget System** - Clock, Weather, Calendar, Notes, System Stats, Music, Quick Links, Stocks
- [x] **Media Player** - Full music player with playlist

### 14 Built-in Apps
1. 🌐 Browser - Web browsing with luo:// protocol
2. 📁 Files - File browser
3. ⌨️ Terminal - Command line
4. 🏠 Homey - Smart home (1,708 devices!)
5. ⚙️ Settings - System settings
6. 📈 Trading - Crypto dashboard
7. 🤖 AI Agent - Chat interface
8. 📝 Notepad - Text editor
9. 🧮 Calculator
10. 📅 Calendar
11. 🎵 Music - Full media player
12. 🎬 Video - Video player
13. 📷 Camera
14. 📒 Notes

### Features Planned
- [ ] Virtual desktops/workspaces
- [ ] Window tabs/groups
- [ ] PiP mode
- [ ] Multi-user accounts
- [ ] Actual Homey API integration
- [ ] Actual Trading API integration

### Tech Stack
- Frontend: Vanilla HTML/CSS/JS (no framework)
- Backend: Node.js/Express (planned)
- Storage: IndexedDB

## Code Location
`/root/.openclaw/workspace/Luo-browser/`

## Run
```bash
cd Luo-browser
npm install express
node src/index.js
# Open http://localhost:3000/desktop
```

## Keyboard Shortcuts
- ⌘+Space - Command Palette
- ⌘+M - Minimize window
- ⌘+W - Close window
- ⌘+←/→ - Snap window

## Last Updated
2026-03-04
