const WebSocket = require('ws');

class WebSocketServer {
  constructor(port = 8080) {
    this.port = port;
    this.wss = null;
    this.clients = new Set();
    this.isRunning = false;
  }

  start() {
    try {
      this.wss = new WebSocket.Server({ port: this.port });
      this.isRunning = true;
      
      console.log(`🔌 BEAST MODE: WebSocket server started on port ${this.port}`);
      
      this.wss.on('connection', (ws) => {
        console.log('🔌 BEAST MODE: New WebSocket client connected');
        this.clients.add(ws);
        
        // Send initial status
        ws.send(JSON.stringify({
          type: 'status',
          message: 'Beast Mode WebSocket connected',
          timestamp: new Date().toISOString()
        }));
        
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            this.handleMessage(ws, data);
          } catch (error) {
            console.error('❌ BEAST MODE: WebSocket message error:', error.message);
          }
        });
        
        ws.on('close', () => {
          console.log('🔌 BEAST MODE: WebSocket client disconnected');
          this.clients.delete(ws);
        });
        
        ws.on('error', (error) => {
          console.error('❌ BEAST MODE: WebSocket error:', error.message);
          this.clients.delete(ws);
        });
      });
      
      this.wss.on('error', (error) => {
        console.error('❌ BEAST MODE: WebSocket server error:', error.message);
      });
      
      return true;
    } catch (error) {
      console.error('❌ BEAST MODE: Failed to start WebSocket server:', error.message);
      return false;
    }
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'get_status':
        ws.send(JSON.stringify({
          type: 'status_response',
          data: {
            isRunning: this.isRunning,
            clients: this.clients.size,
            timestamp: new Date().toISOString()
          }
        }));
        break;
        
      case 'beast_mode_status':
        ws.send(JSON.stringify({
          type: 'beast_mode_response',
          data: {
            apy: 280.7,
            yields: Math.floor(Math.random() * 100) + 50,
            status: 'Running',
            timestamp: new Date().toISOString()
          }
        }));
        break;
        
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type',
          timestamp: new Date().toISOString()
        }));
    }
  }

  broadcast(message) {
    if (!this.isRunning) return;
    
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
        } catch (error) {
          console.error('❌ BEAST MODE: Broadcast error:', error.message);
        }
      }
    });
  }

  stop() {
    if (this.wss) {
      this.wss.close();
      this.isRunning = false;
      console.log('🔌 BEAST MODE: WebSocket server stopped');
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      port: this.port,
      clients: this.clients.size
    };
  }
}

module.exports = WebSocketServer; 