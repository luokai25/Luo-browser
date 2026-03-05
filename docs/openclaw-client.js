/**
 * OpenClaw Gateway Client for Luo Desktop
 * Connects Wayne Portal to real OpenClaw agents
 */

class OpenClawClient {
    constructor(gatewayUrl = 'ws://127.0.0.1:18789') {
        this.gatewayUrl = gatewayUrl;
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnects = 5;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.gatewayUrl);
                
                this.ws.onopen = () => {
                    console.log('✅ Connected to OpenClaw Gateway');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                };
                
                this.ws.onclose = () => {
                    console.log('❌ Disconnected from OpenClaw Gateway');
                    this.connected = false;
                    this.attemptReconnect();
                };
                
                this.ws.onerror = (error) => {
                    console.error('OpenClaw connection error:', error);
                    reject(error);
                };
                
                this.ws.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnects) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnects})`);
            setTimeout(() => this.connect(), 3000 * this.reconnectAttempts);
        }
    }

    handleMessage(data) {
        console.log('OpenClaw message:', data);
        
        if (data.method === 'session.message') {
            // New message from agent
            if (this.onMessage) {
                this.onMessage(data.params);
            }
        }
    }

    // Send a message to the agent
    async sendMessage(message) {
        if (!this.connected || !this.ws) {
            throw new Error('Not connected to OpenClaw Gateway');
        }

        const request = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'sessions.send',
            params: {
                sessionKey: 'main',
                message: message
            }
        };

        this.ws.send(JSON.stringify(request));
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, 60000);
            
            const originalOnMessage = this.onMessage;
            this.onMessage = (data) => {
                clearTimeout(timeout);
                this.onMessage = originalOnMessage;
                resolve(data);
            };
        });
    }

    // Get session list
    async getSessions() {
        return this.sendRequest('sessions.list', {});
    }

    // Get session history
    async getHistory(sessionKey = 'main', limit = 50) {
        return this.sendRequest('sessions.history', { sessionKey, limit });
    }

    // Generic request helper
    sendRequest(method, params) {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                reject(new Error('Not connected'));
                return;
            }

            const request = {
                jsonrpc: '2.0',
                id: Date.now(),
                method: method,
                params: params
            };

            const timeout = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, 30000);

            const originalHandler = this.handleMessage;
            this.handleMessage = (data) => {
                if (data.id === request.id) {
                    clearTimeout(timeout);
                    this.handleMessage = originalHandler;
                    resolve(data.result || data);
                } else {
                    originalHandler(data);
                }
            };

            this.ws.send(JSON.stringify(request));
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.connected = false;
        }
    }
}

// Export for use in Luo Desktop
window.OpenClawClient = OpenClawClient;
