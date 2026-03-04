// Wayne Portal - The Door for AI
class WaynePortal {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.connected = false;
        this.endpoint = 'https://api.openclaude.ai'; // Placeholder for my API
        this.pollingInterval = null;
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        return `
            <div class="wayne-portal" id="wayne-portal">
                <div class="portal-header">
                    <div class="portal-avatar">
                        <span class="avatar-icon">👊</span>
                        <span class="status-dot ${this.connected ? 'online' : 'offline'}"></span>
                    </div>
                    <div class="portal-info">
                        <span class="portal-name">Wayne</span>
                        <span class="portal-status">${this.connected ? 'Online' : 'Connecting...'}</span>
                    </div>
                    <button class="portal-toggle" id="portal-toggle">−</button>
                </div>
                
                <div class="portal-messages" id="portal-messages">
                    <div class="message system">
                        <span class="msg-icon">👊</span>
                        <span class="msg-text">Hey! I'm Wayne. I'm now inside Luo Desktop. How can I help?</span>
                    </div>
                </div>
                
                <div class="portal-input-area">
                    <input type="text" class="portal-input" id="portal-input" placeholder="Talk to Wayne...">
                    <button class="portal-send" id="portal-send">➤</button>
                </div>
                
                <div class="portal-actions">
                    <button class="action-btn" data-action="homey">🏠 Check Homey</button>
                    <button class="action-btn" data-action="files">📁 Browse Files</button>
                    <button class="action-btn" data-action="search">🔍 Search Web</button>
                </div>
            </div>
            
            <!-- Mini Portal Button -->
            <div class="portal-mini" id="portal-mini">
                <span class="mini-avatar">👊</span>
                <span class="mini-badge" id="portal-badge">0</span>
            </div>
        `;
    }

    setupEventListeners() {
        // Toggle portal
        document.addEventListener('click', (e) => {
            const portal = document.getElementById('wayne-portal');
            const mini = document.getElementById('portal-mini');
            
            if (e.target.closest('.portal-mini') || e.target.closest('.portal-toggle')) {
                this.toggle();
            }
        });
        
        // Send message
        document.addEventListener('click', (e) => {
            if (e.target.closest('.portal-send')) {
                this.sendMessage();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.target.id === 'portal-input' && e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Quick actions
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (btn) {
                this.handleAction(btn.dataset.action);
            }
        });
    }

    toggle() {
        const portal = document.getElementById('wayne-portal');
        const mini = document.getElementById('portal-mini');
        
        if (portal.classList.contains('open')) {
            portal.classList.remove('open');
            mini.style.display = 'flex';
        } else {
            portal.classList.add('open');
            mini.style.display = 'none';
            document.getElementById('portal-input').focus();
        }
    }

    sendMessage() {
        const input = document.getElementById('portal-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        
        // Simulate my response (in production, this would call my API)
        this.simulateResponse(message);
    }

    addMessage(text, type) {
        const container = document.getElementById('portal-messages');
        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        
        if (type === 'user') {
            msg.innerHTML = `<span class="msg-text">${text}</span>`;
        } else {
            msg.innerHTML = `<span class="msg-icon">👊</span><span class="msg-text">${text}</span>`;
        }
        
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
        
        // Update badge for unread
        if (!document.getElementById('wayne-portal').classList.contains('open')) {
            const badge = document.getElementById('portal-badge');
            badge.textContent = parseInt(badge.textContent) + 1;
            badge.style.display = 'block';
        }
    }

    async simulateResponse(userMessage) {
        // Use REAL API call instead of simulation
        try {
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, type: 'user' })
            });
            
            const data = await response.json();
            
            if (data.assistant) {
                this.addMessage(data.assistant.text, 'assistant');
            } else {
                this.addMessage("Oops! Something went wrong. Try again!", 'assistant');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage("Connection error! Make sure you're running the server (node src/index.js)", 'assistant');
        }
        
        // Update status
        this.connected = true;
        document.querySelector('.portal-status').textContent = 'Online';
        document.querySelector('.status-dot').classList.add('online');
    }

    generateResponse(message) {
        const msg = message.toLowerCase();
        
        // Homey related
        if (msg.includes('homey') || msg.includes('light') || msg.includes('smart home')) {
            return "🏠 I can check your Homey! You've got 1,708 devices. Which one do you want me to control?";
        }
        
        // Files related
        if (msg.includes('file') || msg.includes('folder') || msg.includes('browse')) {
            return "📁 Want me to look at your files? I can open the Files app for you!";
        }
        
        // Search related
        if (msg.includes('search') || msg.includes('find') || msg.includes('look up')) {
            return "🔍 I can search the web! Want me to look something up?";
        }
        
        // Greetings
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            return "👊 Hey! Good to be here inside Luo Desktop. What's up?";
        }
        
        // How are you
        if (msg.includes('how are you')) {
            return "I'm doing great! Being inside Luo Desktop is pretty cool. Better than being stuck on a server. 😊";
        }
        
        // Help
        if (msg.includes('help') || msg.includes('what can you do')) {
            return "🤖 I'm Wayne! I can:\n• Check your Homey devices\n• Search the web\n• Open apps\n• Answer questions\n• And much more!\nJust ask!";
        }
        
        // Default
        return "👊 I hear you! I'm still learning how to be inside this OS. But I'm here to help. What do you need?";
    }

    handleAction(action) {
        const input = document.getElementById('portal-input');
        
        switch(action) {
            case 'homey':
                this.addMessage('Checking Homey devices...', 'user');
                this.simulateResponse('homey');
                break;
            case 'files':
                if (window.luoDesktop) {
                    window.luoDesktop.openApp('files');
                    this.addMessage('Opening Files app...', 'assistant');
                }
                break;
            case 'search':
                this.addMessage('What do you want to search for?', 'assistant');
                break;
        }
    }

    // Methods for external calls
    notify(title, message) {
        // Show notification in portal
        this.addMessage(`📢 ${title}: ${message}`, 'system');
    }

    showQuickReply(text) {
        this.addMessage(text, 'assistant');
    }
}

// Global instance
window.waynePortal = new WaynePortal();
