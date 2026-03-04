// Luo Desktop - Notification Center & System Alerts
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.dnd = false;
        this.maxVisible = 5;
        
        this.init();
    }

    init() {
        this.createNotificationCenter();
        this.createToastContainer();
        this.bindEvents();
    }

    createNotificationCenter() {
        const panel = document.createElement('div');
        panel.id = 'notification-center';
        panel.className = 'notification-center';
        panel.innerHTML = `
            <div class="nc-header">
                <h3>Notifications</h3>
                <button class="nc-clear-all">Clear All</button>
            </div>
            <div class="nc-tabs">
                <button class="nc-tab active" data-filter="all">All</button>
                <button class="nc-tab" data-filter="apps">Apps</button>
                <button class="nc-tab" data-filter="system">System</button>
            </div>
            <div class="nc-list"></div>
            <div class="nc-dnd">
                <span>Do Not Disturb</span>
                <button class="nc-dnd-toggle ${this.dnd ? 'active' : ''}">
                    <div class="toggle-track">
                        <div class="toggle-thumb"></div>
                    </div>
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.panel = panel;
        this.list = panel.querySelector('.nc-list');
        
        // Tab filtering
        panel.querySelectorAll('.nc-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                panel.querySelectorAll('.nc-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderNotifications(tab.dataset.filter);
            });
        });
        
        // Clear all
        panel.querySelector('.nc-clear-all').addEventListener('click', () => this.clearAll());
        
        // DND toggle
        panel.querySelector('.nc-dnd-toggle').addEventListener('click', () => {
            this.dnd = !this.dnd;
            panel.querySelector('.nc-dnd-toggle').classList.toggle('active', this.dnd);
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        this.toastContainer = container;
    }

    bindEvents() {
        // System notifications
        window.addEventListener('showNotification', (e) => {
            this.add(e.detail);
        });
    }

    add(config) {
        const notification = {
            id: Date.now(),
            title: config.title || 'Notification',
            body: config.body || '',
            icon: config.icon || '🔔',
            app: config.app || 'System',
            priority: config.priority || 'normal', // critical, normal, low
            timestamp: Date.now(),
            read: false,
            actions: config.actions || [],
            toast: config.toast !== false,
            duration: config.duration || 5000
        };

        this.notifications.unshift(notification);
        
        // Keep only last 100
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }

        // Show toast
        if (notification.toast && !this.dnd && notification.priority !== 'low') {
            this.showToast(notification);
        }

        // Update center
        this.renderNotifications();
        
        // Update badge
        this.updateBadge();
        
        // Play sound for critical
        if (notification.priority === 'critical') {
            this.playNotificationSound();
        }

        return notification.id;
    }

    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${notification.priority}`;
        toast.dataset.id = notification.id;
        
        const iconHtml = notification.icon ? `<span class="toast-icon">${notification.icon}</span>` : '';
        
        toast.innerHTML = `
            ${iconHtml}
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
                <div class="toast-body">${notification.body}</div>
            </div>
            <div class="toast-actions">
                ${notification.actions.map(a => `<button class="toast-action" data-action="${a.id}">${a.label}</button>`).join('')}
            </div>
            <button class="toast-close">✕</button>
            <div class="toast-progress"></div>
        `;

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismissToast(notification.id);
        });

        // Action buttons
        toast.querySelectorAll('.toast-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = notification.actions.find(a => a.id === btn.dataset.action);
                if (action && action.onClick) action.onClick();
                this.dismissToast(notification.id);
            });
        });

        // Click to open notification center
        toast.addEventListener('click', () => {
            this.open();
            this.dismissToast(notification.id);
        });

        this.toastContainer.appendChild(toast);

        // Auto dismiss
        if (notification.duration > 0) {
            setTimeout(() => {
                this.dismissToast(notification.id);
            }, notification.duration);
        }

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Progress bar animation
        const progress = toast.querySelector('.toast-progress');
        if (progress) {
            progress.style.transition = `width ${notification.duration}ms linear`;
            requestAnimationFrame(() => {
                progress.style.width = '0%';
            });
        }
    }

    dismissToast(id) {
        const toast = this.toastContainer.querySelector(`[data-id="${id}"]`);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 200);
        }
    }

    renderNotifications(filter = 'all') {
        let filtered = this.notifications;
        
        if (filter === 'apps') {
            filtered = this.notifications.filter(n => n.app !== 'System');
        } else if (filter === 'system') {
            filtered = this.notifications.filter(n => n.app === 'System');
        }

        if (filtered.length === 0) {
            this.list.innerHTML = `
                <div class="nc-empty">
                    <span class="nc-empty-icon">🔕</span>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        this.list.innerHTML = filtered.slice(0, 50).map(n => `
            <div class="nc-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <span class="nc-item-icon">${n.icon}</span>
                <div class="nc-item-content">
                    <div class="nc-item-header">
                        <span class="nc-item-title">${n.title}</span>
                        <span class="nc-item-time">${this.formatTime(n.timestamp)}</span>
                    </div>
                    <div class="nc-item-body">${n.body}</div>
                    <div class="nc-item-app">${n.app}</div>
                </div>
                ${n.actions.length > 0 ? `
                    <div class="nc-item-actions">
                        ${n.actions.map(a => `<button class="nc-action-btn" data-action="${a.id}">${a.label}</button>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');

        // Bind click events
        this.list.querySelectorAll('.nc-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.markAsRead(id);
                
                const notif = this.notifications.find(n => n.id === id);
                if (notif && notif.onClick) notif.onClick();
            });
        });
    }

    formatTime(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Now';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    }

    markAsRead(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            this.renderNotifications();
            this.updateBadge();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.renderNotifications();
        this.updateBadge();
    }

    clearAll() {
        this.notifications = [];
        this.renderNotifications();
        this.updateBadge();
    }

    updateBadge() {
        const unread = this.notifications.filter(n => !n.read).length;
        
        // Update notification bell in taskbar if exists
        const bell = document.querySelector('.taskbar-notification-bell');
        if (bell) {
            bell.dataset.count = unread;
            bell.classList.toggle('has-notifications', unread > 0);
        }
    }

    open() {
        this.panel.classList.add('open');
    }

    close() {
        this.panel.classList.remove('open');
    }

    toggle() {
        this.panel.classList.toggle('open');
    }

    playNotificationSound() {
        // Could play a sound here
        // const audio = new Audio('/sounds/notification.mp3');
        // audio.play().catch(() => {});
    }

    // Utility methods for other parts of the system
    notify(title, body, config = {}) {
        return this.add({ title, body, ...config });
    }

    success(message) {
        return this.add({ title: 'Success', body: message, icon: '✅', priority: 'low', duration: 3000 });
    }

    error(message) {
        return this.add({ title: 'Error', body: message, icon: '❌', priority: 'critical', duration: 8000 });
    }

    warning(message) {
        return this.add({ title: 'Warning', body: message, icon: '⚠️', priority: 'normal', duration: 5000 });
    }

    info(message) {
        return this.add({ title: 'Info', body: message, icon: 'ℹ️', priority: 'low', duration: 4000 });
    }
}

// Initialize
window.notificationSystem = new NotificationSystem();

// Add to window.luoDesktop for easy access
window.luoDesktop = window.luoDesktop || {};
window.luoDesktop.showNotification = (title, body, config) => {
    return window.notificationSystem.notify(title, body, config);
};
