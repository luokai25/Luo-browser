// Luo Desktop - Command Palette (Spotlight/Alfred style)
class CommandPalette {
    constructor() {
        this.isOpen = false;
        this.query = '';
        this.selectedIndex = 0;
        this.results = [];
        this.categories = {
            apps: [],
            files: [],
            settings: [],
            web: [],
            commands: [],
            calculator: null
        };
        
        this.commands = [
            { id: 'restart', name: 'Restart', icon: '🔄', category: 'commands' },
            { id: 'shutdown', name: 'Shutdown', icon: '⏻', category: 'commands' },
            { id: 'sleep', name: 'Sleep', icon: '💤', category: 'commands' },
            { id: 'lock', name: 'Lock Screen', icon: '🔒', category: 'commands' },
            { id: 'new-window', name: 'New Window', icon: '➕', category: 'commands' },
            { id: 'settings', name: 'Open Settings', icon: '⚙️', category: 'settings' },
            { id: 'wallpaper', name: 'Change Wallpaper', icon: '🖼️', category: 'settings' },
            { id: 'theme', name: 'Change Theme', icon: '🎨', category: 'settings' },
        ];
        
        this.init();
    }

    init() {
        this.createPalette();
        this.bindEvents();
        this.loadApps();
    }

    createPalette() {
        const palette = document.createElement('div');
        palette.id = 'command-palette';
        palette.className = 'command-palette';
        palette.innerHTML = `
            <div class="palette-backdrop"></div>
            <div class="palette-container">
                <div class="palette-input-wrapper">
                    <span class="palette-icon">🔍</span>
                    <input type="text" class="palette-input" placeholder="Search apps, files, commands..." autocomplete="off">
                    <span class="palette-badge">⌘Space</span>
                </div>
                <div class="palette-results">
                    <div class="palette-section" data-section="apps">
                        <div class="palette-section-title">Applications</div>
                        <div class="palette-items"></div>
                    </div>
                    <div class="palette-section" data-section="files">
                        <div class="palette-section-title">Recent Files</div>
                        <div class="palette-items"></div>
                    </div>
                    <div class="palette-section" data-section="commands">
                        <div class="palette-section-title">Commands</div>
                        <div class="palette-items"></div>
                    </div>
                    <div class="palette-section" data-section="web">
                        <div class="palette-section-title">Web Search</div>
                        <div class="palette-items"></div>
                    </div>
                    <div class="palette-section" data-section="calculator">
                        <div class="palette-section-title">Calculator</div>
                        <div class="palette-items"></div>
                    </div>
                </div>
                <div class="palette-footer">
                    <span>↵ Select</span>
                    <span>↑↓ Navigate</span>
                    <span>Esc Close</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(palette);
        this.element = palette;
        this.input = palette.querySelector('.palette-input');
    }

    bindEvents() {
        // Open palette
        window.addEventListener('openCommandPalette', () => this.open());
        
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
                e.preventDefault();
                this.isOpen ? this.close() : this.open();
            }
        });

        // Close on backdrop click
        this.element.querySelector('.palette-backdrop').addEventListener('click', () => this.close());
        
        // Input handling
        this.input.addEventListener('input', (e) => this.handleInput(e.target.value));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Focus trap
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.close();
        });
    }

    loadApps() {
        // Load installed apps
        this.apps = [
            { id: 'browser', name: 'Luo Browser', icon: '🌐', category: 'apps' },
            { id: 'files', name: 'Files', icon: '📁', category: 'apps' },
            { id: 'terminal', name: 'Terminal', icon: '⌨️', category: 'apps' },
            { id: 'homey', name: 'Homey Hub', icon: '🏠', category: 'apps' },
            { id: 'settings', name: 'Settings', icon: '⚙️', category: 'apps' },
            { id: 'trading', name: 'Trading', icon: '📈', category: 'apps' },
            { id: 'agent', name: 'AI Agent', icon: '🤖', category: 'apps' },
            { id: 'notepad', name: 'Notepad', icon: '📝', category: 'apps' },
            { id: 'calculator', name: 'Calculator', icon: '🧮', category: 'apps' },
            { id: 'calendar', name: 'Calendar', icon: '📅', category: 'apps' },
            { id: 'music', name: 'Music', icon: '🎵', category: 'apps' },
            { id: 'video', name: 'Video', icon: '🎬', category: 'apps' },
            { id: 'camera', name: 'Camera', icon: '📷', category: 'apps' },
            { id: 'notes', name: 'Notes', icon: '📒', category: 'apps' },
        ];
    }

    open() {
        this.isOpen = true;
        this.element.classList.add('open');
        this.input.value = '';
        this.input.focus();
        this.query = '';
        this.selectedIndex = 0;
        this.renderResults();
    }

    close() {
        this.isOpen = false;
        this.element.classList.remove('open');
    }

    handleInput(query) {
        this.query = query;
        this.selectedIndex = 0;
        this.search(query);
    }

    handleKeydown(e) {
        const allItems = this.getAllResultItems();
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, allItems.length - 1);
                this.updateSelection(allItems);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection(allItems);
                break;
                
            case 'Enter':
                e.preventDefault();
                const selected = allItems[this.selectedIndex];
                if (selected) this.executeItem(selected);
                break;
                
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
                
            case 'Tab':
                e.preventDefault();
                // Cycle through sections
                this.cycleSection();
                break;
        }
    }

    search(query) {
        if (!query) {
            // Show recent/favorites when empty
            this.results = this.getDefaultResults();
            this.renderResults();
            return;
        }

        const q = query.toLowerCase();
        
        // Local results
        this.categories = {
            apps: this.fuzzySearch(this.apps, q),
            files: [], // Would integrate with file system
            commands: this.fuzzySearch(this.commands, q),
            web: [], // Will be populated by real search
            calculator: this.calculate(q)
        };

        // Fetch real web results
        this.fetchRealSearchResults(query);

        this.renderResults();
    }

    async fetchRealSearchResults(query) {
        // Use Wikipedia and other open APIs for search results
        try {
            // Get Wikipedia results
            const wikiResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&limit=5`);
            const wikiData = await wikiResponse.json();
            
            const webResults = [];
            
            // Wikipedia results
            if (wikiData && wikiData.query && wikiData.query.search) {
                wikiData.query.search.forEach((item, i) => {
                    webResults.push({
                        id: `wiki-${i}`,
                        name: item.title,
                        icon: '📚',
                        category: 'web',
                        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                        description: item.snippet.replace(/<[^>]*>/g, '').substring(0, 100)
                    });
                });
            }
            
            // If no results, add a web search link
            if (webResults.length === 0) {
                webResults.push({
                    id: 'web-search',
                    name: `Search "${query}" on Google`,
                    icon: '🔍',
                    category: 'web',
                    url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
                });
            }
            
            this.categories.web = webResults;
            this.renderResults();
            
        } catch (e) {
            // Fallback to Bing
            this.categories.web = [{ 
                id: 'web-search', 
                name: `Search "${query}" on Bing`, 
                icon: '🔍', 
                category: 'web', 
                url: `https://www.bing.com/search?q=${encodeURIComponent(query)}` 
            }];
            this.renderResults();
        }
    }

    fuzzySearch(items, query) {
        return items.filter(item => {
            const name = item.name.toLowerCase();
            return name.includes(query) || this.fuzzyMatch(name, query);
        }).slice(0, 5);
    }

    fuzzyMatch(str, pattern) {
        // Simple fuzzy matching
        let patternIdx = 0;
        for (let i = 0; i < str.length && patternIdx < pattern.length; i++) {
            if (str[i] === pattern[patternIdx]) patternIdx++;
        }
        return patternIdx === pattern.length;
    }

    calculate(query) {
        // Basic calculator
        const operators = ['+', '-', '*', '/', '%', '^'];
        const hasOperator = operators.some(op => query.includes(op));
        
        if (!hasOperator) return null;
        
        try {
            // Safe evaluation
            const sanitized = query.replace(/[^0-9+\-*/().^%]/g, '');
            if (!sanitized) return null;
            
            // Handle ^ as power
            const evalStr = sanitized.replace(/(\d+)\^(\d+)/g, 'Math.pow($1,$2)');
            const result = Function('"use strict";return(' + evalStr + ')')();
            
            if (typeof result === 'number' && !isNaN(result)) {
                return {
                    id: 'calc-result',
                    name: `${query} = ${Number(result.toFixed(8))}`,
                    icon: '🧮',
                    category: 'calculator',
                    action: () => this.copyToClipboard(result)
                };
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    getDefaultResults() {
        return [
            ...this.apps.slice(0, 6).map(a => ({ ...a, category: 'apps' })),
            ...this.commands.slice(0, 4).map(c => ({ ...c, category: 'commands' }))
        ];
    }

    getAllResultItems() {
        return Array.from(this.element.querySelectorAll('.palette-item'));
    }

    updateSelection(items) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === this.selectedIndex);
        });
        
        // Scroll into view
        const selected = items[this.selectedIndex];
        if (selected) {
            selected.scrollIntoView({ block: 'nearest' });
        }
    }

    renderResults() {
        // Clear all sections
        Object.keys(this.categories).forEach(cat => {
            const section = this.element.querySelector(`[data-section="${cat}"]`);
            const itemsContainer = section.querySelector('.palette-items');
            
            let items = this.categories[cat];
            if (cat === 'calculator' && items) items = [items];
            
            if (items && items.length > 0) {
                section.style.display = 'block';
                
                if (cat === 'web') {
                    // Special rendering for web results with thumbnails
                    itemsContainer.innerHTML = items.map((item, i) => `
                        <div class="palette-item web-result ${this.getGlobalIndex(cat, i) === this.selectedIndex ? 'selected' : ''}" 
                             data-category="${cat}" 
                             data-index="${i}">
                            ${item.thumbnail ? `<img class="item-thumb" src="${item.thumbnail}" onerror="this.style.display='none'">` : `<span class="item-icon">${item.icon}</span>`}
                            <div class="item-content">
                                <span class="item-name">${item.name}</span>
                                ${item.url ? `<span class="item-url">${new URL(item.url).hostname}</span>` : ''}
                            </div>
                            <span class="item-category">${this.getCategoryLabel(item.category)}</span>
                        </div>
                    `).join('');
                } else {
                    itemsContainer.innerHTML = items.map((item, i) => `
                        <div class="palette-item ${this.getGlobalIndex(cat, i) === this.selectedIndex ? 'selected' : ''}" 
                             data-category="${cat}" 
                             data-index="${i}">
                            <span class="item-icon">${item.icon}</span>
                            <span class="item-name">${item.name}</span>
                            <span class="item-category">${this.getCategoryLabel(item.category)}</span>
                        </div>
                    `).join('');
                }
                
                // Bind click events
                itemsContainer.querySelectorAll('.palette-item').forEach(el => {
                    el.addEventListener('click', () => {
                        const cat = el.dataset.category;
                        const idx = parseInt(el.dataset.index);
                        this.executeItem(this.categories[cat][idx]);
                    });
                });
            } else {
                section.style.display = 'none';
            }
        });
    }

    getGlobalIndex(category, index) {
        let globalIndex = 0;
        const order = ['apps', 'files', 'commands', 'web', 'calculator'];
        
        for (const cat of order) {
            if (cat === category) return globalIndex + index;
            const items = this.categories[cat];
            if (items && items.length > 0) {
                if (cat === 'calculator' && items[0]) globalIndex++;
                else globalIndex += items.length;
            }
        }
        return globalIndex;
    }

    getCategoryLabel(category) {
        const labels = {
            apps: 'App',
            files: 'File',
            commands: 'Command',
            web: 'Web',
            calculator: 'Utility'
        };
        return labels[category] || category;
    }

    executeItem(item) {
        if (!item) return;
        
        this.close();
        
        if (item.action) {
            item.action();
            return;
        }
        
        if (item.url) {
            window.open(item.url, '_blank');
            return;
        }
        
        // Open app
        if (item.category === 'apps' || this.apps.find(a => a.id === item.id)) {
            if (window.luoDesktop) {
                window.luoDesktop.openApp(item.id);
            }
            return;
        }
        
        // Execute command
        this.executeCommand(item.id);
    }

    executeCommand(commandId) {
        switch (commandId) {
            case 'settings':
                if (window.luoDesktop) window.luoDesktop.openApp('settings');
                break;
            case 'lock':
                window.dispatchEvent(new CustomEvent('lockScreen'));
                break;
            case 'restart':
            case 'shutdown':
            case 'sleep':
                // Would trigger system action
                console.log('System command:', commandId);
                break;
            default:
                console.log('Execute command:', commandId);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text.toString()).then(() => {
            // Show toast
            if (window.luoDesktop && window.luoDesktop.showNotification) {
                window.luoDesktop.showNotification('Copied to clipboard!', '📋');
            }
        });
    }

    cycleSection() {
        // Cycle through visible sections
        const visibleSections = Array.from(this.element.querySelectorAll('.palette-section'))
            .filter(s => s.style.display !== 'none');
        
        if (visibleSections.length === 0) return;
        
        const currentSection = visibleSections.find(s => 
            s.contains(this.getAllResultItems()[this.selectedIndex])
        );
        
        let currentIdx = visibleSections.indexOf(currentSection);
        let nextIdx = (currentIdx + 1) % visibleSections.length;
        
        // Jump to first item of next section
        let globalIdx = 0;
        const order = ['apps', 'files', 'commands', 'web', 'calculator'];
        
        for (let i = 0; i < nextIdx; i++) {
            const cat = order[i];
            const items = this.categories[cat];
            if (items && items.length > 0) {
                if (cat === 'calculator' && items[0]) globalIdx++;
                else globalIdx += items.length;
            }
        }
        
        this.selectedIndex = globalIdx;
        this.updateSelection(this.getAllResultItems());
    }
}

// Initialize
window.CommandPalette = new CommandPalette();
