import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, event: null });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const tabs = [
    { label: 'All Events', value: 'all' },
    { label: 'Created by Me', value: 'created' },
    { label: 'Joined Events', value: 'joined' }
  ];

  useEffect(() => {
    fetchMyEvents(tabs[tabValue].value);
  }, [tabValue]);

  const fetchMyEvents = async (type = 'all') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/events/my/events?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching my events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/${deleteDialog.event._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEvents(events.filter(event => event._id !== deleteDialog.event._id));
      setDeleteDialog({ open: false, event: null });
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/${eventId}/leave`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh events
      fetchMyEvents(tabs[tabValue].value);
    } catch (error) {
      console.error('Error leaving event:', error);
      setError('Failed to leave event');
    }
  };

  const handleMenuClick = (event, eventData) => {
    setMenuAnchor(event.currentTarget);
    setSelectedEvent(eventData);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedEvent(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'primary',
      ongoing: 'success',
      completed: 'default',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const EventCard = ({ event }) => (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" component="h3">
                {event.title}
              </Typography>
              {event.isOrganizer && (
                <Chip 
                  label="Organizer" 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              )}
              {event.isApproved ? (
                <Chip 
                  icon={<ApprovedIcon />}
                  label="Approved" 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                />
              ) : (
                <Chip 
                  icon={<PendingIcon />}
                  label="Pending Approval" 
                  size="small" 
                  color="warning" 
                  variant="outlined" 
                />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {event.description.length > 150 
                ? `${event.description.substring(0, 150)}...` 
                : event.description
              }
            </Typography>

            <Box display="flex" gap={2} mb={1} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2">{formatDate(event.date)}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="body2">{event.time}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2">{event.location}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <PeopleIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {event.participantCount}/{event.maxParticipants}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={1} alignItems="center">
              <Chip 
                label={event.category} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={event.status} 
                size="small" 
                color={getStatusColor(event.status)}
              />
            </Box>
          </Box>

          <IconButton onClick={(e) => handleMenuClick(e, event)}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading your events...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/events/create')}
        >
          Create Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {events.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {tabs[tabValue].value === 'created' 
              ? "You haven't created any events yet." 
              : tabs[tabValue].value === 'joined'
              ? "You haven't joined any events yet."
              : "You don't have any events yet."
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/create')}
          >
            Create Your First Event
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </Grid>
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/events/${selectedEvent?._id}`);
          handleMenuClose();
        }}>
          View Details
        </MenuItem>
        
        {selectedEvent?.isOrganizer && (
          <MenuItem onClick={() => {
            navigate(`/events/${selectedEvent._id}/edit`);
            handleMenuClose();
          }}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit Event
          </MenuItem>
        )}
        
        {selectedEvent?.isOrganizer && (
          <MenuItem onClick={() => {
            setDeleteDialog({ open: true, event: selectedEvent });
            handleMenuClose();
          }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete Event
          </MenuItem>
        )}
        
        {!selectedEvent?.isOrganizer && selectedEvent?.isParticipant && (
          <MenuItem onClick={() => {
            handleLeaveEvent(selectedEvent._id);
            handleMenuClose();
          }}>
            Leave Event
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, event: null })}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.event?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, event: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteEvent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="create event"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={() => navigate('/events/create')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default MyEvents;
