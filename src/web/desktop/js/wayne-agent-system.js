/**
 * Wayne AI Agent System - Multi-Agent Orchestration
 * Wayne can spawn specialized sub-agents for different tasks
 */

class WayneAgentSystem {
    constructor() {
        this.mainAgent = null;
        this.subAgents = new Map();
        this.activeTasks = [];
        
        // Define agent types
        this.agentTypes = {
            coder: {
                name: 'Coder',
                icon: '👨‍💻',
                description: 'Writes code, fixes bugs, builds apps',
                capabilities: ['coding', 'debugging', 'file-operations', 'terminal']
            },
            researcher: {
                name: 'Researcher',
                icon: '🔍',
                description: 'Searches, gathers info, analyzes data',
                capabilities: ['search', 'web-fetch', 'reading', 'analysis']
            },
            automation: {
                name: 'Automator',
                icon: '⚙️',
                description: 'Handles workflows, scheduling, integrations',
                capabilities: ['cron', 'webhooks', 'api-calls', 'notifications']
            },
            analyst: {
                name: 'Analyst',
                icon: '📊',
                description: 'Analyzes data, creates reports, insights',
                capabilities: ['data-analysis', 'reporting', 'visualization']
            }
        };
        
        this.init();
    }

    init() {
        console.log('🤖 Wayne Agent System initialized');
    }

    // Spawn a specialized sub-agent
    async spawnAgent(type, task) {
        const agentConfig = this.agentTypes[type];
        if (!agentConfig) {
            throw new Error(`Unknown agent type: ${type}`);
        }

        const agentId = `agent-${type}-${Date.now()}`;
        
        const agent = {
            id: agentId,
            type: type,
            name: agentConfig.name,
            icon: agentConfig.icon,
            capabilities: agentConfig.capabilities,
            status: 'starting',
            task: task,
            createdAt: Date.now(),
            messages: []
        };

        this.subAgents.set(agentId, agent);
        
        // Simulate agent startup
        await this.startAgent(agent);
        
        return agent;
    }

    async startAgent(agent) {
        agent.status = 'ready';
        console.log(`✅ Agent ${agent.name} is ready!`);
        
        // Add welcome message
        this.addMessage(agent.id, {
            type: 'system',
            text: `${agent.icon} ${agent.name} agent ready! Task: ${agent.task}`
        });
    }

    // Send task to specific agent
    async sendToAgent(agentId, message) {
        const agent = this.subAgents.get(agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }

        // Add user message
        this.addMessage(agentId, {
            type: 'user',
            text: message
        });

        // Generate agent response based on type
        const response = await this.generateAgentResponse(agent, message);
        
        // Add agent response
        this.addMessage(agentId, {
            type: 'assistant',
            text: response
        });

        return response;
    }

    async generateAgentResponse(agent, message) {
        const msg = message.toLowerCase();

        switch (agent.type) {
            case 'coder':
                return this.handleCoderResponse(agent, msg, message);
            case 'researcher':
                return this.handleResearcherResponse(agent, msg, message);
            case 'automation':
                return this.handleAutomatorResponse(agent, msg, message);
            case 'analyst':
                return this.handleAnalystResponse(agent, msg, message);
            default:
                return "I'm not sure how to handle that request.";
        }
    }

    handleCoderResponse(agent, msg, original) {
        if (msg.includes('create') || msg.includes('build') || msg.includes('make')) {
            return "👨‍💻 I'll help you build that! Let me:\n\n1. Create the project structure\n2. Write the code\n3. Set up the environment\n\nWhat language/framework should I use?";
        }
        if (msg.includes('fix') || msg.includes('bug') || msg.includes('error')) {
            return "🐛 Let's fix that bug! Can you share:\n- The error message?\n- The relevant code?\n- What you were trying to do?";
        }
        if (msg.includes('review')) {
            return "👀 I can review your code! Share the file or paste the code and I'll analyze it for issues, improvements, and best practices.";
        }
        return "👨‍💻 I'm ready to code! Tell me what you want to build or fix.";
    }

    handleResearcherResponse(agent, msg, original) {
        if (msg.includes('find') || msg.includes('search') || msg.includes('look up')) {
            return "🔍 I'll research that for you! Let me search and gather information from multiple sources.";
        }
        if (msg.includes('compare')) {
            return "📊 I'll compare the options and give you a detailed analysis with pros and cons.";
        }
        if (msg.includes('summarize')) {
            return "📝 I'll summarize the key points from the content you provide.";
        }
        return "🔍 What would you like me to research? Share a topic or paste content to analyze.";
    }

    handleAutomatorResponse(agent, msg, original) {
        if (msg.includes('schedule') || msg.includes('remind')) {
            return "⏰ I can set up reminders and scheduled tasks! Tell me:\n- What to remind you about\n- When (time/date)\n- How to notify you";
        }
        if (msg.includes('connect') || msg.includes('integrate') || msg.includes('api')) {
            return "🔗 I'll set up the integration! What apps or services do you want to connect?";
        }
        if (msg.includes('workflow') || msg.includes('automate')) {
            return "⚙️ Let's automate that workflow! Describe the steps you want to happen automatically.";
        }
        return "⚙️ I'm here for automation! What would you like to automate?";
    }

    handleAnalystResponse(agent, msg, original) {
        if (msg.includes('analyze') || msg.includes('data')) {
            return "📊 I'll analyze your data! Share the data or file and I'll provide insights.";
        }
        if (msg.includes('report') || msg.includes('summary')) {
            return "📈 I can create a report! What data should I include and what's the format?";
        }
        if (msg.includes('trend') || msg.includes('insight')) {
            return "📉 I'll look for trends and insights in your data. Share what you want analyzed.";
        }
        return "📊 Ready to analyze! What data do you want insights on?";
    }

    addMessage(agentId, message) {
        const agent = this.subAgents.get(agentId);
        if (agent) {
            agent.messages.push({
                ...message,
                timestamp: Date.now()
            });
        }
    }

    // Get all agents
    getAgents() {
        return Array.from(this.subAgents.values());
    }

    // Get specific agent
    getAgent(agentId) {
        return this.subAgents.get(agentId);
    }

    // Get agent messages
    getAgentMessages(agentId) {
        const agent = this.subAgents.get(agentId);
        return agent ? agent.messages : [];
    }

    // Kill an agent
    killAgent(agentId) {
        const agent = this.subAgents.get(agentId);
        if (agent) {
            this.subAgents.delete(agentId);
            return `Agent ${agent.name} terminated.`;
        }
        return 'Agent not found.';
    }

    // Wayne delegates to the right agent
    async delegate(message) {
        const msg = message.toLowerCase();
        
        // Auto-detect which agent is needed
        if (this.needsCoder(msg)) {
            return await this.spawnAgent('coder', message);
        }
        if (this.needsResearcher(msg)) {
            return await this.spawnAgent('researcher', message);
        }
        if (this.needsAutomator(msg)) {
            return await this.spawnAgent('automation', message);
        }
        if (this.needsAnalyst(msg)) {
            return await this.spawnAgent('analyst', message);
        }
        
        // Default: Wayne handles it
        return null;
    }

    needsCoder(msg) {
        const keywords = ['code', 'build', 'create', 'fix', 'debug', 'program', 'function', 'app', 'website', 'script', 'developer'];
        return keywords.some(k => msg.includes(k));
    }

    needsResearcher(msg) {
        const keywords = ['search', 'find', 'research', 'look up', 'compare', 'what is', 'who is', 'explain', 'information'];
        return keywords.some(k => msg.includes(k));
    }

    needsAutomator(msg) {
        const keywords = ['schedule', 'remind', 'automate', 'workflow', 'connect', 'integrate', 'api', 'webhook', 'repeat'];
        return keywords.some(k => msg.includes(k));
    }

    needsAnalyst(msg) {
        const keywords = ['analyze', 'data', 'report', 'summary', 'insight', 'trend', 'chart', 'graph', 'statistics'];
        return keywords.some(k => msg.includes(k));
    }
}

// Export
window.WayneAgentSystem = WayneAgentSystem;
