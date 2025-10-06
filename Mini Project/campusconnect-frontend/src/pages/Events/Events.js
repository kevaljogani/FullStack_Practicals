import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  MenuItem,
  Fab,
  Avatar,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  Add,
  Search,
  Event as EventIcon,
  LocationOn,
  Person,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'upcoming',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const navigate = useNavigate();

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'technical', label: 'Technical' },
    { value: 'social', label: 'Social' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: '', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
  ];

  useEffect(() => {
    fetchEvents();
  }, [filters, pagination.current]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 12,
        ...filters,
      });

      const response = await axios.get(`/api/events?${params}`);
      setEvents(response.data.events);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handlePageChange = (event, value) => {
    setPagination({ ...pagination, current: value });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'primary',
      sports: 'success',
      cultural: 'secondary',
      technical: 'info',
      social: 'warning',
      workshop: 'default',
      seminar: 'default',
      other: 'default',
    };
    return colors[category] || 'default';
  };

  if (loading && events.length === 0) {
    return <LoadingSpinner message="Loading events..." />;
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Campus Events
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover and join events happening around your campus
            </Typography>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {loading ? (
          <LoadingSpinner message="Loading events..." />
        ) : (
          <>
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      {event.imageUrl && (
                        <Box
                          sx={{
                            height: 200,
                            backgroundImage: `url(${event.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Chip 
                            label={event.category} 
                            size="small" 
                            color={getCategoryColor(event.category)}
                          />
                          <Chip 
                            label={event.status} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {event.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          mb={2}
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {event.description}
                        </Typography>

                        <Box display="flex" alignItems="center" mb={1}>
                          <EventIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(event.date)} at {event.time}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.location}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.participants?.length || 0} / {event.maxParticipants} participants
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mt={2}>
                          <Avatar 
                            sx={{ width: 24, height: 24, mr: 1 }}
                            src={event.organizer?.profile?.profilePicture}
                          >
                            {event.organizer?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            by {event.organizer?.name}
                          </Typography>
                        </Box>
                      </CardContent>
                      
                      <CardActions>
                        <Button 
                          size="small" 
                          fullWidth
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event._id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {events.length === 0 && !loading && (
              <Box textAlign="center" py={8}>
                <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No events found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or create a new event
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.current}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="create event"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => navigate('/events/create')}
        >
          <Add />
        </Fab>
      </motion.div>
    </Container>
  );
};

export default Events;
