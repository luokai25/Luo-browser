import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
