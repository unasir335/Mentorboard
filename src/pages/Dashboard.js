import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Chip,
  Stack,
  useTheme
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Event as EventIcon,
  ArrowForward as ArrowForwardIcon,
  Notifications as NotificationsIcon
} from "@mui/icons-material";

// reformat today's current date
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

function Dashboard({ user, tutors, calendarEvents }) {
  const theme = useTheme();
  const today = new Date();
  const [recentTutors, setRecentTutors] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // useEffect to set recent tutors
  useEffect(() => {
    // Option 1: Just take the first 3 tutors if more than 3 are are available
    setRecentTutors(tutors.slice(0, 3));
  }, [tutors]); // Only rerun if tutors array changes
  
  // For upcoming events
  useEffect(() => {
    if (calendarEvents && calendarEvents.length > 0) {
      const upcoming = calendarEvents
        .filter(event => new Date(event.start) > today)
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 3);
      setUpcomingEvents(upcoming);
    }
  }, [calendarEvents, today]);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            mb: 4, 
            p: 3, 
            borderRadius: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 200, 
              height: 200, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)',
              zIndex: 0
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back, {user.email}
            </Typography>
            <Typography variant="subtitle1">
              Today is {formatDate(today)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Chip 
                label="Student Dashboard" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
              />
              <Chip 
                icon={<NotificationsIcon sx={{ color: 'white !important' }} />} 
                label="5 Notifications" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
              />
            </Stack>
          </Box>
        </Box>
        
        {/* Quick Access Cards */}
        <Typography variant="h5" fontWeight="medium" gutterBottom sx={{ mb: 2 }}>
          Quick Access
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {/* Calendar Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to="/calendar" 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch'
                }}
              >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    <CalendarIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Calendar</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Schedule and manage appointments
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <CardContent sx={{ 
                  bgcolor: 'rgba(0,0,0,0.02)',
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    {upcomingEvents.length > 0 
                      ? `${upcomingEvents.length} upcoming appointments` 
                      : "No upcoming appointments"}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          
          {/* Profiles Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to="/profiles" 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch'
                }}
              >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    <PeopleIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Tutor Profiles</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Find and connect with tutors
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <CardContent sx={{ 
                  bgcolor: 'rgba(0,0,0,0.02)',
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    {tutors.length} tutors available
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          
          {/* Chat Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to="/chat" 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch'
                }}
              >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      bgcolor: '#009688',
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    <ChatIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Chat Room</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tutoring Assistance 
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <CardContent sx={{ 
                  bgcolor: 'rgba(0,0,0,0.02)',
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Converse with Tutors and Students
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
        
        {/* Upcoming Sessions Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h5" fontWeight="medium" gutterBottom>
              Upcoming Sessions
            </Typography>
            <Paper 
              elevation={2}
              sx={{ 
                p: 0, 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {upcomingEvents.length > 0 ? (
                <List disablePadding>
                  {upcomingEvents.map((event, index) => (
                    <React.Fragment key={event.id || index}>
                      <ListItem
                        sx={{ 
                          pl: 2, 
                          pr: 1,
                          py: 2
                        }}
                        secondaryAction={
                          <IconButton 
                            component={Link} 
                            to={`/calendar?event=${event.id}`} 
                            edge="end" 
                            aria-label="view"
                          >
                            <ArrowForwardIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{ 
                              bgcolor: theme.palette.primary.light
                            }}
                          >
                            <EventIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {new Date(event.start).toLocaleString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </Typography>
                              {event.tutor && (
                                <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                  Tutor: {event.tutor}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < upcomingEvents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No upcoming sessions scheduled
                  </Typography>
                  <Button 
                    component={Link}
                    to="/calendar"
                    variant="contained" 
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Schedule a Session
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Featured Tutors Section */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="medium">
                Featured Tutors
              </Typography>
              <Button 
                component={Link} 
                to="/profiles" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
              >
                View All
              </Button>
            </Box>
            <Paper 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <List disablePadding>
                {recentTutors.map((tutor, index) => (
                  <React.Fragment key={tutor.id}>
                    <ListItem
                      sx={{ 
                        pl: 2, 
                        pr: 1,
                        py: 2
                      }}
                      secondaryAction={
                        <Button 
                          variant="outlined" 
                          size="small"
                          component={Link}
                          to={`/chat?tutor=${tutor.id}`}
                        >
                          Chat
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={tutor.profileImage || tutor.fallbackImage}
                          sx={{ width: 40, height: 40 }}
                        >
                          {tutor.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={tutor.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Rating: {tutor.rating}/5
                            </Typography>
                            <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                              {tutor.interests.join(", ")}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentTutors.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Dashboard;