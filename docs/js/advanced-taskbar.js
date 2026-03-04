// Luo Desktop - Advanced Taskbar
class AdvancedTaskbar {
    constructor() {
        this.dockMode = 'bottom';
        this.autoHide = false;
        this.pinnedApps = [];
        this.runningApps = new Map();
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.startClock();
    }

    render() {
        const taskbar = document.createElement('div');
        taskbar.id = 'taskbar';
        taskbar.className = 'taskbar';
        
        taskbar.innerHTML = `
            <!-- Dock Section -->
            <div class="taskbar-dock">
                <button class="dock-item start-btn" data-app="start">
                    <span class="dock-icon">⌂</span>
                </button>
                
                <div class="dock-apps">
                    <!-- Pinned apps -->
                </div>
                
                <div class="dock-separator"></div>
                
                <button class="dock-item system-btn" data-app="system">
                    <span class="dock-icon">⚙️</span>
                </button>
            </div>

            <!-- Window Strip -->
            <div class="taskbar-windows">
                <!-- Running windows appear here -->
            </div>

            <!-- System Tray -->
            <div class="taskbar-tray">
                <button class="tray-item notification-bell" data-action="notifications">
                    <span class="tray-icon">🔔</span>
                    <span class="tray-badge"></span>
                </button>
                
                <div class="tray-divider"></div>
                
                <button class="tray-item tray-wifi" data-action="wifi">
                    <span class="tray-icon">📶</span>
                </button>
                
                <button class="tray-item tray-volume" data-action="volume">
                    <span class="tray-icon">🔊</span>
                </button>
                
                <button class="tray-item tray-battery" data-action="battery">
                    <span class="tray-icon">🔋</span>
                </button>
                
                <div class="tray-clock">
                    <span class="clock-time">--:--</span>
                    <span class="clock-date">---</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(taskbar);
        this.element = taskbar;
        
        // Add default pinned apps
        this.setDefaultPinnedApps();
    }

    setDefaultPinnedApps() {
        this.pinnedApps = [
            { id: 'browser', icon: '🌐', name: 'Browser' },
            { id: 'files', icon: '📁', name: 'Files' },
            { id: 'terminal', icon: '⌨️', name: 'Terminal' },
            { id: 'homey', icon: '🏠', name: 'Homey' },
            { id: 'settings', icon: '⚙️', name: 'Settings' },
            { id: 'trading', icon: '📈', name: 'Trading' },
        ];
        this.renderDockApps();
    }

    renderDockApps() {
        const container = this.element.querySelector('.dock-apps');
        container.innerHTML = this.pinnedApps.map(app => `
            <button class="dock-item dock-app" data-app="${app.id}" title="${app.name}">
                <span class="dock-icon">${app.icon}</span>
                <span class="dock-tooltip">${app.name}</span>
                <div class="dock-indicator"></div>
            </button>
        `).join('');
        
        // Bind click events
        container.querySelectorAll('.dock-app').forEach(item => {
            item.addEventListener('click', () => {
                const appId = item.dataset.app;
                if (appId === 'start') {
                    this.toggleStartMenu();
                } else if (window.luoDesktop) {
                    window.luoDesktop.openApp(appId);
                }
            });
            
            // Context menu
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showDockContextMenu(e, item.dataset.app);
            });
            
            // Magnification effect
            item.addEventListener('mouseenter', () => this.handleDockHover(item, true));
            item.addEventListener('mouseleave', () => this.handleDockHover(item, false));
        });
    }

    handleDockHover(item, isHovering) {
        if (!isHovering) {
            item.style.transform = 'scale(1) translateY(0)';
            return;
        }
        
        // Magnification logic
        const allItems = this.element.querySelectorAll('.dock-item');
        const index = Array.from(allItems).indexOf(item);
        const maxScale = 1.4;
        const scaleStep = 0.15;
        
        allItems.forEach((el, i) => {
            const distance = Math.abs(i - index);
            const scale = Math.max(1, maxScale - (distance * scaleStep));
            const translateY = (maxScale - scale) * 20;
            
            el.style.transform = `scale(${scale}) translateY(-${translateY}px)`;
            el.style.zIndex = distance === 0 ? 100 : (100 - distance);
        });
    }

    bindEvents() {
        // Start button
        this.element.querySelector('.start-btn').addEventListener('click', () => {
            this.toggleStartMenu();
        });
        
        // System button
        this.element.querySelector('.system-btn').addEventListener('click', () => {
            if (window.luoDesktop) window.luoDesktop.openApp('settings');
        });
        
        // Tray items
        this.element.querySelectorAll('.tray-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleTrayAction(item.dataset.action);
            });
        });
        
        // Click outside to close start menu
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.start-menu') && !e.target.closest('.start-btn')) {
                this.closeStartMenu();
            }
        });
    }

    toggleStartMenu() {
        let menu = document.querySelector('.start-menu');
        
        if (!menu) {
            menu = this.createStartMenu();
            document.body.appendChild(menu);
        }
        
        menu.classList.toggle('open');
    }

    createStartMenu() {
        const menu = document.createElement('div');
        menu.className = 'start-menu';
        
        menu.innerHTML = `
            <div class="start-menu-search">
                <input type="text" placeholder="Search apps...">
            </div>
            <div class="start-menu-grid">
                <div class="start-menu-section">
                    <div class="section-title">Pinned</div>
                    <div class="section-apps">
                        ${this.pinnedApps.map(app => `
                            <button class="start-menu-app" data-app="${app.id}">
                                <span class="app-icon">${app.icon}</span>
                                <span class="app-name">${app.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="start-menu-section">
                    <div class="section-title">All Apps</div>
                    <div class="section-apps">
                        ${this.getAllApps().map(app => `
                            <button class="start-menu-app" data-app="${app.id}">
                                <span class="app-icon">${app.icon}</span>
                                <span class="app-name">${app.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="start-menu-footer">
                <button class="footer-btn" data-action="settings">
                    <span>⚙️</span> Settings
                </button>
                <button class="footer-btn" data-action="power">
                    <span>⏻</span> Power
                </button>
            </div>
        `;
        
        // Bind events
        menu.querySelectorAll('.start-menu-app').forEach(app => {
            app.addEventListener('click', () => {
                if (window.luoDesktop) {
                    window.luoDesktop.openApp(app.dataset.app);
                }
                this.closeStartMenu();
            });
        });
        
        menu.querySelectorAll('.footer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.action === 'settings') {
                    if (window.luoDesktop) window.luoDesktop.openApp('settings');
                } else if (btn.dataset.action === 'power') {
                    this.showPowerMenu();
                }
                this.closeStartMenu();
            });
        });
        
        // Search functionality
        const searchInput = menu.querySelector('input');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            menu.querySelectorAll('.start-menu-app').forEach(app => {
                const name = app.querySelector('.app-name').textContent.toLowerCase();
                app.style.display = name.includes(query) ? 'flex' : 'none';
            });
        });
        
        return menu;
    }

    getAllApps() {
        return [
            ...this.pinnedApps,
            { id: 'notepad', icon: '📝', name: 'Notepad' },
            { id: 'calculator', icon: '🧮', name: 'Calculator' },
            { id: 'calendar', icon: '📅', name: 'Calendar' },
            { id: 'music', icon: '🎵', name: 'Music' },
            { id: 'video', icon: '🎬', name: 'Video' },
            { id: 'camera', icon: '📷', name: 'Camera' },
            { id: 'agent', icon: '🤖', name: 'AI Agent' },
            { id: 'mail', icon: '📧', name: 'Mail' },
            { id: 'photos', icon: '🖼️', name: 'Photos' },
        ];
    }

    closeStartMenu() {
        const menu = document.querySelector('.start-menu');
        if (menu) menu.classList.remove('open');
    }

    showDockContextMenu(e, appId) {
        const existing = document.querySelector('.dock-context-menu');
        if (existing) existing.remove();
        
        const menu = document.createElement('div');
        menu.className = 'dock-context-menu context-menu';
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        
        const isRunning = this.runningApps.has(appId);
        
        menu.innerHTML = `
            <div class="context-menu-item" data-action="open">
                <span class="icon">📂</span> Open
            </div>
            ${isRunning ? `
                <div class="context-menu-item" data-action="hide">
                    <span class="icon">👁️</span> Hide
                </div>
            ` : ''}
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="pin">
                <span class="icon">📌</span> Pin to Dock
            </div>
            <div class="context-menu-item" data-action="unpin">
                <span class="icon">📍</span> Unpin
            </div>
        `;
        
        document.body.appendChild(menu);
        
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleDockContextAction(appId, item.dataset.action);
                menu.remove();
            });
        });
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function close() {
                menu.remove();
                document.removeEventListener('click', close);
            });
        }, 0);
    }

    handleDockContextAction(appId, action) {
        switch (action) {
            case 'open':
                if (window.luoDesktop) window.luoDesktop.openApp(appId);
                break;
            case 'hide':
                // Would hide the window
                break;
            case 'pin':
                // Pin app
                break;
            case 'unpin':
                // Unpin app
                this.pinnedApps = this.pinnedApps.filter(a => a.id !== appId);
                this.renderDockApps();
                break;
        }
    }

    handleTrayAction(action) {
        switch (action) {
            case 'notifications':
                window.notificationSystem.toggle();
                break;
            case 'wifi':
                // Toggle wifi
                break;
            case 'volume':
                // Show volume slider
                break;
            case 'battery':
                // Show battery info
                break;
        }
    }

    showPowerMenu() {
        const existing = document.querySelector('.power-menu');
        if (existing) existing.remove();
        
        const menu = document.createElement('div');
        menu.className = 'power-menu context-menu';
        
        const rect = this.element.querySelector('.footer-btn[data-action="power"]').getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.bottom = `${56 + 10}px`;
        menu.style.right = '10px';
        
        menu.innerHTML = `
            <div class="context-menu-item" data-action="lock">
                <span class="icon">🔒</span> Lock
            </div>
            <div class="context-menu-item" data-action="sleep">
                <span class="icon">💤</span> Sleep
            </div>
            <div class="context-menu-item" data-action="restart">
                <span class="icon">🔄</span> Restart
            </div>
            <div class="context-menu-item" data-action="shutdown">
                <span class="icon">⏻</span> Shut Down
            </div>
        `;
        
        document.body.appendChild(menu);
    }

    startClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const timeEl = this.element.querySelector('.clock-time');
            const dateEl = this.element.querySelector('.clock-date');
            
            if (timeEl) timeEl.textContent = `${hours}:${minutes}`;
            if (dateEl) {
                const options = { weekday: 'short', month: 'short', day: 'numeric' };
                dateEl.textContent = now.toLocaleDateString('en-US', options);
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    // Window management
    addWindow(windowId, appName, appIcon, appTitle) {
        this.runningApps.set(windowId, { appName, appIcon, appTitle });
        this.renderWindows();
    }

    removeWindow(windowId) {
        this.runningApps.delete(windowId);
        this.renderWindows();
    }

    renderWindows() {
        const container = this.element.querySelector('.taskbar-windows');
        
        if (this.runningApps.size === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = Array.from(this.runningApps.entries()).map(([id, app]) => `
            <button class="taskbar-window" data-window-id="${id}">
                <span class="window-icon">${app.appIcon}</span>
                <span class="window-title">${app.appTitle}</span>
            </button>
        `).join('');
        
        container.querySelectorAll('.taskbar-window').forEach(item => {
            item.addEventListener('click', () => {
                const windowId = item.dataset.windowId;
                // Focus or minimize window
                if (window.advancedWindowManager) {
                    window.advancedWindowManager.focusWindow(windowId);
                }
            });
        });
    }

    // Notifications badge
    setNotificationCount(count) {
        const badge = this.element.querySelector('.tray-badge');
        if (badge) {
            badge.textContent = count > 0 ? count : '';
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }
}

// Initialize
window.advancedTaskbar = new AdvancedTaskbar();
