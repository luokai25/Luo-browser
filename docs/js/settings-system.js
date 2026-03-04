// Luo Desktop - Settings & Persistence System
class SettingsSystem {
    constructor() {
        this.settings = {
            // Appearance
            theme: 'dark',
            accentColor: '#6366f1',
            wallpaper: 'default',
            windowEffects: true,
            animations: true,
            reducedMotion: false,
            
            // Taskbar
            taskbarPosition: 'bottom',
            taskbarAutoHide: false,
            dockMagnification: true,
            
            // Desktop
            iconSize: 'medium',
            showDesktopIcons: true,
            desktopArrange: 'grid',
            
            // Sound
            systemSounds: true,
            notificationSound: true,
            volume: 0.7,
            
            // Network
            wifiEnabled: true,
            bluetoothEnabled: false,
            
            // Privacy
            locationEnabled: false,
            telemetryEnabled: false,
            
            // Accessibility
            fontSize: 'normal',
            highContrast: false,
            screenReader: false
        };
        
        this.listeners = new Map();
        
        this.init();
    }

    init() {
        this.load();
        this.bindEvents();
    }

    bindEvents() {
        // Listen for system events
        window.addEventListener('storage', (e) => {
            if (e.key === 'luo-settings') {
                this.settings = JSON.parse(e.newValue);
                this.emit('change', this.settings);
            }
        });
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        const oldValue = this.settings[key];
        this.settings[key] = value;
        
        // Apply the setting
        this.applySetting(key, value);
        
        // Save
        this.save();
        
        // Emit event
        this.emit('change', { key, value, oldValue });
        
        return this;
    }

    getAll() {
        return { ...this.settings };
    }

    setAll(newSettings) {
        Object.entries(newSettings).forEach(([key, value]) => {
            this.settings[key] = value;
            this.applySetting(key, value);
        });
        
        this.save();
        this.emit('change', this.settings);
        
        return this;
    }

    applySetting(key, value) {
        const root = document.documentElement;
        
        switch (key) {
            case 'accentColor':
                root.style.setProperty('--accent-primary', value);
                break;
                
            case 'theme':
                root.setAttribute('data-theme', value);
                break;
                
            case 'animations':
            case 'windowEffects':
                if (!value) {
                    document.body.classList.add('no-animations');
                } else {
                    document.body.classList.remove('no-animations');
                }
                break;
                
            case 'reducedMotion':
                if (value) {
                    document.body.classList.add('reduce-motion');
                } else {
                    document.body.classList.remove('reduce-motion');
                }
                break;
                
            case 'fontSize':
                const sizes = { small: '14px', normal: '16px', large: '18px', xlarge: '20px' };
                root.style.setProperty('--base-font-size', sizes[value] || '16px');
                break;
                
            case 'taskbarPosition':
                const taskbar = document.getElementById('taskbar');
                if (taskbar) {
                    taskbar.style.top = value === 'top' ? '0' : 'auto';
                    taskbar.style.bottom = value === 'bottom' ? '0' : 'auto';
                }
                break;
                
            case 'taskbarAutoHide':
                // Would implement auto-hide
                break;
        }
    }

    save() {
        try {
            localStorage.setItem('luo-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('luo-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
                
                // Apply all settings on load
                Object.entries(this.settings).forEach(([key, value]) => {
                    this.applySetting(key, value);
                });
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
    }

    reset() {
        // Reset to defaults
        const defaults = {
            theme: 'dark',
            accentColor: '#6366f1',
            wallpaper: 'default',
            windowEffects: true,
            animations: true,
            reducedMotion: false,
            taskbarPosition: 'bottom',
            taskbarAutoHide: false,
            dockMagnification: true,
            iconSize: 'medium',
            showDesktopIcons: true,
            desktopArrange: 'grid',
            systemSounds: true,
            notificationSound: true,
            volume: 0.7,
            wifiEnabled: true,
            bluetoothEnabled: false,
            locationEnabled: false,
            telemetryEnabled: false,
            fontSize: 'normal',
            highContrast: false,
            screenReader: false
        };
        
        this.setAll(defaults);
        this.emit('reset');
    }

    export() {
        return JSON.stringify(this.settings, null, 2);
    }

    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.setAll(imported);
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
    }
}

// Window State Persistence
class WindowStateManager {
    constructor() {
        this.state = {
            windows: [],
            workspaces: [
                { id: 0, name: 'Workspace 1', windows: [] }
            ],
            activeWorkspace: 0,
            windowPositions: {}
        };
        
        this.init();
    }

    init() {
        this.load();
    }

    saveWindowState(windowId, config) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;
        
        const state = {
            appName: config.appName,
            title: config.title,
            icon: config.icon,
            x: windowEl.offsetLeft,
            y: windowEl.offsetTop,
            width: windowEl.offsetWidth,
            height: windowEl.offsetHeight,
            maximized: windowEl.classList.contains('maximized'),
            minimized: windowEl.classList.contains('minimized'),
            workspace: this.state.activeWorkspace
        };
        
        this.state.windowPositions[windowId] = state;
        this.save();
    }

    getWindowState(windowId) {
        return this.state.windowPositions[windowId];
    }

    removeWindowState(windowId) {
        delete this.state.windowPositions[windowId];
        this.save();
    }

    save() {
        try {
            localStorage.setItem('luo-window-state', JSON.stringify(this.state));
        } catch (e) {
            console.warn('Could not save window state:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('luo-window-state');
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load window state:', e);
        }
    }

    createWorkspace(name) {
        const id = this.state.workspaces.length;
        this.state.workspaces.push({ id, name, windows: [] });
        this.save();
        return id;
    }

    switchWorkspace(id) {
        this.state.activeWorkspace = id;
        this.save();
        this.emit('workspace-change', id);
    }

    on(event, callback) {
        window.addEventListener(`window-state-${event}`, callback);
    }

    emit(event, data) {
        window.dispatchEvent(new CustomEvent(`window-state-${event}`, { detail: data }));
    }
}

// File System (IndexedDB-based)
class FileSystem {
    constructor() {
        this.db = null;
        this.dbName = 'LuoDesktop';
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                
                // Files store
                if (!db.objectStoreNames.contains('files')) {
                    const filesStore = db.createObjectStore('files', { keyPath: 'path' });
                    filesStore.createIndex('parent', 'parent', { unique: false });
                    filesStore.createIndex('type', 'type', { unique: false });
                }
                
                // Folders store
                if (!db.objectStoreNames.contains('folders')) {
                    const foldersStore = db.createObjectStore('folders', { keyPath: 'path' });
                    foldersStore.createIndex('parent', 'parent', { unique: false });
                }
                
                // Tags store
                if (!db.objectStoreNames.contains('tags')) {
                    db.createObjectStore('tags', { keyPath: 'id' });
                }
                
                // Trash store
                if (!db.objectStoreNames.contains('trash')) {
                    db.createObjectStore('trash', { keyPath: 'path' });
                }
            };
        });
    }

    async listFolder(path = '/') {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['folders', 'files'], 'readonly');
            const results = { folders: [], files: [] };
            
            const foldersStore = tx.objectStore('folders');
            const filesStore = tx.objectStore('files');
            
            foldersStore.index('parent').getAll(path).onsuccess = (e) => {
                results.folders = e.target.result;
            };
            
            filesStore.index('parent').getAll(path).onsuccess = (e) => {
                results.files = e.target.result;
            };
            
            tx.oncomplete = () => resolve(results);
            tx.onerror = () => reject(tx.error);
        });
    }

    async createFolder(path, name) {
        const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
        
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['folders'], 'readwrite');
            const store = tx.objectStore('folders');
            
            store.add({
                path: fullPath,
                parent: path,
                name,
                type: 'folder',
                created: Date.now(),
                modified: Date.now()
            });
            
            tx.oncomplete = () => resolve(fullPath);
            tx.onerror = () => reject(tx.error);
        });
    }

    async createFile(path, name, content = '') {
        const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
        
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['files'], 'readwrite');
            const store = tx.objectStore('files');
            
            store.add({
                path: fullPath,
                parent: path,
                name,
                type: 'file',
                content,
                size: content.length,
                created: Date.now(),
                modified: Date.now()
            });
            
            tx.oncomplete = () => resolve(fullPath);
            tx.onerror = () => reject(tx.error);
        });
    }

    async readFile(path) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['files'], 'readonly');
            const store = tx.objectStore('files');
            
            store.get(path).onsuccess = (e) => {
                resolve(e.target.result);
            };
            
            tx.onerror = () => reject(tx.error);
        });
    }

    async writeFile(path, content) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['files'], 'readwrite');
            const store = tx.objectStore('files');
            
            store.get(path).onsuccess = (e) => {
                const file = e.target.result;
                if (file) {
                    file.content = content;
                    file.size = content.length;
                    file.modified = Date.now();
                    store.put(file);
                }
            };
            
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async delete(path) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['files', 'folders'], 'readwrite');
            
            tx.objectStore('files').delete(path);
            tx.objectStore('folders').delete(path);
            
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async move(fromPath, toPath) {
        // Would implement move logic
    }

    async copy(path) {
        // Would implement copy logic
    }

    async search(query) {
        // Would implement search
    }
}

// Initialize systems
window.luoSettings = new SettingsSystem();
window.windowStateManager = new WindowStateManager();
window.luoFileSystem = new FileSystem();
