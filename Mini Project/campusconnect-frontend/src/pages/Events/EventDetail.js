import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn,
  AccessTime,
  Person,
  Edit,
  Delete,
  ExitToApp,
  Login,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    setActionLoading(true);
    try {
      await axios.post(`/api/events/${id}/join`);
      toast.success('Successfully joined the event!');
      fetchEvent(); // Refresh event data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    setActionLoading(true);
    try {
      await axios.post(`/api/events/${id}/leave`);
      toast.success('Successfully left the event');
      fetchEvent(); // Refresh event data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`/api/events/${id}`);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setActionLoading(false);
      setDeleteDialog(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const isParticipant = event?.participants?.some(p => p.user._id === user?.id);
  const isOrganizer = event?.organizer?._id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOrganizer || isAdmin;
  const canJoin = !isParticipant && event?.status === 'upcoming' && !event?.isFull;

  if (loading) {
    return <LoadingSpinner message="Loading event details..." />;
  }

  if (!event) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" textAlign="center">
          Event not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          {/* Main Event Details */}
          <Grid item xs={12} md={8}>
            <Card>
              {event.imageUrl && (
                <Box
                  sx={{
                    height: 300,
                    backgroundImage: `url(${event.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Chip 
                      label={event.category} 
                      color={getCategoryColor(event.category)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {event.title}
                    </Typography>
                  </Box>
                  <Chip 
                    label={event.status} 
                    variant="outlined"
                    color={event.status === 'upcoming' ? 'success' : 'default'}
                  />
                </Box>

                <Typography variant="body1" paragraph color="text.secondary">
                  {event.description}
                </Typography>

                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatDate(event.date)} at {event.time}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {event.location}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {event.participants?.length || 0} / {event.maxParticipants} participants
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {event.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box display="flex" gap={2} flexWrap="wrap">
                  {canJoin && (
                    <Button
                      variant="contained"
                      startIcon={<Login />}
                      onClick={handleJoinEvent}
                      disabled={actionLoading}
                    >
                      Join Event
                    </Button>
                  )}
                  
                  {isParticipant && !isOrganizer && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ExitToApp />}
                      onClick={handleLeaveEvent}
                      disabled={actionLoading}
                    >
                      Leave Event
                    </Button>
                  )}

                  {canEdit && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/events/edit/${event._id}`)}
                      >
                        Edit Event
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setDeleteDialog(true)}
                      >
                        Delete Event
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Organizer Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Organizer
                </Typography>
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={event.organizer?.profile?.profilePicture}
                    sx={{ mr: 2 }}
                  >
                    {event.organizer?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {event.organizer?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.organizer?.profile?.department}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Participants ({event.participants?.length || 0})
                </Typography>
                <List dense>
                  {event.participants?.slice(0, 10).map((participant, index) => (
                    <ListItem key={participant._id || index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={participant.user?.profile?.profilePicture}
                          sx={{ width: 32, height: 32 }}
                        >
                          {participant.user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={participant.user?.name}
                        secondary={participant.user?.profile?.department}
                      />
                    </ListItem>
                  ))}
                  {event.participants?.length > 10 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      +{event.participants.length - 10} more participants
                    </Typography>
                  )}
                  {(!event.participants || event.participants.length === 0) && (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No participants yet
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteEvent} 
              color="error" 
              variant="contained"
              disabled={actionLoading}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default EventDetail;
