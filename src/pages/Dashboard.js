import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper
} from "@mui/material";
import { Link } from "react-router-dom";

function Dashboard({ user }) {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.email}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              component={Link}
              to="/calendar"
              sx={{
                p: 3,
                textAlign: "center",
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                  backgroundColor: "action.hover",
                }
              }}
            >
              <Typography variant="h6">Calendar</Typography>
              <Typography>View and manage your schedule</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              component={Link}
              to="/profiles"
              sx={{
                p: 3,
                textAlign: "center",
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                  backgroundColor: "action.hover",
                }
              }}
            >
              <Typography variant="h6">Profiles</Typography>
              <Typography>Browse tutor profiles</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Dashboard;