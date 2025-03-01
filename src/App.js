import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { mockTutors } from "./data/mockData";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import ProfilesPage from "./pages/ProfilesPage";
import ChatPage from "./pages/ChatPage.js";

//import Button from '@ui/material/Button'

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [tutors, setTutors] = useState(mockTutors);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/signup" element={<SignupPage setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard
                  user={user}
                  tutors={tutors}
                  setTutors={setTutors}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/calendar"
            element={
              user ? (
                <CalendarPage
                  calendarEvents={calendarEvents}
                  setCalendarEvents={setCalendarEvents}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/chat"
            element={
              user ? (
                <ChatPage user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profiles"
            element={
              user ? (
                <ProfilesPage tutors={tutors} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;