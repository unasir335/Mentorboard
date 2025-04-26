const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');

// Create an Express app ---> initialize app variable
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
  
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.map(part => part[0].toUpperCase()).join('');
};

// ensure all clients recieve socket output except the sender
const broadcast = (data, excludeClientId = null) => {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  
  clients.forEach((client, id) => {
    if (id !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
};

// send message to a specific user
const sendTo = (recipientEmail, data) => {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  
  clients.forEach((client) => {
    if (client.email === recipientEmail && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
};

// Get all active users (deduplicated by email)
const getActiveUsers = () => {
  const usersMap = new Map(); // Use a Map to deduplicate by email
  
  clients.forEach((client) => {
    if (client.userId && client.email) {
      // Only add this user if not already in our map
      usersMap.set(client.email, {
        userId: client.userId,
        email: client.email
      });
    }
  });
  
  // Convert map values to array
  return Array.from(usersMap.values());
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
      
    
      if (!message.timestamp) {
        message.timestamp = new Date().toISOString();
      }
      
      // Handle different message types
      switch (message.type) {
        case 'join':
          // User joined the chat
          if (message.userId && message.email) {
            // First check if this user (by email) is already in any connection
            let userAlreadyExists = false;
            clients.forEach((existingClient) => {
              if (existingClient.email === message.email && existingClient.userId === message.userId) {
                userAlreadyExists = true;
              }
            });
            
            // Update client infor
            clients.set(clientId, { 
              ws, 
              userId: message.userId,
              email: message.email
            });
            
            
            if (!userAlreadyExists) {
              // Add user list to the join message
              message.users = getActiveUsers();
              
              broadcast(message);
            } else {
              
              broadcastUserList();
            }
            
            // Send welcome message to the user who joined
            const welcomeMessage = {
              type: 'system',
              text: `Welcome, ${message.userId}! You are now connected to the chat.`,
              userId: 'System',
              timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(welcomeMessage));
            
            // get current list of users from active PORTS --> used by all clients
            broadcastUserList();
          }
          break;
          
        case 'leave':
          // User left chat
          if (clients.has(clientId)) {
            clients.delete(clientId);
          }
          
          broadcastUserList();
          
          // show leave message
          broadcast(message);
          break;
          
        case 'chat':
          // Add a message ID to help clients detect duplicates
          message.messageId = `${message.userId}-${message.timestamp}-${Math.random().toString(36).substring(2, 10)}`;
          
          // Regular chat message
          if (message.recipient && message.recipientEmail) {
            // Direct message to specific user
            sendTo(message.recipientEmail, message);
            
            // show client their own messages
            if (message.email && message.email !== message.recipientEmail) {
              sendTo(message.email, message);
            }
          } else {
            
            ws.send(JSON.stringify(message));
            broadcast(message, clientId);
          }
          break;
          
        default:
          ws.send(JSON.stringify(message));
          broadcast(message, clientId);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    
    const client = clients.get(clientId);
    const userId = client?.userId;
    const email = client?.email;
    
    // Remove client based on client (PORT), userId, and email
    if (clients.has(clientId)) {
      clients.delete(clientId);
    }
    //boolean if user is still connected
    let userStillConnected = false;
    if (email) {
      clients.forEach((client) => {
        if (client.email === email) {
          userStillConnected = true;
        }
      });
    }
    
    if (!userStillConnected && userId && email) {
      const leaveMessage = {
        type: 'leave',
        userId,
        email,
        timestamp: new Date().toISOString()
      };
      broadcast(leaveMessage);
    }
    broadcastUserList();
  });
  
  //  error handling if client disconnects
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    
    if (clients.has(clientId)) {
      clients.delete(clientId);
    }

    broadcastUserList();
  });
  
  setTimeout(() => {
    const userList = {
      type: 'userList',
      users: getActiveUsers(),
      timestamp: new Date().toISOString()
    };
    ws.send(JSON.stringify(userList));
  }, 1000);
});

// check if server is running and get active users
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    connections: clients.size,
    activeUsers: getActiveUsers().length,
    timestamp: new Date().toISOString()
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});