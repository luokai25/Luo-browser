/**
 * Wayne Agent Panel UI - Manage sub-agents
 */

class WayneAgentPanel {
    constructor(agentSystem) {
        this.agentSystem = agentSystem;
        this.isOpen = false;
    }

    render() {
        return `
            <div class="agent-panel" id="agent-panel">
                <div class="agent-panel-header">
                    <span class="agent-panel-icon">🤖</span>
                    <span class="agent-panel-title">Agent Team</span>
                    <button class="agent-panel-close" id="agent-panel-close">✕</button>
                </div>
                
                <div class="agent-panel-content">
                    <div class="agent-types">
                        <h3>Spawn New Agent</h3>
                        <div class="agent-type-grid">
                            <button class="agent-type-btn" data-type="coder">
                                <span class="agent-type-icon">👨‍💻</span>
                                <span class="agent-type-name">Coder</span>
                            </button>
                            <button class="agent-type-btn" data-type="researcher">
                                <span class="agent-type-icon">🔍</span>
                                <span class="agent-type-name">Researcher</span>
                            </button>
                            <button class="agent-type-btn" data-type="automation">
                                <span class="agent-type-icon">⚙️</span>
                                <span class="agent-type-name">Automator</span>
                            </button>
                            <button class="agent-type-btn" data-type="analyst">
                                <span class="agent-type-icon">📊</span>
                                <span class="agent-type-name">Analyst</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="active-agents">
                        <h3>Active Agents</h3>
                        <div class="agents-list" id="agents-list">
                            <p class="no-agents">No active agents. Spawn one above!</p>
                        </div>
                    </div>
                    
                    <div class="agent-task-input">
                        <input type="text" id="agent-task-input" placeholder="What should the agent do?">
                        <button id="spawn-agent-btn">Spawn</button>
                    </div>
                </div>
            </div>
        `;
    }

    open() {
        const existing = document.getElementById('agent-panel');
        if (existing) {
            existing.classList.add('open');
            this.isOpen = true;
            this.refreshAgentsList();
            return;
        }

        const container = document.createElement('div');
        container.innerHTML = this.render();
        document.body.appendChild(container.firstElementChild);
        
        this.setupEvents();
        this.isOpen = true;
        this.refreshAgentsList();
    }

    close() {
        const panel = document.getElementById('agent-panel');
        if (panel) {
            panel.classList.remove('open');
        }
        this.isOpen = false;
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    setupEvents() {
        document.getElementById('agent-panel-close')?.addEventListener('click', () => this.close());
        
        // Spawn buttons
        document.querySelectorAll('.agent-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const taskInput = document.getElementById('agent-task-input');
                const task = taskInput?.value || 'General task';
                this.spawnAgent(type, task);
            });
        });

        // Spawn button
        document.getElementById('spawn-agent-btn')?.addEventListener('click', () => {
            const taskInput = document.getElementById('agent-task-input');
            const task = taskInput?.value;
            if (task) {
                // Auto-detect type
                this.autoSpawn(task);
            }
        });
    }

    async spawnAgent(type, task) {
        try {
            const agent = await this.agentSystem.spawnAgent(type, task);
            this.refreshAgentsList();
            
            // Show notification
            this.showNotification(`🤖 ${agent.name} agent spawned!`);
            
            return agent;
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async autoSpawn(task) {
        const delegate = await this.agentSystem.delegate(task);
        if (delegate) {
            this.refreshAgentsList();
            this.showNotification(`🤖 Spawned ${delegate.name} for your request!`);
        }
    }

    refreshAgentsList() {
        const list = document.getElementById('agents-list');
        if (!list) return;

        const agents = this.agentSystem.getAgents();
        
        if (agents.length === 0) {
            list.innerHTML = '<p class="no-agents">No active agents. Spawn one above!</p>';
            return;
        }

        list.innerHTML = agents.map(agent => `
            <div class="agent-item" data-id="${agent.id}">
                <div class="agent-item-header">
                    <span class="agent-item-icon">${agent.icon}</span>
                    <span class="agent-item-name">${agent.name}</span>
                    <span class="agent-item-status ${agent.status}">${agent.status}</span>
                    <button class="agent-item-kill" data-id="${agent.id}">✕</button>
                </div>
                <div class="agent-item-task">${agent.task}</div>
                <div class="agent-item-messages">${agent.messages.length} messages</div>
            </div>
        `).join('');

        // Add kill events
        list.querySelectorAll('.agent-item-kill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const agentId = btn.dataset.id;
                this.agentSystem.killAgent(agentId);
                this.refreshAgentsList();
                this.showNotification('Agent terminated.');
            });
        });
    }

    showNotification(message, type = 'success') {
        const notif = document.createElement('div');
        notif.className = `agent-notif ${type}`;
        notif.textContent = message;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.classList.add('show'), 10);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
}

// CSS styles
const agentPanelStyles = `
    .agent-panel {
        position: fixed;
        top: 60px;
        right: 20px;
        width: 380px;
        max-height: calc(100vh - 100px);
        background: rgba(20, 20, 35, 0.98);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        z-index: 1000;
        display: none;
        flex-direction: column;
        overflow: hidden;
    }
    .agent-panel.open {
        display: flex;
    }
    .agent-panel-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px;
        background: rgba(99, 102, 241, 0.2);
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .agent-panel-icon { font-size: 24px; }
    .agent-panel-title { flex: 1; font-weight: 600; font-size: 16px; }
    .agent-panel-close {
        background: none;
        border: none;
        color: rgba(255,255,255,0.6);
        cursor: pointer;
        font-size: 18px;
    }
    .agent-panel-content {
        padding: 15px;
        overflow-y: auto;
        flex: 1;
    }
    .agent-types h3, .active-agents h3 {
        font-size: 13px;
        color: rgba(255,255,255,0.6);
        margin: 0 0 10px 0;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .agent-type-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-bottom: 20px;
    }
    .agent-type-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 15px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
    }
    .agent-type-btn:hover {
        background: rgba(99, 102, 241, 0.3);
        border-color: var(--accent);
    }
    .agent-type-icon { font-size: 28px; }
    .agent-type-name { font-size: 12px; color: rgba(255,255,255,0.8); }
    .agents-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 15px;
    }
    .no-agents {
        color: rgba(255,255,255,0.4);
        font-size: 13px;
        text-align: center;
        padding: 20px;
    }
    .agent-item {
        background: rgba(255,255,255,0.05);
        border-radius: 10px;
        padding: 12px;
    }
    .agent-item-header {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .agent-item-icon { font-size: 20px; }
    .agent-item-name { flex: 1; font-weight: 500; font-size: 14px; }
    .agent-item-status {
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 10px;
        background: rgba(52, 211, 153, 0.2);
        color: #34d399;
    }
    .agent-item-status.starting {
        background: rgba(251, 191, 36, 0.2);
        color: #fbbf24;
    }
    .agent-item-kill {
        background: none;
        border: none;
        color: rgba(255,255,255,0.4);
        cursor: pointer;
        font-size: 14px;
    }
    .agent-item-kill:hover { color: #f87171; }
    .agent-item-task {
        font-size: 12px;
        color: rgba(255,255,255,0.6);
        margin-top: 8px;
    }
    .agent-item-messages {
        font-size: 11px;
        color: rgba(255,255,255,0.4);
        margin-top: 4px;
    }
    .agent-task-input {
        display: flex;
        gap: 10px;
    }
    .agent-task-input input {
        flex: 1;
        padding: 10px 14px;
        background: rgba(255,255,255,0.1);
        border: none;
        border-radius: 8px;
        color: #fff;
        font-size: 13px;
    }
    .agent-task-input button {
        padding: 10px 16px;
        background: var(--accent);
        border: none;
        border-radius: 8px;
        color: #fff;
        cursor: pointer;
        font-size: 13px;
    }
    .agent-notif {
        position: fixed;
        bottom: 80px;
        right: 20px;
        padding: 12px 20px;
        background: rgba(20, 20, 35, 0.95);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: #fff;
        font-size: 14px;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.3s;
        z-index: 2000;
    }
    .agent-notif.show {
        transform: translateY(0);
        opacity: 1;
    }
    .agent-notif.error {
        border-color: #f87171;
        color: #f87171;
    }
`;

// Add styles to page
const styleEl = document.createElement('style');
styleEl.textContent = agentPanelStyles;
document.head.appendChild(styleEl);

// Export
window.WayneAgentPanel = WayneAgentPanel;
