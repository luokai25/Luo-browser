// Luo Desktop - Advanced Window Manager with Physics
class AdvancedWindowManager {
    constructor() {
        this.windows = new Map();
        this.zIndexCounter = 100;
        this.activeWindowId = null;
        this.workspaceCount = 1;
        this.currentWorkspace = 0;
        this.windowHistory = [];
        
        // Physics config
        this.physics = {
            stiffness: 0.8,
            damping: 0.7,
            mass: 1,
            snapThreshold: 20
        };
        
        // Snap zones
        this.snapZones = {
            left: { x: 0, y: 0, width: 0.5, height: 1 },
            right: { x: 0.5, y: 0, width: 0.5, height: 1 },
            top: { x: 0, y: 0, width: 1, height: 0.5 },
            bottom: { x: 0, y: 0.5, width: 1, height: 0.5 },
            topLeft: { x: 0, y: 0, width: 0.5, height: 0.5 },
            topRight: { x: 0.5, y: 0, width: 0.5, height: 0.5 },
            bottomLeft: { x: 0, y: 0.5, width: 0.5, height: 0.5 },
            bottomRight: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 }
        };
        
        this.init();
    }

    init() {
        this.setupKeyboardShortcuts();
        this.setupWorkspaceManagement();
        this.setupDragPhysics();
    }

    createWindow(config) {
        const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const defaults = {
            id,
            title: 'Application',
            icon: '📦',
            appName: 'default',
            width: 700,
            height: 500,
            x: 100 + (this.windows.size * 30),
            y: 50 + (this.windows.size * 30),
            minWidth: 300,
            minHeight: 200,
            resizable: true,
            minimizable: true,
            maximizable: true,
            closable: true,
            alwaysOnTop: false,
            workspace: this.currentWorkspace,
            state: 'normal', // normal, minimized, maximized, pip
            opacity: 1,
            content: '<div>App content</div>',
            tabs: [], // for tabbed windows
            groupId: null
        };

        const windowConfig = { ...defaults, ...config };
        
        const windowEl = this.renderWindow(windowConfig);
        document.getElementById('windows').appendChild(windowEl);
        
        this.windows.set(id, {
            ...windowConfig,
            element: windowEl,
            lastState: null
        });
        
        this.focusWindow(id);
        this.animateWindowIn(windowEl);
        
        // Add to history
        this.windowHistory.unshift({ id, timestamp: Date.now() });
        if (this.windowHistory.length > 20) this.windowHistory.pop();
        
        return id;
    }

    renderWindow(config) {
        const div = document.createElement('div');
        div.className = `window ${config.maximized ? 'maximized' : ''} ${config.minimized ? 'minimized' : ''} ${config.alwaysOnTop ? 'always-on-top' : ''}`;
        div.id = config.id;
        div.style.cssText = `
            left: ${config.x}px;
            top: ${config.y}px;
            width: ${config.width}px;
            height: ${config.height}px;
            min-width: ${config.minWidth}px;
            min-height: ${config.minHeight}px;
            z-index: ${++this.zIndexCounter};
            opacity: ${config.opacity};
        `;

        div.innerHTML = `
            <div class="window-header" data-window-id="${config.id}">
                <div class="window-title">
                    <span class="window-icon">${config.icon}</span>
                    <span class="window-title-text">${config.title}</span>
                    ${config.tabs && config.tabs.length > 0 ? `
                        <div class="window-tabs">
                            ${config.tabs.map((tab, i) => `
                                <button class="window-tab ${i === 0 ? 'active' : ''}" data-tab-index="${i}">${tab.title}</button>
                            `).join('')}
                            <button class="window-tab-add">+</button>
                        </div>
                    ` : ''}
                </div>
                <div class="window-controls">
                    ${config.minimizable ? '<button class="window-btn minimize" data-action="minimize" title="Minimize"></button>' : ''}
                    ${config.maximizable ? '<button class="window-btn maximize" data-action="maximize" title="Maximize"></button>' : ''}
                    ${config.alwaysOnTop ? '<button class="window-btn pin" data-action="pin" title="Always on Top">📌</button>' : ''}
                    ${config.closable ? '<button class="window-btn close" data-action="close" title="Close"></button>' : ''}
                </div>
            </div>
            <div class="window-content">${config.content}</div>
            ${config.resizable ? this.renderResizeHandles() : ''}
        `;

        this.attachWindowEvents(div, config);
        return div;
    }

    renderResizeHandles() {
        return `
            <div class="window-resize resize-n"></div>
            <div class="window-resize resize-s"></div>
            <div class="window-resize resize-e"></div>
            <div class="window-resize resize-w"></div>
            <div class="window-resize resize-ne"></div>
            <div class="window-resize resize-nw"></div>
            <div class="window-resize resize-se"></div>
            <div class="window-resize resize-sw"></div>
        `;
    }

    attachWindowEvents(element, config) {
        const header = element.querySelector('.window-header');
        
        // Window controls
        element.querySelectorAll('.window-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleWindowAction(config.id, btn.dataset.action);
            });
        });

        // Dragging with physics
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let velocity = { x: 0, y: 0 };
        let lastPos = { x: 0, y: 0 };
        let lastTime = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            if (config.maximized) return;
            
            isDragging = true;
            dragStart = { x: e.clientX, y: e.clientY };
            lastPos = { x: element.offsetLeft, y: element.offsetTop };
            lastTime = Date.now();
            
            element.style.transition = 'none';
            this.focusWindow(config.id);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const now = Date.now();
            const dt = now - lastTime;
            
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            
            element.style.left = `${element.offsetLeft + (e.clientX - lastPos.x - (element.offsetLeft - lastPos.x))}px`;
            element.style.top = `${element.offsetTop + (e.clientY - lastPos.y - (element.offsetTop - lastPos.y))}px`;
            
            // Calculate velocity for momentum
            if (dt > 0) {
                velocity.x = (e.clientX - lastPos.x) / dt;
                velocity.y = (e.clientY - lastPos.y) / dt;
            }
            
            lastPos = { x: e.clientX, y: e.clientY };
            lastTime = now;

            // Check snap zones
            this.checkSnapZones(element, e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            
            // Apply momentum
            this.applyMomentum(element, velocity);
        });

        // Focus on click
        element.addEventListener('mousedown', () => {
            if (!isDragging) this.focusWindow(config.id);
        });

        // Resize handles
        element.querySelectorAll('.window-resize').forEach(handle => {
            this.setupResizeHandle(element, handle, handle.className.replace('window-resize resize-', ''));
        });

        // Tabs
        element.querySelectorAll('.window-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                const tabIndex = parseInt(tab.dataset.tabIndex);
                this.switchTab(config.id, tabIndex);
            });
        });
    }

    setupResizeHandle(element, handle, direction) {
        let isResizing = false;
        let startPos = { x: 0, y: 0 };
        let startSize = { w: 0, h: 0 };
        let startOffset = { x: 0, y: 0 };

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startPos = { x: e.clientX, y: e.clientY };
            startSize = { w: element.offsetWidth, h: element.offsetHeight };
            startOffset = { x: element.offsetLeft, y: element.offsetTop };
            element.style.transition = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;

            if (direction.includes('e')) element.style.width = `${Math.max(300, startSize.w + dx)}px`;
            if (direction.includes('w')) {
                element.style.width = `${Math.max(300, startSize.w - dx)}px`;
                element.style.left = `${startOffset.x + dx}px`;
            }
            if (direction.includes('s')) element.style.height = `${Math.max(200, startSize.h + dy)}px`;
            if (direction.includes('n')) {
                element.style.height = `${Math.max(200, startSize.h - dy)}px`;
                element.style.top = `${startOffset.y + dy}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    checkSnapZones(element, mouseX, mouseY) {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight - 56; // Taskbar
        const threshold = this.physics.snapThreshold;

        let snap = null;

        // Left half
        if (mouseX < threshold) {
            snap = this.snapZones.left;
        }
        // Right half
        else if (mouseX > screenW - threshold) {
            snap = this.snapZones.right;
        }
        // Top-left
        else if (mouseX < threshold && mouseY < threshold) {
            snap = this.snapZones.topLeft;
        }
        // Top-right
        else if (mouseX > screenW - threshold && mouseY < threshold) {
            snap = this.snapZones.topRight;
        }
        // Bottom-left
        else if (mouseX < threshold && mouseY > screenH - threshold) {
            snap = this.snapZones.bottomLeft;
        }
        // Bottom-right
        else if (mouseX > screenW - threshold && mouseY > screenH - threshold) {
            snap = this.snapZones.bottomRight;
        }

        if (snap) {
            element.style.left = `${snap.x * screenW}px`;
            element.style.top = `${snap.y * screenH}px`;
            element.style.width = `${snap.width * screenW}px`;
            element.style.height = `${snap.height * screenH}px`;
            element.classList.add('snapped');
        } else {
            element.classList.remove('snapped');
        }
    }

    applyMomentum(element, velocity) {
        const damping = this.physics.damping;
        const stiffness = this.physics.stiffness;
        
        let vx = velocity.x * 15;
        let vy = velocity.y * 15;
        
        const animate = () => {
            if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) return;
            
            const x = element.offsetLeft + vx;
            const y = element.offsetTop + vy;
            
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            
            vx *= damping;
            vy *= damping;
            
            requestAnimationFrame(animate);
        };
        
        element.style.transition = 'left 0.1s, top 0.1s';
        animate();
    }

    handleWindowAction(windowId, action) {
        const win = this.windows.get(windowId);
        if (!win) return;

        switch (action) {
            case 'minimize':
                this.minimizeWindow(windowId);
                break;
            case 'maximize':
                this.toggleMaximize(windowId);
                break;
            case 'close':
                this.closeWindow(windowId);
                break;
            case 'pin':
                this.toggleAlwaysOnTop(windowId);
                break;
        }
    }

    minimizeWindow(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        win.lastState = win.state;
        win.state = 'minimized';
        win.element.classList.add('minimized');
        
        // Store position for restore
        win.element.dataset.restoreX = win.element.style.left;
        win.element.dataset.restoreY = win.element.style.top;
        
        this.updateTaskbar(windowId, 'minimized');
    }

    restoreWindow(windowId) {
        const win = this.windows.get(windowId);
        if (!win || win.state !== 'minimized') return;

        win.state = win.lastState || 'normal';
        win.element.classList.remove('minimized');
        
        this.focusWindow(windowId);
    }

    toggleMaximize(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        if (win.maximized) {
            win.maximized = false;
            win.element.classList.remove('maximized');
            win.element.style.left = win.element.dataset.restoreX || win.x + 'px';
            win.element.style.top = win.element.dataset.restoreY || win.y + 'px';
            win.element.style.width = win.width + 'px';
            win.element.style.height = win.height + 'px';
        } else {
            win.maximized = true;
            win.element.dataset.restoreX = win.element.style.left;
            win.element.dataset.restoreY = win.element.style.top;
            win.element.classList.add('maximized');
        }
    }

    toggleAlwaysOnTop(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        win.alwaysOnTop = !win.alwaysOnTop;
        win.element.classList.toggle('always-on-top', win.alwaysOnTop);
        
        if (win.alwaysOnTop) {
            win.element.style.zIndex = ++this.zIndexCounter + 1000;
        }
    }

    closeWindow(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        // Animate out
        win.element.style.transform = 'scale(0.9)';
        win.element.style.opacity = '0';
        
        setTimeout(() => {
            win.element.remove();
            this.windows.delete(windowId);
            this.removeFromTaskbar(windowId);
        }, 150);
    }

    focusWindow(windowId) {
        const win = this.windows.get(windowId);
        if (!win) return;

        // Update z-index
        win.element.style.zIndex = ++this.zIndexCounter;
        
        // Visual feedback
        this.windows.forEach((w, id) => {
            w.element.classList.toggle('active', id === windowId);
        });

        this.activeWindowId = windowId;
    }

    animateWindowIn(element) {
        element.style.transform = 'scale(0.8) translateY(20px)';
        element.style.opacity = '0';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
            element.style.transform = 'scale(1) translateY(0)';
            element.style.opacity = '1';
        });
    }

    switchTab(windowId, tabIndex) {
        const win = this.windows.get(windowId);
        if (!win || !win.tabs) return;

        win.element.querySelectorAll('.window-tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === tabIndex);
        });

        // Load tab content
        const tab = win.tabs[tabIndex];
        if (tab && tab.content) {
            win.element.querySelector('.window-content').innerHTML = tab.content;
        }
    }

    // Workspace Management
    createWorkspace() {
        this.workspaceCount++;
        // Update UI to show workspace switcher
        return this.workspaceCount - 1;
    }

    switchToWorkspace(index) {
        if (index < 0 || index >= this.workspaceCount) return;
        
        this.currentWorkspace = index;
        
        // Hide/show windows based on workspace
        this.windows.forEach((win, id) => {
            win.element.classList.toggle('hidden', win.workspace !== index);
        });
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + Space = Command Palette
            if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
                e.preventDefault();
                this.openCommandPalette();
            }
            
            // Cmd + M = Minimize
            if ((e.metaKey || e.ctrlKey) && e.key === 'm' && this.activeWindowId) {
                e.preventDefault();
                this.minimizeWindow(this.activeWindowId);
            }
            
            // Cmd + W = Close
            if ((e.metaKey || e.ctrlKey) && e.key === 'w' && this.activeWindowId) {
                e.preventDefault();
                this.closeWindow(this.activeWindowId);
            }
            
            // Cmd + Arrow = Snap
            if ((e.metaKey || e.ctrlKey) && this.activeWindowId) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.snapWindow(this.activeWindowId, 'left');
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.snapWindow(this.activeWindowId, 'right');
                }
            }

            // Escape = Close command palette or minimize window
            if (e.key === 'Escape') {
                this.closeContextMenus();
            }
        });
    }

    snapWindow(windowId, zone) {
        const win = this.windows.get(windowId);
        if (!win) return;

        const screenW = window.innerWidth;
        const screenH = window.innerHeight - 56;
        const snap = this.snapZones[zone];

        win.element.style.left = `${snap.x * screenW}px`;
        win.element.style.top = `${snap.y * screenH}px`;
        win.element.style.width = `${snap.width * screenW}px`;
        win.element.style.height = `${snap.height * screenH}px`;
    }

    setupWorkspaceManagement() {
        // Workspace indicators would be added to taskbar
    }

    setupDragPhysics() {
        // Physics already integrated in drag handlers
    }

    // Taskbar Integration
    updateTaskbar(windowId, state) {
        const taskbarApp = document.querySelector(`.taskbar-app[data-window-id="${windowId}"]`);
        if (taskbarApp) {
            taskbarApp.classList.toggle('minimized', state === 'minimized');
        }
    }

    removeFromTaskbar(windowId) {
        const taskbarApp = document.querySelector(`.taskbar-app[data-window-id="${windowId}"]`);
        if (taskbarApp) taskbarApp.remove();
    }

    // Command Palette
    openCommandPalette() {
        // Dispatch event for CommandPalette component
        window.dispatchEvent(new CustomEvent('openCommandPalette'));
    }

    closeContextMenus() {
        document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
    }

    // Restore closed window
    restoreLastClosed() {
        if (this.windowHistory.length === 0) return;
        
        const last = this.windowHistory[0];
        // Would need to store full window config to restore
        console.log('Would restore:', last.id);
    }
}

// Global instance
window.advancedWindowManager = new AdvancedWindowManager();
