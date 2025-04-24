import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import components
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import ProfilesPage from "./pages/ProfilesPage";
import ChatPage from "./pages/ChatPage";

// Import mock data
import { mockTutors } from "./data/mockData";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [tutors, setTutors] = useState(mockTutors);
  
  // Load user from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user");
      }
    }
    
    // Load calendar events from localStorage
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        // Convert string dates back to Date objects
        const eventsWithDates = parsedEvents.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        setCalendarEvents(eventsWithDates);
      } catch (error) {
        console.error("Failed to parse calendar events:", error);
      }
    }
  }, []);
  
  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);
  
  // Save calendar events to localStorage when they change
  useEffect(() => {
    if (calendarEvents.length > 0) {
      localStorage.setItem("calendarEvents", JSON.stringify(calendarEvents));
    }
  }, [calendarEvents]);
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Navbar user={user} setUser={setUser} />
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <LoginPage setUser={setUser} />
                )
              } 
            />
            <Route 
              path="/signup" 
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <SignupPage setUser={setUser} />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard 
                    user={user} 
                    tutors={tutors} 
                    calendarEvents={calendarEvents}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <CalendarPage 
                    calendarEvents={calendarEvents} 
                    setCalendarEvents={setCalendarEvents} 
                    tutors={tutors}
                    user={user}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profiles" 
              element={
                <ProtectedRoute>
                  <ProfilesPage tutors={tutors} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage user={user} tutors={tutors} />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;