// Luo Desktop - Main Desktop Logic
class LuoDesktop {
    constructor() {
        this.windows = [];
        this.zIndex = 100;
        this.activeWindow = null;
        
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDesktopIcons();
        this.setupWindowManagement();
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            document.getElementById('clock').textContent = `${hours}:${minutes}`;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    setupDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
            icon.addEventListener('dblclick', () => {
                const appName = icon.dataset.app;
                this.openApp(appName);
            });
        });
    }

    openApp(appName) {
        // Check if app is already open
        const existingWindow = this.windows.find(w => w.appName === appName && !w.minimized);
        if (existingWindow) {
            this.focusWindow(existingWindow.id);
            return;
        }

        // Create new window
        this.createWindow(appName);
    }

    createWindow(appName) {
        const windowId = `window-${Date.now()}`;
        const appTitles = {
            browser: { title: 'Luo Browser', icon: '🌐' },
            files: { title: 'Files', icon: '📁' },
            terminal: { title: 'Terminal', icon: '⌨️' },
            homey: { title: 'Homey Hub', icon: '🏠' },
            settings: { title: 'Settings', icon: '⚙️' },
            trading: { title: 'Trading', icon: '📈' },
            agent: { title: 'AI Agent', icon: '🤖' },
            notepad: { title: 'Notepad', icon: '📝' },
            calculator: { title: 'Calculator', icon: '🧮' },
            openclaw: { title: 'OpenClaw Launcher', icon: '🦞' }
        };

        const appInfo = appTitles[appName] || { title: appName, icon: '📦' };
        
        const windowEl = document.createElement('div');
        windowEl.className = `window app-${appName}`;
        windowEl.id = windowId;
        windowEl.dataset.app = appName;
        
        // Default position (centered with offset for multiple windows)
        const offset = this.windows.length * 30;
        windowEl.style.left = `${100 + offset}px`;
        windowEl.style.top = `${50 + offset}px`;
        windowEl.style.width = appName === 'browser' ? '900px' : '700px';
        windowEl.style.height = appName === 'browser' ? '600px' : '500px';

        windowEl.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <span class="window-icon">${appInfo.icon}</span>
                    <span>${appInfo.title}</span>
                </div>
                <div class="window-controls">
                    <button class="window-btn minimize" data-action="minimize"></button>
                    <button class="window-btn maximize" data-action="maximize"></button>
                    <button class="window-btn close" data-action="close"></button>
                </div>
            </div>
            <div class="window-content">
                ${this.getAppContent(appName)}
            </div>
        `;

        document.getElementById('windows').appendChild(windowEl);

        const windowObj = {
            id: windowId,
            appName: appName,
            minimized: false,
            maximized: false
        };

        this.windows.push(windowObj);
        this.setupWindowControls(windowEl, windowObj);
        this.focusWindow(windowId);

        // Add to taskbar
        this.addToTaskbar(appName, appInfo.title, appInfo.icon);
    }

    getAppContent(appName) {
        const contents = {
            browser: `
                <div class="browser-toolbar">
                    <button class="browser-nav-btn">←</button>
                    <button class="browser-nav-btn">→</button>
                    <button class="browser-nav-btn">↻</button>
                    <input type="text" class="browser-url-bar" placeholder="Enter URL or luo:// address" value="luo://luosearch">
                </div>
                <iframe class="browser-iframe" src="https://www.google.com" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
            `,
            terminal: `
                <div class="terminal-line"><span class="terminal-prompt">luo@desktop:~$</span> <span class="terminal-input" contenteditable="true"></span></div>
            `,
            homey: `
                <div class="homey-header">
                    <h2>🏠 Homey Devices</h2>
                    <div class="homey-status">
                        <span>●</span> 1,708 devices online
                    </div>
                </div>
                <div class="homey-devices">
                    <div class="homey-device">
                        <div class="homey-device-icon">💡</div>
                        <div class="homey-device-name">Living Room Light</div>
                        <div class="homey-device-status">On • 75%</div>
                    </div>
                    <div class="homey-device">
                        <div class="homey-device-icon">🌡️</div>
                        <div class="homey-device-name">Thermostat</div>
                        <div class="homey-device-status">22°C</div>
                    </div>
                    <div class="homey-device">
                        <div class="homey-device-icon">🔒</div>
                        <div class="homey-device-name">Front Door</div>
                        <div class="homey-device-status">Locked</div>
                    </div>
                    <div class="homey-device">
                        <div class="homey-device-icon">📺</div>
                        <div class="homey-device-name">Living Room TV</div>
                        <div class="homey-device-status">Off</div>
                    </div>
                </div>
            `,
            settings: `
                <div class="settings-section">
                    <h3>System</h3>
                    <div class="settings-item">
                        <span>Dark Mode</span>
                        <div class="settings-toggle active"></div>
                    </div>
                    <div class="settings-item">
                        <span>Notifications</span>
                        <div class="settings-toggle active"></div>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Network</h3>
                    <div class="settings-item">
                        <span>WiFi</span>
                        <span>Connected</span>
                    </div>
                </div>
            `,
            trading: `
                <div class="trading-header">
                    <h2>📈 Trading Dashboard</h2>
                </div>
                <div class="trading-portfolio">
                    <div class="trading-card positive">
                        <div>BTC/USDT</div>
                        <div style="font-size: 24px; font-weight: bold;">$67,432</div>
                        <div style="color: #34d399;">+2.34%</div>
                    </div>
                    <div class="trading-card positive">
                        <div>ETH/USDT</div>
                        <div style="font-size: 24px; font-weight: bold;">$3,567</div>
                        <div style="color: #34d399;">+1.87%</div>
                    </div>
                    <div class="trading-card negative">
                        <div>SOL/USDT</div>
                        <div style="font-size: 24px; font-weight: bold;">$142</div>
                        <div style="color: #f87171;">-0.45%</div>
                    </div>
                </div>
            `,
            agent: `
                <div class="agent-chat">
                    <div class="agent-message assistant">Hello! I'm your AI assistant on Luo Desktop. How can I help you today?</div>
                </div>
                <div class="agent-input-area">
                    <textarea class="agent-input" placeholder="Message AI Agent..." rows="1"></textarea>
                    <button class="agent-send-btn">Send</button>
                </div>
            `,
            files: `
                <div class="files-toolbar">
                    <button class="browser-nav-btn">←</button>
                    <button class="browser-nav-btn">↑</button>
                    <div class="files-breadcrumb">
                        <span>Home</span> / <span>Documents</span>
                    </div>
                </div>
                <div class="files-grid">
                    <div class="file-item">
                        <div class="file-icon">📁</div>
                        <div class="file-name">Projects</div>
                    </div>
                    <div class="file-item">
                        <div class="file-icon">📁</div>
                        <div class="file-name">Downloads</div>
                    </div>
                    <div class="file-item">
                        <div class="file-icon">📁</div>
                        <div class="file-name">Documents</div>
                    </div>
                    <div class="file-item">
                        <div class="file-icon">📄</div>
                        <div class="file-name">readme.txt</div>
                    </div>
                </div>
            `,
            notepad: `
                <textarea style="width: 100%; height: 100%; background: transparent; border: none; color: var(--text); font-family: monospace; font-size: 14px; resize: none; outline: none;" placeholder="Start typing..."></textarea>
            `,
            calculator: `
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 20px;">
                    <div style="grid-column: span 4; background: rgba(0,0,0,0.3); padding: 15px; text-align: right; font-size: 24px; border-radius: 8px; margin-bottom: 10px;">0</div>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">C</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">±</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">%</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: #e94560; color: white; cursor: pointer;">÷</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">7</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">8</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">9</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: #e94560; color: white; cursor: pointer;">×</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">4</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">5</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">6</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: #e94560; color: white; cursor: pointer;">-</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">1</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">2</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">3</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: #e94560; color: white; cursor: pointer;">+</button>
                    <button style="grid-column: span 2; padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">0</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">.</button>
                    <button style="padding: 15px; font-size: 18px; border: none; border-radius: 8px; background: #34d399; color: white; cursor: pointer;">=</button>
                </div>
            `,
            openclaw: `
                <div class="openclaw-launcher" id="openclaw-app">
                    <div style="padding: 20px;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px;">
                            <span style="font-size: 48px;">🦞</span>
                            <h2 style="font-size: 24px; margin: 0;">OpenClaw Launcher</h2>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span style="color: rgba(255,255,255,0.6); font-size: 14px;">Status</span>
                                <span style="font-size: 18px; font-weight: 600;" id="oc-status-text">Checking...</span>
                                <div id="oc-indicator" style="width: 12px; height: 12px; border-radius: 50%; background: #666; margin-left: auto;"></div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 25px;">
                            <button class="oc-btn primary" id="oc-install" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px 20px; border: none; border-radius: 12px; font-size: 14px; cursor: pointer; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;">
                                ⚡ Install OpenClaw
                            </button>
                            <button class="oc-btn" id="oc-start" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px 20px; border: none; border-radius: 12px; font-size: 14px; cursor: pointer; background: rgba(255,255,255,0.1); color: white;">
                                ▶️ Start Gateway
                            </button>
                            <button class="oc-btn" id="oc-setup" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px 20px; border: none; border-radius: 12px; font-size: 14px; cursor: pointer; background: rgba(255,255,255,0.1); color: white;">
                                ⚙️ Setup Wizard
                            </button>
                            <button class="oc-btn" id="oc-refresh" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px 20px; border: none; border-radius: 12px; font-size: 14px; cursor: pointer; background: rgba(255,255,255,0.1); color: white;">
                                🔄 Refresh
                            </button>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px;">
                            <h3 style="font-size: 16px; margin: 0 0 12px 0;">What is OpenClaw?</h3>
                            <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; margin: 0;">OpenClaw is your personal AI assistant that runs locally. Connect to OpenAI, Anthropic, and more to give Wayne real intelligence!</p>
                            
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px;">
                                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">💬 Chat with real AI</div>
                                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">🔗 20+ channels</div>
                                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">🧠 Powerful agents</div>
                                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">🔒 Your data stays local</div>
                            </div>
                        </div>
                        
                        <div id="oc-terminal" style="display: none; background: #0d1117; border-radius: 12px; overflow: hidden; margin-top: 20px;">
                            <div style="display: flex; justify-content: space-between; padding: 10px 15px; background: rgba(255,255,255,0.05); font-size: 13px; color: rgba(255,255,255,0.6);">
                                <span>Terminal</span>
                                <span style="cursor: pointer;" id="oc-terminal-close">✕</span>
                            </div>
                            <div id="oc-terminal-body" style="padding: 15px; font-family: monospace; font-size: 13px; max-height: 150px; overflow-y: auto;"></div>
                        </div>
                    </div>
                </div>
                <script>
                    (function() {
                        // OpenClaw App Logic
                        const checkStatus = async () => {
                            const statusText = document.getElementById('oc-status-text');
                            const indicator = document.getElementById('oc-indicator');
                            
                            try {
                                const response = await fetch('http://127.0.0.1:18789/api/status');
                                if (response.ok) {
                                    statusText.textContent = 'Running ✅';
                                    indicator.style.background = '#34d399';
                                    indicator.style.boxShadow = '0 0 10px #34d399';
                                    return;
                                }
                            } catch (e) {}
                            
                            statusText.textContent = 'Stopped';
                            indicator.style.background = '#f87171';
                        };
                        
                        const showTerminal = () => {
                            document.getElementById('oc-terminal').style.display = 'block';
                        };
                        
                        const log = (text) => {
                            const body = document.getElementById('oc-terminal-body');
                            const line = document.createElement('div');
                            line.style.color = '#c9d1d9';
                            line.style.marginBottom = '4px';
                            line.textContent = text;
                            body.appendChild(line);
                            body.scrollTop = body.scrollHeight;
                        };
                        
                        document.getElementById('oc-install').addEventListener('click', () => {
                            showTerminal();
                            log('🚀 Opening installation instructions...');
                            log('');
                            log('📋 Step 1: Open Command Prompt as Administrator');
                            log('📋 Step 2: Run: npm install -g openclaw');
                            log('📋 Step 3: Run: openclaw onboard');
                            log('');
                            log('This will install OpenClaw globally!');
                        });
                        
                        document.getElementById('oc-start').addEventListener('click', () => {
                            showTerminal();
                            log('▶️ To start OpenClaw Gateway:');
                            log('');
                            log('1. Open Command Prompt');
                            log('2. Run: openclaw gateway');
                            log('');
                            log('Or for background: openclaw gateway --daemon');
                        });
                        
                        document.getElementById('oc-setup').addEventListener('click', () => {
                            showTerminal();
                            log('⚙️ OpenClaw Setup Wizard');
                            log('');
                            log('Run: openclaw onboard');
                            log('');
                            log('This will guide you through:');
                            log('• Selecting AI provider');
                            log('• Entering API keys');
                            log('• Configuring channels');
                        });
                        
                        document.getElementById('oc-refresh').addEventListener('click', checkStatus);
                        document.getElementById('oc-terminal-close').addEventListener('click', () => {
                            document.getElementById('oc-terminal').style.display = 'none';
                        });
                        
                        // Check status on load
                        checkStatus();
                    })();
                </script>
            `
        };

        return contents[appName] || '<div>App content loading...</div>';
    }

    setupWindowControls(windowEl, windowObj) {
        const header = windowEl.querySelector('.window-header');
        
        // Button controls
        windowEl.querySelectorAll('.window-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                
                if (action === 'close') {
                    this.closeWindow(windowObj.id);
                } else if (action === 'minimize') {
                    this.minimizeWindow(windowObj.id);
                } else if (action === 'maximize') {
                    this.toggleMaximize(windowObj.id);
                }
            });
        });

        // Dragging
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-btn')) return;
            isDragging = true;
            dragOffset.x = e.clientX - windowEl.offsetLeft;
            dragOffset.y = e.clientY - windowEl.offsetTop;
            this.focusWindow(windowObj.id);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || windowObj.maximized) return;
            windowEl.style.left = `${e.clientX - dragOffset.x}px`;
            windowEl.style.top = `${e.clientY - dragOffset.y}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Focus on click
        windowEl.addEventListener('mousedown', () => {
            this.focusWindow(windowObj.id);
        });
    }

    focusWindow(windowId) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        this.windows.forEach(w => {
            const el = document.getElementById(w.id);
            if (el) el.style.zIndex = 50;
        });

        windowEl.style.zIndex = ++this.zIndex;
        this.activeWindow = windowId;

        // Update taskbar
        document.querySelectorAll('.taskbar-app').forEach(app => {
            app.classList.remove('active');
        });
        document.querySelector(`.taskbar-app[data-app="${windowEl.dataset.app}"]`)?.classList.add('active');
    }

    minimizeWindow(windowId) {
        const windowEl = document.getElementById(windowId);
        const windowObj = this.windows.find(w => w.id === windowId);
        
        if (windowEl && windowObj) {
            windowObj.minimized = true;
            windowEl.classList.add('minimized');
            
            // Update taskbar
            const taskbarApp = document.querySelector(`.taskbar-app[data-app="${windowObj.appName}"]`);
            if (taskbarApp) taskbarApp.classList.remove('active');
        }
    }

    toggleMaximize(windowId) {
        const windowEl = document.getElementById(windowId);
        const windowObj = this.windows.find(w => w.id === windowId);
        
        if (windowEl && windowObj) {
            windowObj.maximized = !windowObj.maximized;
            windowEl.classList.toggle('maximized', windowObj.maximized);
        }
    }

    closeWindow(windowId) {
        const windowEl = document.getElementById(windowId);
        const windowObj = this.windows.find(w => w.id === windowId);
        
        if (windowEl && windowObj) {
            windowEl.remove();
            this.windows = this.windows.filter(w => w.id !== windowId);
            
            // Remove from taskbar
            const taskbarApp = document.querySelector(`.taskbar-app[data-app="${windowObj.appName}"]`);
            if (taskbarApp) taskbarApp.remove();
        }
    }

    addToTaskbar(appName, title, icon) {
        const taskbarApps = document.getElementById('taskbar-apps');
        const existingApp = taskbarApps.querySelector(`[data-app="${appName}"]`);
        
        if (!existingApp) {
            const appEl = document.createElement('button');
            appEl.className = 'taskbar-app active';
            appEl.dataset.app = appName;
            appEl.innerHTML = `
                <span class="taskbar-app-icon">${icon}</span>
                <span class="taskbar-app-name">${title}</span>
            `;
            
            appEl.addEventListener('click', () => {
                const windowObj = this.windows.find(w => w.appName === appName);
                if (windowObj) {
                    if (windowObj.minimized) {
                        windowObj.minimized = false;
                        document.getElementById(windowObj.id).classList.remove('minimized');
                    }
                    this.focusWindow(windowObj.id);
                } else {
                    this.openApp(appName);
                }
            });
            
            taskbarApps.appendChild(appEl);
        }
    }

    setupWindowManagement() {
        // Handle clicks outside windows
        document.getElementById('desktop').addEventListener('click', () => {
            // Could implement desktop click to deselect
        });
    }
}

// Initialize desktop when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.luoDesktop = new LuoDesktop();
});
