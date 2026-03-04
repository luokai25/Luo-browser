// Luo Desktop - App-specific functionality

class AppsManager {
    static init() {
        this.setupBrowser();
        this.setupTerminal();
        this.setupAgent();
    }

    static setupBrowser() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('browser-url-bar')) return;
            
            // Handle browser navigation
            const urlBar = document.querySelector('.browser-url-bar');
            if (urlBar && e.target.classList.contains('browser-nav-btn')) {
                // Navigation logic would go here
                console.log('Browser navigation');
            }
        });

        // URL bar enter key
        document.addEventListener('keydown', (e) => {
            const urlBar = document.querySelector('.browser-url-bar');
            if (urlBar && e.key === 'Enter') {
                let url = urlBar.value.trim();
                
                // Handle luo:// protocol
                if (url.startsWith('luo://')) {
                    const site = url.replace('luo://', '').split('/')[0];
                    // Map to actual sites
                    const siteMap = {
                        'luosearch': 'https://google.com',
                        'luomail': 'https://gmail.com',
                        'luosocial': 'https://twitter.com',
                        'luoagent': 'https://openclaw.ai'
                    };
                    url = siteMap[site] || `https://${site}`;
                } else if (!url.startsWith('http')) {
                    url = 'https://' + url;
                }

                // Would update iframe - simplified for demo
                console.log('Navigate to:', url);
                urlBar.value = url;
            }
        });
    }

    static setupTerminal() {
        // Terminal input handling
        const terminalInput = document.querySelector('.terminal-input');
        if (terminalInput) {
            terminalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = terminalInput.textContent.trim();
                    this.executeCommand(cmd);
                    terminalInput.textContent = '';
                }
            });
        }
    }

    static executeCommand(cmd) {
        // Simple command execution
        const commands = {
            'help': 'Available commands: help, date, time, clear, echo',
            'date': new Date().toDateString(),
            'time': new Date().toLocaleTimeString(),
            'clear': 'clear',
            'ls': 'Documents  Downloads  Projects',
            'pwd': '/home/luo',
            'whoami': 'luo'
        };

        const output = commands[cmd.toLowerCase()] || `Command not found: ${cmd}`;
        console.log('Terminal output:', output);
    }

    static setupAgent() {
        const sendBtn = document.querySelector('.agent-send-btn');
        const input = document.querySelector('.agent-input');

        if (sendBtn && input) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    static sendMessage() {
        const input = document.querySelector('.agent-input');
        const chat = document.querySelector('.agent-chat');
        
        if (!input || !chat) return;

        const message = input.value.trim();
        if (!message) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'agent-message user';
        userMsg.textContent = message;
        chat.appendChild(userMsg);

        input.value = '';

        // Simulate AI response (in real version, would call actual AI)
        setTimeout(() => {
            const assistantMsg = document.createElement('div');
            assistantMsg.className = 'agent-message assistant';
            assistantMsg.textContent = `I received your message: "${message}". This is a demo response. In production, I would connect to the AI agent API to provide intelligent responses.`;
            chat.appendChild(assistantMsg);
            chat.scrollTop = chat.scrollHeight;
        }, 500);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    AppsManager.init();
});
