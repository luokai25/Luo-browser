// OpenClaw Launcher App for Luo Desktop
class OpenClawLauncher {
    constructor() {
        this.status = 'unknown';
        this.installed = false;
        this.running = false;
    }

    async checkStatus() {
        // Check if OpenClaw is installed
        try {
            const response = await fetch('http://127.0.0.1:18789/api/status', {
                method: 'GET'
            });
            if (response.ok) {
                this.running = true;
                this.installed = true;
                return 'running';
            }
        } catch (e) {
            // Not running
        }
        
        // Check if OpenClaw command exists (via local API check)
        this.running = false;
        return 'stopped';
    }

    render(container) {
        container.innerHTML = `
            <div class="openclaw-launcher">
                <div class="launcher-header">
                    <span class="launcher-icon">🦞</span>
                    <h2>OpenClaw Launcher</h2>
                </div>
                
                <div class="launcher-status" id="oc-status">
                    <div class="status-card">
                        <span class="status-label">Status</span>
                        <span class="status-value" id="status-text">Checking...</span>
                        <div class="status-indicator" id="status-indicator"></div>
                    </div>
                </div>
                
                <div class="launcher-actions">
                    <button class="launcher-btn primary" id="btn-install">
                        <span>⚡</span> Install OpenClaw
                    </button>
                    <button class="launcher-btn success" id="btn-start">
                        <span>▶️</span> Start Gateway
                    </button>
                    <button class="launcher-btn" id="btn-setup">
                        <span>⚙️</span> Setup Wizard
                    </button>
                    <button class="launcher-btn" id="btn-refresh">
                        <span>🔄</span> Refresh Status
                    </button>
                </div>
                
                <div class="launcher-info" id="launcher-info">
                    <h3>What is OpenClaw?</h3>
                    <p>OpenClaw is your personal AI assistant that runs locally. It connects to AI providers like OpenAI and Anthropic to give Wayne real intelligence!</p>
                    
                    <div class="feature-list">
                        <div class="feature">
                            <span class="feature-icon">💬</span>
                            <span>Chat with real AI</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🔗</span>
                            <span>Connect to 20+ channels</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🧠</span>
                            <span>Powerful AI agents</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🔒</span>
                            <span>Your data stays local</span>
                        </div>
                    </div>
                </div>
                
                <div class="launcher-terminal" id="terminal-output" style="display:none;">
                    <div class="terminal-header">
                        <span>Terminal</span>
                        <button class="terminal-close" id="terminal-close">✕</button>
                    </div>
                    <div class="terminal-body" id="terminal-body"></div>
                </div>
            </div>
        `;
        
        this.setupEvents();
        this.checkStatus();
    }

    setupEvents() {
        document.getElementById('btn-install')?.addEventListener('click', () => this.install());
        document.getElementById('btn-start')?.addEventListener('click', () => this.start());
        document.getElementById('btn-setup')?.addEventListener('click', () => this.setup());
        document.getElementById('btn-refresh')?.addEventListener('click', () => this.checkStatus());
        document.getElementById('terminal-close')?.addEventListener('click', () => this.hideTerminal());
    }

    async checkStatus() {
        const statusText = document.getElementById('status-text');
        const indicator = document.getElementById('status-indicator');
        
        statusText.textContent = 'Checking...';
        
        try {
            const response = await fetch('http://127.0.0.1:18789/api/status');
            if (response.ok) {
                this.running = true;
                this.installed = true;
                statusText.textContent = 'Running ✅';
                indicator.className = 'status-indicator online';
            }
        } catch (e) {
            this.running = false;
            statusText.textContent = 'Stopped';
            indicator.className = 'status-indicator offline';
        }
        
        // Update button states
        const startBtn = document.getElementById('btn-start');
        if (startBtn) {
            startBtn.disabled = !this.installed;
            startBtn.style.opacity = this.installed ? '1' : '0.5';
        }
    }

    install() {
        this.showTerminal();
        this.terminalLog('🚀 Starting OpenClaw installation...');
        this.terminalLog('');
        this.terminalLog('📋 Instructions:');
        this.terminalLog('1. Open Command Prompt as Administrator');
        this.terminalLog('2. Run: npm install -g openclaw');
        this.terminalLog('3. Run: openclaw onboard');
        this.terminalLog('');
        this.terminalLog('💡 This will install OpenClaw globally and start the setup wizard.');
        this.terminalLog('');
        this.terminalLog('After installation, click "Start Gateway" or restart Luo Desktop.');
        
        // Open command prompt for user
        setTimeout(() => {
            window.open('cmd.exe');
        }, 1000);
    }

    start() {
        this.showTerminal();
        this.terminalLog('▶️ Starting OpenClaw Gateway...');
        
        // The gateway needs to be started - this is a limitation
        // We can only provide instructions
        this.terminalLog('');
        this.terminalLog('📋 To start the gateway:');
        this.terminalLog('1. Open Command Prompt');
        this.terminalLog('2. Run: openclaw gateway');
        this.terminalLog('');
        this.terminalLog('🔄 Or to run in background:');
        this.terminalLog('   openclaw gateway --daemon');
    }

    setup() {
        this.showTerminal();
        this.terminalLog('⚙️ OpenClaw Setup Wizard');
        this.terminalLog('');
        this.terminalLog('📋 To run the setup wizard:');
        this.terminalLog('1. Open Command Prompt');
        this.terminalLog('2. Run: openclaw onboard');
        this.terminalLog('');
        this.terminalLog('This will guide you through:');
        this.terminalLog('• Selecting AI provider (OpenAI, Anthropic, etc.)');
        this.terminalLog('• Entering API keys');
        this.terminalLog('• Configuring channels');
        this.terminalLog('• Setting up skills');
    }

    showTerminal() {
        const term = document.getElementById('launcher-terminal');
        if (term) term.style.display = 'block';
    }

    hideTerminal() {
        const term = document.getElementById('launcher-terminal');
        if (term) term.style.display = 'none';
    }

    terminalLog(text) {
        const body = document.getElementById('terminal-body');
        if (body) {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.textContent = text;
            body.appendChild(line);
            body.scrollTop = body.scrollHeight;
        }
    }
}

// Export
window.OpenClawLauncher = OpenClawLauncher;
