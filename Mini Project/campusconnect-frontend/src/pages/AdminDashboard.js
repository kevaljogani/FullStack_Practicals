import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Alert,
  Skeleton,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard,
  People,
  Event,
  Forum,
  School,
  MoreVert,
  Block,
  CheckCircle,
  Delete,
  Edit,
  Visibility,
  TrendingUp,
  Warning,
  Notifications,
  Settings,
  Add,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [resources, setResources] = useState([]);
  const [reports, setReports] = useState([]);
  const [contentModeration, setContentModeration] = useState({});
  const [settings, setSettings] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [dialogType, setDialogType] = useState(''); // 'announcement' or 'rejectEvent'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { label: 'Overview', icon: <Dashboard /> },
    { label: 'Pending Events', icon: <Warning /> },
    { label: 'Users', icon: <People /> },
    { label: 'Events', icon: <Event /> },
    { label: 'Content Moderation', icon: <Block /> },
    { label: 'Forum Posts', icon: <Forum /> },
    { label: 'Resources', icon: <School /> },
    { label: 'Reports', icon: <TrendingUp /> },
    { label: 'Settings', icon: <Settings /> },
  ];

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  // Auto-refresh for pending events and content moderation every 30 seconds
  useEffect(() => {
    if ((activeTab === 1 || activeTab === 4) && user?.role === 'admin') {
      const interval = setInterval(() => {
        setRefreshing(true);
        if (activeTab === 1) {
          fetchPendingEvents();
        } else if (activeTab === 4) {
          fetchContentModeration();
        }
        setTimeout(() => setRefreshing(false), 1000);
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 0:
          await fetchStats();
          break;
        case 1:
          await fetchPendingEvents();
          break;
        case 2:
          await fetchUsers();
          break;
        case 3:
          await fetchEvents();
          break;
        case 4:
          await fetchContentModeration();
          break;
        case 5:
          await fetchPosts();
          break;
        case 6:
          await fetchResources();
          break;
        case 7:
          await fetchReports();
          break;
        case 8:
          await fetchSettings();
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const response = await axios.get('/api/admin/stats');
    setStats(response.data);
  };

  const fetchUsers = async () => {
    const response = await axios.get('/api/admin/users');
    setUsers(response.data.users || []);
  };

  const fetchEvents = async () => {
    const [approvedRes, pendingRes] = await Promise.all([
      axios.get('/api/events'),
      axios.get('/api/events/admin/pending')
    ]);
    setEvents({ 
      approved: approvedRes.data.events || [], 
      pending: pendingRes.data.events || [] 
    });
  };

  const fetchPosts = async () => {
    const response = await axios.get('/api/admin/posts');
    setPosts(response.data.posts || []);
  };

  const fetchResources = async () => {
    const response = await axios.get('/api/admin/resources');
    setResources(response.data.resources || []);
  };

  const fetchPendingEvents = async () => {
    const response = await axios.get('/api/admin/pending-events');
    setPendingEvents(response.data.events || []);
  };

  const fetchContentModeration = async () => {
    const response = await axios.get('/api/admin/content-moderation');
    setContentModeration(response.data);
  };

  const fetchSettings = async () => {
    const response = await axios.get('/api/admin/settings');
    setSettings(response.data);
  };

  const fetchReports = async () => {
    const response = await axios.get('/api/admin/reports');
    setReports(response.data);
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await axios.put(`/api/admin/events/${eventId}/approve`);
      toast.success('Event approved successfully');
      await fetchPendingEvents();
      await fetchStats(); // Refresh stats
    } catch (error) {
      toast.error('Failed to approve event');
    }
  };

  const handleRejectEvent = async (eventId, reason = '') => {
    try {
      await axios.put(`http://localhost:5000/api/admin/reject-event/${eventId}`, 
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSnackbarMessage('Event rejected successfully');
      setSnackbarOpen(true);
      setDialogOpen(false);
      setRejectReason('');
      setSelectedItem(null);
      
      // Refresh pending events
      if (selectedTab === 'pending') {
        fetchPendingEvents();
      }
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error rejecting event:', error);
      setSnackbarMessage('Failed to reject event');
      setSnackbarOpen(true);
    }
  };

  const handleModerateContent = async (type, id, action, reason = '') => {
    try {
      await axios.put(`/api/admin/moderate/${type}/${id}`, { action, reason });
      toast.success(`Content ${action} successfully`);
      await fetchContentModeration();
    } catch (error) {
      toast.error('Failed to moderate content');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUserAction = async (userId, action) => {
    try {
      await axios.put(`/api/admin/users/${userId}/${action}`);
      toast.success(`User ${action}ed successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
    setAnchorEl(null);
  };

  const handleContentAction = async (type, id, action) => {
    try {
      await axios.put(`/api/admin/${type}/${id}/${action}`);
      toast.success(`${type} ${action}ed successfully`);
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${action} ${type}`);
    }
    setAnchorEl(null);
  };

  const handleEventApproval = async (eventId, action, reason = '') => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const payload = action === 'reject' ? { reason } : {};
      
      await axios.put(`/api/events/${eventId}/${endpoint}`, payload);
      toast.success(`Event ${action}ed successfully`);
      fetchEvents();
    } catch (error) {
      toast.error(`Failed to ${action} event`);
    }
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSendAnnouncement = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/announcement',
        { message: announcementText },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSnackbarMessage('Announcement sent successfully');
      setSnackbarOpen(true);
      setDialogOpen(false);
      setDialogType('');
      setAnnouncementText('');
    } catch (error) {
      console.error('Error sending announcement:', error);
      setSnackbarMessage('Failed to send announcement');
      setSnackbarOpen(true);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const StatsCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          Access denied. You need admin privileges to view this page.
        </Alert>
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
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor your campus community platform
          </Typography>
        </Box>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Card>

        {/* Tab Content */}
        {activeTab === 0 && (
          // Overview Tab
          <Box>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Total Users"
                  value={stats.overview?.totalUsers || 0}
                  icon={<People sx={{ fontSize: 40 }} />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Active Events"
                  value={stats.overview?.approvedEvents || 0}
                  icon={<Event sx={{ fontSize: 40 }} />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Forum Posts"
                  value={stats.overview?.totalForumPosts || 0}
                  icon={<Forum sx={{ fontSize: 40 }} />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Resources"
                  value={stats.overview?.totalResources || 0}
                  icon={<School sx={{ fontSize: 40 }} />}
                  color="warning"
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    {stats.recentActivity?.events?.map((event, index) => (
                      <Box key={`event-${index}`} display="flex" alignItems="center" gap={2} mb={1}>
                        <Event color="primary" fontSize="small" />
                        <Typography variant="body2">
                          New event: {event.title} by {event.organizer?.name}
                        </Typography>
                      </Box>
                    ))}
                    {stats.recentActivity?.users?.map((user, index) => (
                      <Box key={`user-${index}`} display="flex" alignItems="center" gap={2} mb={1}>
                        <People color="secondary" fontSize="small" />
                        <Typography variant="body2">
                          New user: {user.name} ({user.role})
                        </Typography>
                      </Box>
                    ))}
                    {stats.recentActivity?.posts?.map((post, index) => (
                      <Box key={`post-${index}`} display="flex" alignItems="center" gap={2} mb={1}>
                        <Forum color="success" fontSize="small" />
                        <Typography variant="body2">
                          New post: {post.title} by {post.author?.name}
                        </Typography>
                      </Box>
                    ))}
                    {(!stats.recentActivity?.events?.length && 
                      !stats.recentActivity?.users?.length && 
                      !stats.recentActivity?.posts?.length) && (
                      <Typography variant="body2" color="text.secondary">
                        No recent activity
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button
                        variant="contained"
                        startIcon={<Notifications />}
                        onClick={() => {
                          setDialogType('announcement');
                          setDialogOpen(true);
                        }}
                      >
                        Send Announcement
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => console.log('Create event')}
                      >
                        Create Event
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Settings />}
                        onClick={() => setActiveTab(6)}
                      >
                        Platform Settings
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          // Pending Events Tab
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Pending Events for Approval
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={refreshing ? <CircularProgress size={16} /> : <Settings />}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ mr: 2 }}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Chip 
                  label={`${pendingEvents.length} Pending`} 
                  color="warning"
                  variant="outlined"
                />
              </Box>
            </Box>

            {stats.overview?.adminDepartment && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You can only approve/reject events from your department: <strong>{stats.overview.adminDepartment}</strong>
              </Alert>
            )}

            <Card>
              <CardContent>
                {loading ? (
                  <Box>
                    {Array.from(new Array(3)).map((_, index) => (
                      <Skeleton key={index} height={100} sx={{ mb: 2 }} />
                    ))}
                  </Box>
                ) : pendingEvents.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No pending events for approval
                    </Typography>
                  </Box>
                ) : (
                  pendingEvents.map((event) => (
                    <Card key={event._id} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Typography variant="h6" gutterBottom>
                              {event.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {event.description}
                            </Typography>
                            <Box display="flex" gap={2} mb={2}>
                              <Chip label={event.category} size="small" />
                              <Chip 
                                label={new Date(event.date).toLocaleDateString()} 
                                size="small" 
                                variant="outlined" 
                              />
                              <Chip 
                                label={event.organizer?.profile?.department || 'No Department'} 
                                size="small" 
                                color="primary" 
                              />
                            </Box>
                            <Typography variant="body2">
                              <strong>Organizer:</strong> {event.organizer?.name} ({event.organizer?.email})
                            </Typography>
                            <Typography variant="body2">
                              <strong>Location:</strong> {event.location}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Max Participants:</strong> {event.maxParticipants}
                            </Typography>
                          </Box>
                          <Box display="flex" flexDirection="column" gap={1} ml={2}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApproveEvent(event._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Block />}
                              onClick={() => {
                                setSelectedItem(event);
                                setDialogType('rejectEvent');
                                setDialogOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 2 && (
          // Users Tab
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from(new Array(5)).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                          <TableCell><Skeleton /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      Array.isArray(users) && users.map((userItem) => (
                        <TableRow key={userItem._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar src={userItem.profilePicture}>
                                {userItem.name?.[0]}
                              </Avatar>
                              <Typography>{userItem.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{userItem.email}</TableCell>
                          <TableCell>
                            <Chip 
                              label={userItem.role} 
                              color={userItem.role === 'admin' ? 'error' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={userItem.isActive ? 'Active' : 'Blocked'} 
                              color={userItem.isActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(userItem.createdAt)}</TableCell>
                          <TableCell>
                            <IconButton
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setSelectedItem(userItem);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {activeTab === 3 && (
          // Events Tab
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage approved and rejected events. Department: {stats.overview?.adminDepartment || 'All Departments'}
              </Typography>
              <Box mt={2}>
                <Typography variant="body1">
                  Total Events: {stats.overview?.totalEvents || 0} | 
                  Approved: {stats.overview?.approvedEvents || 0} | 
                  Pending: {stats.overview?.pendingEvents || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeTab === 4 && (
          // Content Moderation Tab
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Content Moderation
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="error" gutterBottom>
                      Flagged Posts
                    </Typography>
                    {loading ? (
                      <Skeleton height={200} />
                    ) : (
                      <Box>
                        <Typography variant="h4" color="error">
                          {contentModeration.totalReports?.posts || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Posts needing review
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      Flagged Resources
                    </Typography>
                    {loading ? (
                      <Skeleton height={200} />
                    ) : (
                      <Box>
                        <Typography variant="h4" color="warning.main">
                          {contentModeration.totalReports?.resources || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Resources needing review
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="info.main" gutterBottom>
                      Flagged Users
                    </Typography>
                    {loading ? (
                      <Skeleton height={200} />
                    ) : (
                      <Box>
                        <Typography variant="h4" color="info.main">
                          {contentModeration.totalReports?.users || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Users needing review
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Flagged Content Lists */}
              {contentModeration.content?.posts && contentModeration.content.posts.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Flagged Forum Posts
                      </Typography>
                      {contentModeration.content.posts.map((post) => (
                        <Card key={post._id} variant="outlined" sx={{ mb: 2 }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <Box flex={1}>
                                <Typography variant="subtitle1" gutterBottom>
                                  {post.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  By: {post.author?.name} | Reports: {post.reportCount || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {post.content.substring(0, 200)}...
                                </Typography>
                              </Box>
                              <Box display="flex" gap={1} ml={2}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  onClick={() => handleModerateContent('post', post._id, 'hide')}
                                >
                                  Hide
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={() => handleModerateContent('post', post._id, 'clear-reports')}
                                >
                                  Clear Reports
                                </Button>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {activeTab === 5 && (
          // Forum Posts Tab (existing)
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Forum Posts Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage forum posts, replies, and community discussions.
              </Typography>
            </CardContent>
          </Card>
        )}

        {activeTab === 6 && (
          // Resources Tab (existing)  
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resources Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage uploaded resources, files, and learning materials.
              </Typography>
            </CardContent>
          </Card>
        )}

        {activeTab === 7 && (
          // Reports Tab
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reports & Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate and view detailed reports about platform usage and activities.
              </Typography>
            </CardContent>
          </Card>
        )}

        {activeTab === 8 && (
          // Settings Tab
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Configure system settings and administrative preferences.
              </Typography>
              
              {settings.adminInfo && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Admin Information</Typography>
                  <Typography variant="body2">
                    Name: {settings.adminInfo.name}<br/>
                    Email: {settings.adminInfo.email}<br/>
                    Department: {settings.adminInfo.department || 'All Departments'}
                  </Typography>
                </Alert>
              )}

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Content Moderation Settings
                  </Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Auto-hide reported content"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Email notifications for reports"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require event approval"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    System Information
                  </Typography>
                  <Typography variant="body2">
                    Total Users: {settings.systemInfo?.totalUsers || 0}<br/>
                    Total Events: {settings.systemInfo?.totalEvents || 0}<br/>
                    Total Posts: {settings.systemInfo?.totalPosts || 0}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeTab === 6 && (
          // Settings Tab
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Platform Settings
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Allow User Registration"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable File Uploads"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Email Notifications"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Auto-approve Resources"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Content Moderation
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Auto-moderate Posts"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Require Event Approval"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Filter Inappropriate Content"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Enable Report System"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => console.log('View', selectedItem)}>
            <Visibility sx={{ mr: 1 }} /> View
          </MenuItem>
          <MenuItem onClick={() => console.log('Edit', selectedItem)}>
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
          {selectedItem?.isActive ? (
            <MenuItem onClick={() => handleUserAction(selectedItem._id, 'block')}>
              <Block sx={{ mr: 1 }} /> Block
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleUserAction(selectedItem._id, 'unblock')}>
              <CheckCircle sx={{ mr: 1 }} /> Unblock
            </MenuItem>
          )}
          <MenuItem onClick={() => console.log('Delete', selectedItem)}>
            <Delete sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Multi-purpose Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogType === 'announcement' ? 'Send Announcement' : 
             dialogType === 'rejectEvent' ? 'Reject Event' : 'Action'}
          </DialogTitle>
          <DialogContent>
            {dialogType === 'announcement' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter your announcement message..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                sx={{ mt: 2 }}
              />
            )}
            
            {dialogType === 'rejectEvent' && selectedItem && (
              <>
                <Typography variant="body1" paragraph>
                  Are you sure you want to reject the event "{selectedItem.title}"?
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Organized by: {selectedItem.organizer?.name}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Rejection Reason (Optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  sx={{ mt: 2 }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDialogOpen(false);
              setRejectReason('');
            }}>
              Cancel
            </Button>
            {dialogType === 'announcement' && (
              <Button 
                onClick={handleSendAnnouncement}
                variant="contained"
                disabled={!announcementText.trim()}
              >
                Send Announcement
              </Button>
            )}
            {dialogType === 'rejectEvent' && selectedItem && (
              <Button 
                onClick={() => handleRejectEvent(selectedItem._id, rejectReason)}
                variant="contained"
                color="error"
              >
                Reject Event
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;
