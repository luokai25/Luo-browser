// Luo Desktop - Widget System
class WidgetSystem {
    constructor() {
        this.widgets = [];
        this.isOpen = false;
        
        this.availableWidgets = [
            { id: 'clock', name: 'Clock', icon: '🕐', size: '1x1' },
            { id: 'weather', name: 'Weather', icon: '🌤️', size: '2x1' },
            { id: 'calendar', name: 'Calendar', icon: '📅', size: '2x2' },
            { id: 'notes', name: 'Sticky Notes', icon: '📝', size: '2x2' },
            { id: 'system-stats', name: 'System Stats', icon: '📊', size: '2x1' },
            { id: 'music', name: 'Music', icon: '🎵', size: '2x1' },
            { id: 'quick-links', name: 'Quick Links', icon: '🔗', size: '2x1' },
            { id: 'stocks', name: 'Stocks', icon: '📈', size: '2x1' },
        ];
        
        this.init();
    }

    init() {
        this.loadWidgets();
    }

    loadWidgets() {
        try {
            const saved = localStorage.getItem('luo-widgets');
            if (saved) {
                this.widgets = JSON.parse(saved);
            }
        } catch (e) {
            this.widgets = [];
        }
    }

    saveWidgets() {
        try {
            localStorage.setItem('luo-widgets', JSON.stringify(this.widgets));
        } catch (e) {}
    }

    addWidget(widgetId) {
        const widgetDef = this.availableWidgets.find(w => w.id === widgetId);
        if (!widgetDef) return null;
        
        const widget = {
            id: Date.now(),
            type: widgetId,
            x: 0,
            y: 0,
            width: this.getWidgetSize(widgetDef.size).w,
            height: this.getWidgetSize(widgetDef.size).h,
            config: {}
        };
        
        this.widgets.push(widget);
        this.saveWidgets();
        
        return widget;
    }

    removeWidget(id) {
        this.widgets = this.widgets.filter(w => w.id !== id);
        this.saveWidgets();
    }

    moveWidget(id, x, y) {
        const widget = this.widgets.find(w => w.id === id);
        if (widget) {
            widget.x = x;
            widget.y = y;
            this.saveWidgets();
        }
    }

    getWidgetSize(size) {
        const sizes = {
            '1x1': { w: 150, h: 150 },
            '2x1': { w: 320, h: 150 },
            '2x2': { w: 320, h: 320 },
            '1x2': { w: 150, h: 320 },
        };
        return sizes[size] || sizes['1x1'];
    }

    renderWidget(widget) {
        const content = this.getWidgetContent(widget.type);
        return `
            <div class="widget" data-id="${widget.id}" data-type="${widget.type}" 
                 style="left: ${widget.x}px; top: ${widget.y}px; width: ${widget.width}px; height: ${widget.height}px;">
                <div class="widget-header">
                    <span class="widget-title">${this.getWidgetName(widget.type)}</span>
                    <div class="widget-controls">
                        <button class="widget-btn" data-action="settings">⚙️</button>
                        <button class="widget-btn" data-action="close">✕</button>
                    </div>
                </div>
                <div class="widget-content">
                    ${content}
                </div>
            </div>
        `;
    }

    getWidgetName(type) {
        const widget = this.availableWidgets.find(w => w.id === type);
        return widget ? widget.name : type;
    }

    getWidgetContent(type) {
        switch (type) {
            case 'clock':
                return this.renderClockWidget();
            case 'weather':
                return this.renderWeatherWidget();
            case 'calendar':
                return this.renderCalendarWidget();
            case 'notes':
                return this.renderNotesWidget();
            case 'system-stats':
                return this.renderSystemStatsWidget();
            case 'music':
                return this.renderMusicWidget();
            case 'quick-links':
                return this.renderQuickLinksWidget();
            case 'stocks':
                return this.renderStocksWidget();
            default:
                return '<p>Widget content</p>';
        }
    }

    renderClockWidget() {
        return `
            <div class="widget-clock">
                <div class="clock-time">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="clock-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            </div>
        `;
    }

    renderWeatherWidget() {
        return `
            <div class="widget-weather">
                <div class="weather-icon">🌤️</div>
                <div class="weather-temp">22°C</div>
                <div class="weather-desc">Partly Cloudy</div>
                <div class="weather-location">Cairo, Egypt</div>
            </div>
        `;
    }

    renderCalendarWidget() {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
        
        let days = '';
        for (let i = 0; i < firstDay; i++) days += '<div class="cal-day empty"></div>';
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = i === today.getDate();
            days += `<div class="cal-day ${isToday ? 'today' : ''}">${i}</div>`;
        }
        
        return `
            <div class="widget-calendar">
                <div class="cal-header">${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                <div class="cal-grid">${days}</div>
            </div>
        `;
    }

    renderNotesWidget() {
        return `
            <div class="widget-notes">
                <textarea class="notes-input" placeholder="Write a note..."></textarea>
            </div>
        `;
    }

    renderSystemStatsWidget() {
        return `
            <div class="widget-stats">
                <div class="stat-item">
                    <span class="stat-label">CPU</span>
                    <div class="stat-bar"><div class="stat-fill" style="width: 45%"></div></div>
                    <span class="stat-value">45%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">RAM</span>
                    <div class="stat-bar"><div class="stat-fill" style="width: 62%"></div></div>
                    <span class="stat-value">62%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Disk</span>
                    <div class="stat-bar"><div class="stat-fill" style="width: 78%"></div></div>
                    <span class="stat-value">78%</span>
                </div>
            </div>
        `;
    }

    renderMusicWidget() {
        return `
            <div class="widget-music">
                <div class="music-track">
                    <span class="music-icon">🎵</span>
                    <div class="music-info">
                        <div class="music-title">No track playing</div>
                    </div>
                </div>
                <div class="music-controls">
                    <button>⏮️</button>
                    <button class="play">▶️</button>
                    <button>⏭️</button>
                </div>
            </div>
        `;
    }

    renderQuickLinksWidget() {
        return `
            <div class="widget-links">
                <a href="#" class="quick-link">🌐 Google</a>
                <a href="#" class="quick-link">📧 Gmail</a>
                <a href="#" class="quick-link">🐦 Twitter</a>
                <a href="#" class="quick-link">💬 Discord</a>
            </div>
        `;
    }

    renderStocksWidget() {
        return `
            <div class="widget-stocks">
                <div class="stock-item">
                    <span class="stock-symbol">BTC</span>
                    <span class="stock-price">$67,432</span>
                    <span class="stock-change positive">+2.34%</span>
                </div>
                <div class="stock-item">
                    <span class="stock-symbol">ETH</span>
                    <span class="stock-price">$3,567</span>
                    <span class="stock-change positive">+1.87%</span>
                </div>
            </div>
        `;
    }

    toggle() {
        this.isOpen = !this.isOpen;
        window.dispatchEvent(new CustomEvent('widgetsToggle', { detail: { isOpen: this.isOpen } }));
    }
}

window.widgetSystem = new WidgetSystem();
