import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  Divider,
  Grid,
  Avatar,
  IconButton,
  Chip,
  Badge,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';

function ChatPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  // Function to generate an ID based on user's email
  const getUserId = (email) => {
    if (!email) return "U";
    // Get first letter of each part of the email before the @ symbol
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.map(part => part[0].toUpperCase()).join('');
  };

  // Mock data for active users
  const activeUsers = [
    { id: 1, email: "neil.tyson@example.com", active: true },
    { id: 2, email: "carl.sagan@example.com", active: true },
    { id: 3, email: "bill.nye@example.com", active: false },
  ];

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      // Send a message to notify others this user joined
      const joinMessage = {
        type: 'join',
        userId: getUserId(user.email),
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    setSocket(ws);

    // Mock some initial messages
    setMessages([
      {
        text: "Welcome to the chat room!",
        userId: "System",
        timestamp: new Date().toISOString(),
        system: true
      },
      {
        text: "How can I help with your studies today?",
        userId: "JD",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        text: "I'm looking for help with calculus",
        userId: getUserId(user.email),
        timestamp: new Date(Date.now() - 3500000).toISOString(),
      }
    ]);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user.email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      userId: getUserId(user.email),
      timestamp: new Date().toISOString(),
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(messageData));
      setNewMessage('');
    } else {
      // For demo purposes, add message directly if socket isn't connected
      setMessages([...messages, messageData]);
      setNewMessage('');
    }
  };

  // Get avatar color based on user ID (consistent color for same user)
  const getAvatarColor = (userId) => {
    if (userId === "System") return theme.palette.grey[500];
    
    // Generate a color based on string hash
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      "#009688", // teal
      "#ff9800", // orange
      "#9c27b0", // purple
      "#2196f3", // blue
      "#f44336", // red
      "#4caf50", // green
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 140px)' }}>
        {/*Current Active Users Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Active Users</Typography>
            </Box>
            <List sx={{ overflow: 'auto', flexGrow: 1 }}>
              {activeUsers.map((activeUser) => (
                <ListItem 
                  key={activeUser.id}
                  secondaryAction={
                    <IconButton edge="end">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={activeUser.active ? "success" : "error"}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: getAvatarColor(getUserId(activeUser.email)),
                        mr: 2
                      }}
                    >
                      {getUserId(activeUser.email)}
                    </Avatar>
                  </Badge>
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body1">{getUserId(activeUser.email)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activeUser.active ? 'Online' : 'Offline'}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Chat Area */}
        <Grid item xs={12} md={9}>
          <Paper 
            elevation={3}
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Chat Header */}
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h6">Chat Room</Typography>
              <Tooltip title="Chat Info">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Messages Component */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                px: 2,
                py: 1,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <List>
                {messages.map((message, index) => (
                  <React.Fragment key={index}>
                    {/* System messages are centered */}
                    {message.system ? (
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Chip 
                          label={message.text}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      </Box>
                    ) : (
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          justifyContent: message.userId === getUserId(user.email) ? 'flex-end' : 'flex-start',
                          mb: 1,
                        }}
                      >
                        {message.userId !== getUserId(user.email) && (
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(message.userId),
                              mr: 1,
                            }}
                          >
                            {message.userId}
                          </Avatar>
                        )}
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            maxWidth: '70%',
                            backgroundColor: message.userId === getUserId(user.email) 
                              ? theme.palette.primary.main 
                              : theme.palette.background.paper,
                            color: message.userId === getUserId(user.email)
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
                            boxShadow: 1,
                          }}
                        >
                          <Typography variant="body1">
                            {message.text}
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ 
                              mt: 1,
                              opacity: 0.7,
                              textAlign: 'right'
                            }}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                        {message.userId === getUserId(user.email) && (
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(message.userId),
                              ml: 1,
                            }}
                          >
                            {message.userId}
                          </Avatar>
                        )}
                      </ListItem>
                    )}
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
              </List>
            </Box>
            
            {/* Message Input form box */}
            <Box
              component="form"
              onSubmit={handleSendMessage}
              sx={{
                p: 2,
                backgroundColor: theme.palette.background.paper,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <IconButton color="primary" aria-label="upload picture" component="span">
                    <ImageIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton color="primary" aria-label="add emoji">
                    <EmojiIcon />
                  </IconButton>
                </Grid>
                <Grid item xs>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    variant="outlined"
                    size="small"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ChatPage;