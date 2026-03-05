// Wayne Portal - AI in Luo Desktop
// Supports OpenClaw Gateway for real AI or local demo mode

class WaynePortal {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.connected = false;
        this.openclawClient = null;
        this.mode = 'demo'; // 'openclaw' or 'demo'
        
        this.init();
    }

    init() {
        // Try to connect to OpenClaw
        this.tryOpenClawConnection();
        this.render();
        this.setupEventListeners();
    }

    async tryOpenClawConnection() {
        try {
            // Check if OpenClaw Gateway is available
            const ws = new WebSocket('ws://127.0.0.1:18789');
            
            ws.onopen = () => {
                console.log('✅ Connected to OpenClaw Gateway!');
                this.openclawClient = new OpenClawClient();
                this.openclawClient.ws = ws;
                this.openclawClient.connected = true;
                this.mode = 'openclaw';
                this.updateStatus('Connected to OpenClaw');
                ws.close();
            };
            
            ws.onerror = () => {
                console.log('OpenClaw not available, using demo mode');
                this.updateStatus('Demo Mode');
            };
            
            ws.onclose = () => {
                if (this.mode !== 'openclaw') {
                    this.updateStatus('Demo Mode');
                }
            };
            
            // Timeout for connection attempt
            setTimeout(() => {
                if (this.mode !== 'openclaw') {
                    this.updateStatus('Demo Mode');
                }
            }, 3000);
            
        } catch (error) {
            console.log('OpenClaw not available, using demo mode');
            this.updateStatus('Demo Mode');
        }
    }

    updateStatus(status) {
        const statusEl = document.querySelector('.portal-status');
        const dot = document.querySelector('.status-dot');
        if (statusEl) {
            statusEl.textContent = status;
        }
        if (dot && status === 'Connected to OpenClaw') {
            dot.classList.add('online');
        }
    }

    render() {
        const container = document.getElementById('wayne-portal-container');
        if (container) {
            container.innerHTML = `
                <div class="wayne-portal" id="wayne-portal">
                    <div class="portal-header">
                        <div class="portal-avatar">
                            <span class="avatar-icon">👊</span>
                            <span class="status-dot"></span>
                        </div>
                        <div class="portal-info">
                            <span class="portal-name">Wayne</span>
                            <span class="portal-status">Connecting...</span>
                        </div>
                        <button class="portal-toggle" id="portal-toggle">−</button>
                    </div>
                    
                    <div class="portal-messages" id="portal-messages">
                        <div class="message assistant">
                            <span class="msg-icon">👊</span>
                            <span class="msg-text">Hey! I'm Wayne. I'm now inside Luo Desktop. ${this.mode === 'openclaw' ? 'Connected to real AI!' : 'Running in demo mode.'}</span>
                        </div>
                    </div>
                    
                    <div class="portal-input-area">
                        <input type="text" class="portal-input" id="portal-input" placeholder="Talk to Wayne...">
                        <button class="portal-send" id="portal-send">➤</button>
                    </div>
                    
                    <div class="portal-actions">
                        <button class="action-btn" data-action="homey">🏠 Homey</button>
                        <button class="action-btn" data-action="files">📁 Files</button>
                        <button class="action-btn" data-action="search">🔍 Search</button>
                        <button class="action-btn" data-action="openclaw">🤖 OpenClaw</button>
                    </div>
                </div>
                
                <div class="portal-mini" id="portal-mini">
                    <span class="mini-avatar">👊</span>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Toggle portal
        document.addEventListener('click', (e) => {
            if (e.target.closest('#portal-mini') || e.target.closest('#portal-toggle')) {
                this.toggle();
            }
        });
        
        // Send message
        document.addEventListener('click', (e) => {
            if (e.target.closest('#portal-send')) {
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

    async sendMessage() {
        const input = document.getElementById('portal-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        // Show typing indicator
        this.addTypingIndicator();
        
        try {
            if (this.mode === 'openclaw' && this.openclawClient?.connected) {
                await this.sendToOpenClaw(message);
            } else {
                await this.localResponse(message);
            }
        } catch (error) {
            console.error('Message error:', error);
            this.removeTypingIndicator();
            this.addMessage("Oops! Something went wrong. Try again!", 'assistant');
        }
    }

    async sendToOpenClaw(message) {
        try {
            const response = await fetch('http://127.0.0.1:18789/api/sessions.send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sessionKey: 'main', 
                    message: message 
                })
            });
            
            const data = await response.json();
            this.removeTypingIndicator();
            
            if (data.result?.text) {
                this.addMessage(data.result.text, 'assistant');
            } else {
                this.addMessage("Got a response but couldn't read it. Try again!", 'assistant');
            }
        } catch (error) {
            console.error('OpenClaw error:', error);
            this.removeTypingIndicator();
            // Fall back to local
            await this.localResponse(message);
        }
    }

    async localResponse(message) {
        // Simulate "thinking"
        await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
        
        const response = this.generateResponse(message);
        this.removeTypingIndicator();
        this.addMessage(response, 'assistant');
    }

    addTypingIndicator() {
        const container = document.getElementById('portal-messages');
        const typing = document.createElement('div');
        typing.className = 'message typing';
        typing.id = 'typing-indicator';
        typing.innerHTML = `<span class="msg-icon">👊</span><span class="msg-text"><span class="typing-dots">...</span></span>`;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }

    removeTypingIndicator() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    addMessage(text, type) {
        const container = document.getElementById('portal-messages');
        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        
        if (type === 'user') {
            msg.innerHTML = `<span class="msg-text">${this.escapeHtml(text)}</span>`;
        } else {
            msg.innerHTML = `<span class="msg-icon">👊</span><span class="msg-text">${this.escapeHtml(text)}</span>`;
        }
        
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleAction(action) {
        const actions = {
            homey: () => this.addMessage("🏠 Opening Homey...", 'assistant'),
            files: () => this.addMessage("📁 Opening Files...", 'assistant'),
            search: () => this.addMessage("🔍 Opening Search...", 'assistant'),
            openclaw: () => {
                this.addMessage("🤖 To use real OpenClaw AI:\n\n1. Install: `npm install -g openclaw`\n2. Run: `openclaw onboard --install-daemon`\n3. Configure your AI provider\n4. Restart Luo Desktop", 'assistant');
            }
        };
        
        if (actions[action]) actions[action]();
    }

    generateResponse(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('homey') || msg.includes('light') || msg.includes('smart home')) {
            return "🏠 I can see your Homey devices! You've got 1,708 devices. Want me to check specific rooms or control something?";
        }
        
        if (msg.includes('temperature') || msg.includes('thermostat')) {
            return "🌡️ Your thermostat is set to 22°C. Want me to adjust it?";
        }
        
        if (msg.includes('door') || msg.includes('lock')) {
            return "🔒 The front door is locked. Want me to unlock it?";
        }
        
        if (msg.includes('file') || msg.includes('folder') || msg.includes('browse')) {
            return "📁 I can help with files! Want me to open the Files app or search for something specific?";
        }
        
        if (msg.includes('search') || msg.includes('find') || msg.includes('look up')) {
            return "🔍 Let's search! Want me to open Luo Search or look something up on the web?";
        }
        
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            return "👊 Hey! Good to be here in Luo Desktop! What's up?";
        }
        
        if (msg.includes('how are you')) {
            return "I'm doing great! I love being inside Luo Desktop. How can I help?";
        }
        
        if (msg.includes('help') || msg.includes('what can you do')) {
            return "🤖 I'm Wayne! I can:\n\n• 🏠 Control your Homey devices\n• 🔍 Search the web\n• 📁 Manage files\n• 💬 Chat with you\n• 🔧 Help with any tasks\n\nWhat do you need?";
        }
        
        if (msg.includes('thank')) {
            return "👍 Anytime! That's what I'm here for. We're a team!";
        }
        
        if (msg.includes('build') || msg.includes('create') || msg.includes('make')) {
            return "🛠️ Let's build! Tell me what you want to create and I'll help code it!";
        }
        
        return "👊 I hear you! I'm here to help. What do you need?";
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.waynePortal = new WaynePortal();
});
