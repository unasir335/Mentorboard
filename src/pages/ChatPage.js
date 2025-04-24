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
  Snackbar,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  VideocamOutlined as VideocamIcon,
  PhoneOutlined as PhoneIcon,
  Chat as ChatIcon,  // Add this line
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// Service URL based on the current PORT
const getWebSocketUrl = () => {
  // In development, use port 8080 for WebSocket
  const wsPort = 8080;
  const wsHost = window.location.hostname;
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // Return a WebSocket URL using the current host with the WebSocket port
  return `${wsProtocol}//${wsHost}:${wsPort}`;
};

// Generate consistent avatar color based on user ID
const getAvatarColor = (userId, theme) => {
  if (!userId) return theme.palette.grey[500];
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

// Function to generate an ID based on user's email
const getUserId = (email) => {
  if (!email) return "U";
  // Get first letter of each part of the email before the @ symbol
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.map(part => part[0].toUpperCase()).join('');
};

function ChatPage({ user, tutors }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tutorId = params.get('tutor');
    
    if (tutorId && tutors) {
      const tutor = tutors.find(t => t.id.toString() === tutorId);
      if (tutor) {
        setSelectedTutor(tutor);
      }
    }
  }, [location, tutors]);
  
  // WebSocket connection
  useEffect(() => {
    if (!user?.email) return;
    
    const initializeSocket = () => {
      setConnecting(true);
      
      try {
        // Create WebSocket connection using dynamic URL
        const webSocketUrl = getWebSocketUrl();
        console.log(`Connecting to WebSocket at ${webSocketUrl}`);
        const ws = new WebSocket(webSocketUrl);
        
        ws.onopen = () => {
          console.log('Connected to WebSocket');
          setConnected(true);
          setConnecting(false);
          setError(null);
          
          // Send a message to notify others this user joined
          const joinMessage = {
            type: 'join',
            userId: getUserId(user.email),
            email: user.email,
            timestamp: new Date().toISOString(),
          };
          ws.send(JSON.stringify(joinMessage));
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'userList':
              // Update active users list
              setActiveUsers(data.users || []);
              break;
            case 'join':
              // Someone joined, show notification and update user list
              if (data.userId !== getUserId(user.email)) {
                setSnackbar({
                  open: true,
                  message: `${data.userId} joined the chat`,
                  severity: 'info'
                });
              }
              // If userList is provided, update our list
              if (data.users) {
                setActiveUsers(data.users);
              }
              break;
            case 'leave':
              // Someone left, update user list
              if (data.users) {
                setActiveUsers(data.users);
              }
              break;
            case 'chat':
              // Regular chat message
              setMessages(prevMessages => [...prevMessages, data]);
              break;
            case 'system':
              // System message
              setMessages(prevMessages => [...prevMessages, {...data, system: true}]);
              break;
            default:
              // Fallback for other message types
              if (data.text) {
                setMessages(prevMessages => [...prevMessages, data]);
              }
          }
        };
        
        ws.onclose = (event) => {
          console.log('Disconnected from WebSocket', event.code, event.reason);
          setConnected(false);
          setConnecting(false);
          
          if (event.code !== 1000) { // 1000 is normal closure
            setError(`Connection closed unexpectedly. Try refreshing the page.`);
            
            // Attempt to reconnect after a delay
            setTimeout(() => {
              initializeSocket();
            }, 5000);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Failed to connect to chat server. Try refreshing the page.');
          setConnecting(false);
          setConnected(false);
        };
        
        setSocket(ws);
        
        return () => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            // Send leave message before closing
            const leaveMessage = {
              type: 'leave',
              userId: getUserId(user.email),
              email: user.email,
              timestamp: new Date().toISOString(),
            };
            ws.send(JSON.stringify(leaveMessage));
            ws.close(1000, "User left chat page");
          }
        };
      } catch (err) {
        console.error('Error initializing WebSocket:', err);
        setError('Failed to initialize chat connection');
        setConnecting(false);
        
        // After a delay, try to reconnect
        setTimeout(() => {
          initializeSocket();
        }, 5000);
      }
    };
    
    // Initialize on first load
    initializeSocket();
    
    // Set initial welcome message
    setMessages([
      {
        text: "Welcome to the chat room!",
        userId: "System",
        timestamp: new Date().toISOString(),
        system: true
      }
    ]);
  }, [user?.email]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Send a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const messageData = {
      type: 'chat',
      text: newMessage,
      userId: getUserId(user.email),
      email: user.email,
      timestamp: new Date().toISOString(),
    };
    
    // Add recipient if we're in a direct message
    if (selectedTutor) {
      messageData.recipient = getUserId(selectedTutor.contact);
      messageData.recipientEmail = selectedTutor.contact;
    }
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(messageData));
      setNewMessage('');
    } else {
      // Handle case when socket isn't connected
      setSnackbar({
        open: true,
        message: 'Not connected to chat server. Try refreshing the page.',
        severity: 'error'
      });
    }
  };
  
  // Handle tab change (All/Tutors)
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle tutor selection for direct message
  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
    setMobileOpen(false); // Close mobile drawer if open
  };
  
  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Filter messages for the current view (all or direct message)
  const filteredMessages = selectedTutor
  ? messages.filter(msg => 
      msg.system || 
      (msg.userId === getUserId(user.email) && msg.recipient === getUserId(selectedTutor.contact)) ||
      (msg.userId === getUserId(selectedTutor.contact) && msg.recipient === getUserId(user.email)) ||
      (msg.userId === getUserId(selectedTutor.contact) && !msg.recipient)
    )
  : messages.filter(msg => !msg.recipient);
  
  // Filter active users based on tab selection
  const filteredActiveUsers = tabValue === 0 
    ? activeUsers
    : activeUsers.filter(u => 
        tutors.some(tutor => 
          getUserId(tutor.contact) === getUserId(u.email)
        )
      );
  
  // Get user displayable name
  const getUserDisplayName = (email) => {
    if (!email) return "Unknown";
    
    // Check if it's a tutor
    const tutor = tutors.find(t => t.contact === email);
    if (tutor) return tutor.name;
    
    // Otherwise return the email or user ID
    return email.split('@')[0] || getUserId(email);
  };
  
  // Check if message is from current user
  const isCurrentUser = (msgUserId) => {
    return msgUserId === getUserId(user.email);
  };
  
  // Render active users list
  const renderActiveUsers = () => {
    if (filteredActiveUsers.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No active users
          </Typography>
        </Box>
      );
    }
    
    return (
      <List sx={{ overflow: 'auto', flexGrow: 1 }}>
        {filteredActiveUsers.map((activeUser, index) => {
          const isUserTutor = tutors.some(tutor => 
            getUserId(tutor.contact) === getUserId(activeUser.email)
          );
          
          const userTutor = tutors.find(tutor => 
            getUserId(tutor.contact) === getUserId(activeUser.email)
          );
          
          return (
            <React.Fragment key={activeUser.userId || index}>
              <ListItem
                button
                onClick={() => userTutor && handleTutorSelect(userTutor)}
                selected={selectedTutor && getUserId(selectedTutor.contact) === getUserId(activeUser.email)}
                sx={{ 
                  pl: 2, 
                  pr: 1,
                  py: isUserTutor ? 1.5 : 1
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color="success"
                >
                  <Avatar 
                    src={userTutor?.profileImage || userTutor?.fallbackImage}
                    sx={{ 
                      bgcolor: getAvatarColor(getUserId(activeUser.email), theme),
                      mr: 2
                    }}
                  >
                    {getUserId(activeUser.email)}
                  </Avatar>
                </Badge>
                <Box sx={{ ml: 1, flexGrow: 1 }}>
                  <Typography variant="body1">
                    {getUserDisplayName(activeUser.email)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isUserTutor ? 'Tutor' : 'Student'}
                  </Typography>
                  {isUserTutor && userTutor && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {userTutor.interests.join(', ')}
                    </Typography>
                  )}
                </Box>
                {isUserTutor && (
                  <IconButton edge="end" size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItem>
              {index < filteredActiveUsers.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          );
        })}
      </List>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 140px)' }}>
        {/* Mobile view - Show either user list or chat */}
        {mobileOpen ? (
          <Grid item xs={12} sx={{ display: { xs: 'block', md: 'none' }, height: '100%' }}>
            <Paper elevation={3} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="h6">Active Users</Typography>
                <IconButton onClick={() => setMobileOpen(false)}>
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Box sx={{ p: 0, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                  <Tab label="All" />
                  <Tab label="Tutors" />
                </Tabs>
              </Box>
              {renderActiveUsers()}
            </Paper>
          </Grid>
        ) : (
          <>
            {/* Current Active Users Sidebar - Desktop view */}
            <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' }, height: '100%' }}>
              <Paper elevation={3} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">Active Users</Typography>
                </Box>
                <Box sx={{ p: 0, borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                    <Tab label="All" />
                    <Tab label="Tutors" />
                  </Tabs>
                </Box>
                {renderActiveUsers()}
              </Paper>
            </Grid>
            
            {/* Chat Area */}
            <Grid item xs={12} md={9} sx={{ height: '100%' }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Mobile menu button */}
                    <IconButton 
                      sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 1 }}
                      onClick={() => setMobileOpen(true)}
                    >
                      <PersonAddIcon />
                    </IconButton>
                    
                    {selectedTutor ? (
                      <>
                        <Avatar 
                          src={selectedTutor.profileImage || selectedTutor.fallbackImage}
                          sx={{ 
                            bgcolor: getAvatarColor(getUserId(selectedTutor.contact), theme),
                            mr: 1.5
                          }}
                        >
                          {getUserId(selectedTutor.contact)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{selectedTutor.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedTutor.interests.join(', ')}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Typography variant="h6">Chat Room</Typography>
                    )}
                  </Box>
                  
                  <Box>
                    {selectedTutor && (
                      <>
                        <Tooltip title="Audio Call">
                          <IconButton>
                            <PhoneIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Video Call">
                          <IconButton>
                            <VideocamIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Chat Info">
                      <IconButton>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                {/* Connection Status */}
                {(connecting || error) && (
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                      bgcolor: error ? 'error.light' : 'info.light',
                      color: error ? 'error.contrastText' : 'info.contrastText',
                    }}
                  >
                    {connecting && <CircularProgress size={20} sx={{ mr: 2 }} />}
                    <Typography variant="body2">
                      {error || 'Connecting to chat server...'}
                    </Typography>
                  </Box>
                )}
                
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
                  {filteredMessages.length === 0 ? (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      p: 3
                    }}>
                      {selectedTutor ? (
                        <>
                          <Avatar 
                            src={selectedTutor.profileImage || selectedTutor.fallbackImage}
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              mb: 2,
                              bgcolor: getAvatarColor(getUserId(selectedTutor.contact), theme)
                            }}
                          >
                            {getUserId(selectedTutor.contact)}
                          </Avatar>
                          <Typography variant="h6" gutterBottom>
                            {selectedTutor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                            Start your conversation with {selectedTutor.name}.
                            You can discuss tutoring sessions, ask questions, or schedule appointments.
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            startIcon={<ChatIcon />}
                            onClick={() => document.getElementById('message-input').focus()}
                          >
                            Start Conversation
                          </Button>
                        </>
                      ) : (
                        <>
                          <ChatIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            Welcome to the Chat Room
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="center">
                            Connect with tutors and other students.
                            For a private conversation, select a tutor from the list.
                          </Typography>
                        </>
                      )}
                    </Box>
                  ) : (
                    <List>
                      {filteredMessages.map((message, index) => (
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
                                justifyContent: isCurrentUser(message.userId) ? 'flex-end' : 'flex-start',
                                mb: 1,
                              }}
                            >
                              {!isCurrentUser(message.userId) && (
                                <Avatar
                                  sx={{
                                    bgcolor: getAvatarColor(message.userId, theme),
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
                                  backgroundColor: isCurrentUser(message.userId) 
                                    ? theme.palette.primary.main 
                                    : theme.palette.background.paper,
                                  color: isCurrentUser(message.userId)
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
                              {isCurrentUser(message.userId) && (
                                <Avatar
                                  sx={{
                                    bgcolor: getAvatarColor(message.userId, theme),
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
                  )}
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
                      <Tooltip title="Add Image">
                        <IconButton color="primary" aria-label="upload picture" component="span">
                          <ImageIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Add Emoji">
                        <IconButton color="primary" aria-label="add emoji">
                          <EmojiIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs>
                      <TextField
                        id="message-input"
                        fullWidth
                        placeholder={selectedTutor 
                          ? `Message ${selectedTutor.name}...` 
                          : "Type your message..."
                        }
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
                        disabled={!connected}
                      />
                    </Grid>
                    <Grid item>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        endIcon={<SendIcon />}
                        disabled={!newMessage.trim() || !connected}
                      >
                        Send
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ChatPage;