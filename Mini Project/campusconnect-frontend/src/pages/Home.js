import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Event,
  Forum,
  FolderShared,
  TrendingUp,
  People,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Home = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalPosts: 0,
    totalResources: 0,
    totalUsers: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, postsRes] = await Promise.all([
        axios.get('/api/events?limit=5&upcoming=true'),
        axios.get('/api/forum?limit=5'),
      ]);

      setRecentEvents(eventsRes.data.events);
      setRecentPosts(postsRes.data.posts);
      
      // Mock stats for now
      setStats({
        totalEvents: eventsRes.data.pagination?.total || 0,
        totalPosts: postsRes.data.pagination?.total || 0,
        totalResources: 150, // Mock data
        totalUsers: 500, // Mock data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening in your campus community today.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {stats.totalEvents}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Events
                      </Typography>
                    </Box>
                    <Event sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="secondary">
                        {stats.totalPosts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Forum Posts
                      </Typography>
                    </Box>
                    <Forum sx={{ fontSize: 40, color: 'secondary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {stats.totalResources}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Resources
                      </Typography>
                    </Box>
                    <FolderShared sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {stats.totalUsers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Students
                      </Typography>
                    </Box>
                    <People sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/events/create')}
              >
                Create Event
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/forum/create')}
              >
                New Post
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/resources/upload')}
              >
                Upload Resource
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={() => navigate('/profile')}
              >
                View Profile
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Content */}
        <Grid container spacing={3}>
          {/* Recent Events */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Upcoming Events
                  </Typography>
                  <Button size="small" onClick={() => navigate('/events')}>
                    View All
                  </Button>
                </Box>
                <List>
                  {recentEvents.map((event, index) => (
                    <React.Fragment key={event._id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/events/${event._id}`)}
                        sx={{ px: 0 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Event />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(event.date)} • {event.location}
                              </Typography>
                              <Chip
                                label={event.category}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentEvents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {recentEvents.length === 0 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      No upcoming events found
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Forum Posts */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Discussions
                  </Typography>
                  <Button size="small" onClick={() => navigate('/forum')}>
                    View All
                  </Button>
                </Box>
                <List>
                  {recentPosts.map((post, index) => (
                    <React.Fragment key={post._id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/forum/${post._id}`)}
                        sx={{ px: 0 }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={post.author?.profile?.profilePicture}
                            sx={{ bgcolor: 'secondary.main' }}
                          >
                            {post.author?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={post.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                by {post.author?.name} • {formatDate(post.createdAt)}
                              </Typography>
                              <Chip
                                label={post.category}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentPosts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {recentPosts.length === 0 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      No recent discussions found
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Home;
