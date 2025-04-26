import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Rating,
  Chip,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
  Tab,
  Tabs,
  InputAdornment,
  TextField
} from "@mui/material";
import {
  Message as MessageIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { Link } from "react-router-dom";

function ProfilesPage({ tutors }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTutor, setSelectedTutor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filter tutors based on search term and subject filter
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = 
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.interests.some(interest => 
        interest.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
    if (filter === "all") return matchesSearch;
    if (filter === "math") return matchesSearch && tutor.interests.some(i => i.toLowerCase().includes("math"));
    if (filter === "science") return matchesSearch && tutor.interests.some(i => 
      i.toLowerCase().includes("biology") || 
      i.toLowerCase().includes("chemistry") || 
      i.toLowerCase().includes("physics")
    );
    return matchesSearch;
  });

  // Get profile image, with fallbacks
  const getProfileImage = (tutor) => {
    // Try to load the profile image
    if (tutor.profileImage) {
      return tutor.profileImage;
    } 
    // If profile image path doesn't exist, use the fallback
    else if (tutor.fallbackImage) {
      return tutor.fallbackImage;
    }
    // Last resort: use a placeholder
    return `/api/placeholder/350/200?text=${tutor.name.replace(' ', '+')}`;
  };

  const handleOpenDialog = (tutor) => {
    setSelectedTutor(tutor);
  };

  const handleCloseDialog = () => {
    setSelectedTutor(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Tutor Profiles
        </Typography>
        
        {/* Search and Filter Bar */}
        <Box sx={{ mb: 4, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search tutors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Tabs
            value={filter}
            onChange={(e, newValue) => setFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="tutor filters"
          >
            <Tab label="All Tutors" value="all" />
            <Tab label="Mathematics" value="math" />
            <Tab label="Sciences" value="science" />
          </Tabs>
        </Box>
        
        {/* Tutor Cards start here */}
        <Grid container spacing={3}>
          {filteredTutors.map((tutor) => (
            <Grid item xs={12} md={6} lg={4} key={tutor.id}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={getProfileImage(tutor)}
                  alt={tutor.name}
                  onError={(e) => {
                    
                    if (e.target.src !== tutor.fallbackImage && tutor.fallbackImage) {
                      e.target.src = tutor.fallbackImage;
                    } else {
                      //placeholder for image
                      e.target.src = `/api/placeholder/350/200?text=${tutor.name.replace(' ', '+')}`;
                    }
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        mr: 2,
                        bgcolor: theme.palette.primary.main 
                      }}
                    >
                      {tutor.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{tutor.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={tutor.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({tutor.rating})
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {tutor.bio}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Interests
                  </Typography>
                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {tutor.interests.map((interest) => (
                      <Chip
                        key={interest}
                        label={interest}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Classes
                  </Typography>
                  <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {tutor.classes.map((className) => (
                      <Chip
                        key={className}
                        label={className}
                        variant="outlined"
                        size="small"
                        icon={<SchoolIcon fontSize="small" />}
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleOpenDialog(tutor)}
                  >
                    View Profile
                  </Button>
                  <Button 
                    component={Link} 
                    to="/chat" 
                    variant="outlined" 
                    size="small"
                    startIcon={<MessageIcon />}
                  >
                    Message
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {filteredTutors.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary">
              No tutors found matching your search criteria
            </Typography>
          </Box>
        )}
        
        {/* Tutor Details panel */}
        <Dialog
          open={!!selectedTutor}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          aria-labelledby="tutor-profile-dialog"
        >
          {selectedTutor && (
            <>
              <DialogTitle id="tutor-profile-dialog" sx={{ pr: 6 }}>
                {selectedTutor.name}'s Profile
                <IconButton
                  aria-label="close"
                  onClick={handleCloseDialog}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={getProfileImage(selectedTutor)}
                        alt={selectedTutor.name}
                        sx={{ 
                          borderRadius: 1,
                          mb: 2
                        }}
                        onError={(e) => {
                          // fallback image load
                          if (e.target.src !== selectedTutor.fallbackImage && selectedTutor.fallbackImage) {
                            e.target.src = selectedTutor.fallbackImage;
                          } else {
                            // placeholder image
                            e.target.src = `/api/placeholder/350/200?text=${selectedTutor.name.replace(' ', '+')}`;
                          }
                        }}
                      />
                      <Box sx={{ position: 'absolute', bottom: 24, right: 8, bgcolor: 'primary.main', color: 'white', px: 1, py: 0.5, borderRadius: 1 }}>
                        <Rating value={selectedTutor.rating} precision={0.1} readOnly size="small" />
                      </Box>
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Contact
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedTutor.contact}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        component={Link} 
                        to="/chat" 
                        variant="contained" 
                        fullWidth
                        startIcon={<MessageIcon />}
                      >
                        Send Message
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      {selectedTutor.name}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedTutor.bio}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Expertise
                    </Typography>
                    <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedTutor.interests.map((interest) => (
                        <Chip
                          key={interest}
                          label={interest}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Classes
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 3 }}>
                      {selectedTutor.classes.map((className) => (
                        <Grid item key={className}>
                          <Chip
                            label={className}
                            icon={<SchoolIcon />}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Reviews
                    </Typography>
                    <List>
                      {selectedTutor.reviews.map((review, index) => (
                        <React.Fragment key={index}>
                          <ListItem alignItems="flex-start">
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                                    S
                                  </Avatar>
                                  <Typography variant="body2" fontWeight="bold">
                                    Student {index + 1}
                                  </Typography>
                                </Box>
                              }
                              secondary={review}
                            />
                          </ListItem>
                          {index < selectedTutor.reviews.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
}

export default ProfilesPage;