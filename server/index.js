const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('message', (messageData) => {
    // Broadcast message to all connected clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageData.toString());
      }
    });
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

console.log('WebSocket server is running on port 8080');