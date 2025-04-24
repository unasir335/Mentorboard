const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');

// Create an Express app
const app = express();
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// Function to generate a user ID from email
const getUserId = (email) => {
  if (!email) return "U";
  // Get first letter of each part of the email before the @ symbol
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.map(part => part[0].toUpperCase()).join('');
};

// Function to broadcast to all clients
const broadcast = (data) => {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
};

// Function to send message to a specific user
const sendTo = (recipientEmail, data) => {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  
  clients.forEach((client) => {
    if (client.email === recipientEmail && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
};

// Get all active users
const getActiveUsers = () => {
  const users = [];
  clients.forEach((client) => {
    if (client.userId && client.email) {
      users.push({
        userId: client.userId,
        email: client.email
      });
    }
  });
  return users;
};

// Send updated user list to all clients
const broadcastUserList = () => {
  const userList = {
    type: 'userList',
    users: getActiveUsers(),
    timestamp: new Date().toISOString()
  };
  broadcast(userList);
};

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  console.log('Client connected');
  
  // Create a unique client ID for this connection
  const clientId = Date.now().toString();
  clients.set(clientId, { 
    ws, 
    userId: null, 
    email: null 
  });
  
  // Handle messages from client
  ws.on('message', (messageBuffer) => {
    try {
      const messageStr = messageBuffer.toString();
      const message = JSON.parse(messageStr);
      console.log('Received:', message);
      
      // Add server timestamp if not provided
      if (!message.timestamp) {
        message.timestamp = new Date().toISOString();
      }
      
      // Handle different message types
      switch (message.type) {
        case 'join':
          // User joined the chat
          if (message.userId && message.email) {
            clients.set(clientId, { 
              ws, 
              userId: message.userId,
              email: message.email
            });
            
            // Add user list to the join message
            message.users = getActiveUsers();
            
            // Broadcast join message to everyone
            broadcast(message);
            
            // Send welcome message to the user who joined
            const welcomeMessage = {
              type: 'system',
              text: `Welcome, ${message.userId}! You are now connected to the chat.`,
              userId: 'System',
              timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(welcomeMessage));
          }
          break;
          
        case 'leave':
          // User explicitly left the chat (page closed, etc.)
          if (clients.has(clientId)) {
            clients.delete(clientId);
          }
          
          // Add user list to the leave message
          message.users = getActiveUsers();
          
          // Broadcast leave message
          broadcast(message);
          break;
          
        case 'chat':
          // Regular chat message
          if (message.recipient && message.recipientEmail) {
            // Direct message to specific user
            sendTo(message.recipientEmail, message);
            
            // Also send to the sender (so they see their own message)
            if (message.email && message.email !== message.recipientEmail) {
              sendTo(message.email, message);
            }
          } else {
            // Broadcast to everyone
            broadcast(message);
          }
          break;
          
        default:
          // Fallback for other message types
          broadcast(message);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    
    // Get user info before removing
    const client = clients.get(clientId);
    const userId = client?.userId;
    const email = client?.email;
    
    // Remove client from our map
    if (clients.has(clientId)) {
      clients.delete(clientId);
    }
    
    // Send leave message if we had user info
    if (userId && email) {
      const leaveMessage = {
        type: 'leave',
        userId,
        email,
        users: getActiveUsers(),
        timestamp: new Date().toISOString()
      };
      broadcast(leaveMessage);
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    
    // Remove client on error
    if (clients.has(clientId)) {
      clients.delete(clientId);
    }
    
    // Update user list for others
    broadcastUserList();
  });
  
  // Send the current user list to the new client
  setTimeout(() => {
    const userList = {
      type: 'userList',
      users: getActiveUsers(),
      timestamp: new Date().toISOString()
    };
    ws.send(JSON.stringify(userList));
  }, 1000);
});

// Simple API endpoint to check if server is running
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    connections: clients.size,
    timestamp: new Date().toISOString()
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});