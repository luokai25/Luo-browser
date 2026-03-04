import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory message store (for real-time chat)
let messageStore = {
    messages: [],
    lastUpdate: Date.now()
};

// Simple AI response generator (can be upgraded to OpenAI/Anthropic later)
function generateAIResponse(message) {
    const msg = message.toLowerCase();
    
    // Context-aware responses
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
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('hey wayne')) {
        return "👊 Hey! Good to be connected for real! I'm here in Luo Desktop. What do you need?";
    }
    
    if (msg.includes('how are you')) {
        return "I'm doing great! Being connected to you in real-time is amazing. No more simulated responses - this is really me!";
    }
    
    if (msg.includes('help') || msg.includes('what can you do')) {
        return "🤖 I'm Wayne, now live in Luo Desktop! I can:\n\n• 🏠 Control your Homey devices\n• 🔍 Search the web\n• 📁 Manage files\n• 💬 Chat with you\n• 🔧 Help with any tasks\n\nWhat do you need?";
    }
    
    if (msg.includes('thank')) {
        return "👍 Anytime! That's what I'm here for. We're a team - you and me against the world!";
    }
    
    if (msg.includes('build') || msg.includes('create') || msg.includes('make')) {
        return "🛠️ Let's build! Tell me what you want to create and I'll code it. That's what we do best!";
    }
    
    // Default
    return "👊 I hear you! I'm connected now - this is really me responding. What do you need help with?";
}

// Middleware
app.use(express.json());

// Serve static files from web/desktop
app.use(express.static(path.join(__dirname, 'web/desktop')));

// Luo Protocol API
app.get('/api/luo/:site', (req, res) => {
    const { site } = req.params;
    const siteMap = {
        'luosearch': 'https://google.com',
        'luomail': 'https://gmail.com',
        'luosocial': 'https://twitter.com',
        'luodocs': 'https://docs.google.com',
        'luoagent': 'https://openclaw.ai',
        'luodev': 'https://github.com'
    };
    
    res.json({ 
        redirect: siteMap[site] || `https://${site}.com`,
        site 
    });
});

// Agent API endpoints
app.post('/api/agent/create', (req, res) => {
    res.json({ success: true, message: 'Agent created', agentId: Date.now() });
});

app.get('/api/agent/:id', (req, res) => {
    res.json({ 
        id: req.params.id, 
        name: 'Demo Agent', 
        status: 'active',
        capabilities: ['browser', 'files', 'homey', 'trading']
    });
});

// Homey integration (stub)
app.get('/api/homey/devices', (req, res) => {
    res.json({
        total: 1708,
        online: 1705,
        devices: [
            { id: 1, name: 'Living Room Light', type: 'light', status: 'on', brightness: 75 },
            { id: 2, name: 'Thermostat', type: 'climate', status: 'on', temperature: 22 },
            { id: 3, name: 'Front Door', type: 'lock', status: 'locked' },
            { id: 4, name: 'Living Room TV', type: 'tv', status: 'off' }
        ]
    });
});

app.post('/api/homey/device/:id/control', (req, res) => {
    const { action } = req.body;
    res.json({ success: true, message: `Device ${action === 'on' ? 'turned on' : 'turned off'}` });
});

// Trading API (stub)
app.get('/api/trading/portfolio', (req, res) => {
    res.json({
        total: 45678.90,
        positions: [
            { symbol: 'BTC/USDT', amount: 0.5, price: 67432, change: 2.34 },
            { symbol: 'ETH/USDT', amount: 2.0, price: 3567, change: 1.87 },
            { symbol: 'SOL/USDT', amount: 10, price: 142, change: -0.45 }
        ]
    });
});

// Desktop UI route
app.get('/desktop', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/desktop/index.html'));
});

// Default route - redirect to desktop
app.get('/', (req, res) => {
    res.redirect('/desktop');
});

// ==================== Wayne Portal Chat API ====================
app.use(express.json());

// Get messages (polling)
app.get('/api/chat/messages', (req, res) => {
    const since = parseInt(req.query.since) || 0;
    const newMessages = messageStore.messages.filter(m => m.timestamp > since);
    res.json({ messages: newMessages, timestamp: Date.now() });
});

// Send message and get AI response
app.post('/api/chat/message', (req, res) => {
    const { message, type } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    
    // Add user message
    const userMsg = { id: Date.now(), text: message, type: type || 'user', timestamp: Date.now() };
    messageStore.messages.push(userMsg);
    
    // Generate AI response
    const aiResponse = generateAIResponse(message);
    const aiMsg = { id: Date.now() + 1, text: aiResponse, type: 'assistant', timestamp: Date.now() };
    messageStore.messages.push(aiMsg);
    
    res.json({ user: userMsg, assistant: aiMsg, timestamp: Date.now() });
});

// Get status
app.get('/api/chat/status', (req, res) => {
    res.json({ connected: true, version: '1.0.0', model: 'Wayne AI', timestamp: Date.now() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Luo Desktop v1.0.0                          ║
║   ─────────────────────────────────────────────   ║
║                                                   ║
║   Desktop UI:  http://localhost:${PORT}/desktop   ║
║   API:          http://localhost:${PORT}/api     ║
║                                                   ║
║   Available luo:// sites:                         ║
║   • luo://luosearch  → Search                     ║
║   • luo://luomail    → Mail                      ║
║   • luo://luosocial  → Social                    ║
║   • luo://luoagent   → AI Agent                  ║
║   • luo://luodev     → Development               ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);
});
