import React, { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Container,
  Typography,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Fab,
  Stack,
  Chip,
  Grid,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Close as CloseIcon,
  School as SchoolIcon
} from "@mui/icons-material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { useNavigate, useLocation } from "react-router-dom";

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Available event labels/categories for appointment types
const eventCategories = [
  { name: "Tutoring", color: "#2196f3" },
  { name: "Study Group", color: "#4caf50" },
  { name: "Exam Prep", color: "#ff9800" },
  { name: "Assignment Help", color: "#9c27b0" },
  { name: "General Meeting", color: "#607d8b" }
];

function CalendarPage({ calendarEvents, setCalendarEvents, tutors, user }) {
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formMode, setFormMode] = useState('create'); // create and edit appointments on calendar
  const [eventForm, setEventForm] = useState({
    title: '',
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 1)),
    notes: '',
    category: 'Tutoring',
    tutorId: '',
    createdBy: ''
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // set event on calendar form when creating new appointment - setEventForm
  const resetForm = useCallback(() => {
    setEventForm({
      title: '',
      start: new Date(),
      end: new Date(new Date().setHours(new Date().getHours() + 1)),
      notes: '',
      category: 'Tutoring',
      tutorId: '',
      createdBy: user.email
    });
  }, [user.email]);
  
  // function to set values initialized in resetForm
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setFormMode('edit');
    setEventForm({
      title: event.title || '',
      start: new Date(event.start),
      end: new Date(event.end),
      notes: event.notes || '',
      category: event.category || 'Tutoring',
      tutorId: event.tutorId || '',
      createdBy: event.createdBy || user.email
    });
    setOpenEventDialog(true);
  }, [user.email]);
  
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventId = params.get('event');
    
    if (eventId && calendarEvents) {
      const event = calendarEvents.find(e => e.id === eventId);
      if (event) {
        handleSelectEvent(event);
      }
    }
  }, [location, calendarEvents, handleSelectEvent]);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!openEventDialog) {
      setTimeout(() => {
        setSelectedEvent(null);
        resetForm();
      }, 300);
    }
  }, [openEventDialog, resetForm]);
  
  // Event handlers for form creation
  const handleSelectSlot = ({ start, end }) => {
    setFormMode('create');
    setEventForm({
      ...eventForm,
      start: start,
      end: end,
      createdBy: user.email
    });
    setOpenEventDialog(true);
  };
  //error handling for calendar events
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm({
      ...eventForm,
      [name]: value
    });
  };
  
  const handleDateChange = (name, date) => {
    setEventForm({
      ...eventForm,
      [name]: date
    });
  };
  
  const handleSaveEvent = () => {
    if (!eventForm.title) {
      setSnackbar({
        open: true,
        message: 'Please add a title for the event',
        severity: 'error'
      });
      return;
    }
    
    if (eventForm.start >= eventForm.end) {
      setSnackbar({
        open: true,
        message: 'End time must be after start time',
        severity: 'error'
      });
      return;
    }
    
    const category = eventForm.category || 'Tutoring';
    const categoryData = eventCategories.find(cat => cat.name === category) || eventCategories[0];
    
    // Add tutor name for display if tutor is selected
    let tutorName = '';
    if (eventForm.tutorId) {
      const selectedTutor = tutors.find(t => t.id.toString() === eventForm.tutorId.toString());
      if (selectedTutor) {
        tutorName = selectedTutor.name;
      }
    }
    
    if (formMode === 'create') {
      const newEvent = {
        id: Date.now().toString(),
        title: eventForm.title,
        start: eventForm.start,
        end: eventForm.end,
        notes: eventForm.notes,
        category: category,
        backgroundColor: categoryData.color,
        tutorId: eventForm.tutorId,
        tutor: tutorName,
        createdBy: user.email
      };
      
      setCalendarEvents([...calendarEvents, newEvent]);
      
      setSnackbar({
        open: true,
        message: 'Appointment created successfully!',
        severity: 'success'
      });
    } else {
      // Update existing event
      const updatedEvents = calendarEvents.map(event => {
        if (event.id === selectedEvent.id) {
          return {
            ...event,
            title: eventForm.title,
            start: eventForm.start,
            end: eventForm.end,
            notes: eventForm.notes,
            category: category,
            backgroundColor: categoryData.color,
            tutorId: eventForm.tutorId,
            tutor: tutorName
          };
        }
        return event;
      });
      
      setCalendarEvents(updatedEvents);
      
      setSnackbar({
        open: true,
        message: 'Appointment updated successfully!',
        severity: 'success'
      });
    }
    
    setOpenEventDialog(false);
  };
  
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      const filteredEvents = calendarEvents.filter(event => event.id !== selectedEvent.id);
      setCalendarEvents(filteredEvents);
      
      setSnackbar({
        open: true,
        message: 'Appointment deleted successfully!',
        severity: 'info'
      });
      
      setDeleteConfirmOpen(false);
      setOpenEventDialog(false);
    }
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // event styling CSS
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.backgroundColor || eventCategories[0].color,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      fontWeight: '500'
    };
    return {
      style
    };
  };
  //HTML for calendar page
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                Student Planner
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage your tutoring sessions and appointments
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1} alignItems="center">
                {eventCategories.map(category => (
                  <Tooltip key={category.name} title={category.name}>
                    <Chip 
                      icon={<EventIcon style={{ color: 'white' }} />}
                      label={category.name} 
                      size="small"
                      sx={{ 
                        backgroundColor: category.color, 
                        color: 'white',
                        display: { xs: 'none', md: 'flex' }
                      }} 
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Grid>
          </Grid>
          
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              position: 'relative',
              borderRadius: 2,
              minHeight: 650
            }}
          >
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
            />
            
            <Tooltip title="Add New Appointment">
              <Fab 
                color="primary" 
                aria-label="add" 
                sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  right: 16 
                }}
                onClick={() => {
                  setFormMode('create');
                  resetForm();
                  setOpenEventDialog(true);
                }}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </Paper>
          
          {/* Event Dialog */}
          <Dialog 
            open={openEventDialog} 
            onClose={() => setOpenEventDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {formMode === 'create' ? 'Add New Appointment' : 'Edit Appointment'}
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => setOpenEventDialog(false)} 
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="title"
                  label="Appointment Title"
                  name="title"
                  value={eventForm.title}
                  onChange={handleInputChange}
                  autoFocus
                />
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <DateTimePicker
                      label="Start Time"
                      value={eventForm.start}
                      onChange={(newValue) => handleDateChange('start', newValue)}
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          margin: 'normal',
                          fullWidth: true
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DateTimePicker
                      label="End Time"
                      value={eventForm.end}
                      onChange={(newValue) => handleDateChange('end', newValue)}
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          margin: 'normal',
                          fullWidth: true
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="category-label">Category</InputLabel>
                      <Select
                        labelId="category-label"
                        id="category"
                        name="category"
                        value={eventForm.category}
                        label="Category"
                        onChange={handleInputChange}
                      >
                        {eventCategories.map(category => (
                          <MenuItem key={category.name} value={category.name}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  width: 16, 
                                  height: 16, 
                                  borderRadius: '50%', 
                                  bgcolor: category.color,
                                  mr: 1
                                }} 
                              />
                              {category.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="tutor-label">Assign Tutor</InputLabel>
                      <Select
                        labelId="tutor-label"
                        id="tutorId"
                        name="tutorId"
                        value={eventForm.tutorId}
                        label="Assign Tutor"
                        onChange={handleInputChange}
                        startAdornment={
                          eventForm.tutorId ? (
                            <SchoolIcon sx={{ ml: 1, mr: 1, color: 'action.active' }} />
                          ) : null
                        }
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {tutors.map(tutor => (
                          <MenuItem key={tutor.id} value={tutor.id.toString()}>
                            {tutor.name} - {tutor.interests.join(", ")}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="notes"
                  label="Notes"
                  name="notes"
                  multiline
                  rows={4}
                  value={eventForm.notes}
                  onChange={handleInputChange}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
              {formMode === 'edit' && (
                <Button 
                  onClick={() => setDeleteConfirmOpen(true)} 
                  color="error" 
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              )}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={() => setOpenEventDialog(false)} color="inherit">
                  Cancel
                </Button>
                <Button onClick={handleSaveEvent} variant="contained" color="primary">
                  {formMode === 'create' ? 'Create Appointment' : 'Update Appointment'}
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            aria-labelledby="delete-dialog-title"
          >
            <DialogTitle id="delete-dialog-title">
              Confirm Deletion
            </DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this appointment?
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
                Cancel
              </Button>
              <Button onClick={handleDeleteEvent} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Snackbar notifications */}
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity} 
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default CalendarPage;