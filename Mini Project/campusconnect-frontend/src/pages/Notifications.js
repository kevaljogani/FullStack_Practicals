import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  MoreVert,
  Delete,
  MarkEmailRead,
  MarkEmailUnread,
  Settings,
  Clear,
  CheckCircle,
  Info,
  Warning,
  Error,
  Event,
  Forum,
  School,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    forumUpdates: true,
    resourceUpdates: true,
    adminAnnouncements: true,
  });

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Events', value: 'event' },
    { label: 'Forum', value: 'forum' },
    { label: 'Resources', value: 'resource' },
    { label: 'System', value: 'system' },
  ];

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, [activeTab]);

  useEffect(() => {
    if (socket) {
      socket.on('new-notification', (notification) => {
        setNotifications(prev => Array.isArray(prev) ? [notification, ...prev] : [notification]);
        toast.info(notification.message, {
          icon: getNotificationIcon(notification.type),
        });
      });

      return () => {
        socket.off('new-notification');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        filter: tabs[activeTab].value,
        limit: 50,
      };

      const response = await axios.get('/api/notifications', { params });
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/notifications/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch notification settings');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        Array.isArray(prev) ? prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        ) : []
      );
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAsUnread = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/unread`);
      setNotifications(prev =>
        Array.isArray(prev) ? prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: false } : notif
        ) : []
      );
    } catch (error) {
      toast.error('Failed to mark notification as unread');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => Array.isArray(prev) ? prev.filter(notif => notif._id !== notificationId) : []);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      setNotifications(prev => Array.isArray(prev) ? prev.map(notif => ({ ...notif, read: true })) : []);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete('/api/notifications/clear-all');
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleSettingChange = async (setting, value) => {
    try {
      const updatedSettings = { ...settings, [setting]: value };
      setSettings(updatedSettings);
      await axios.put('/api/notifications/settings', updatedSettings);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      info: <Info color="info" />,
      success: <CheckCircle color="success" />,
      warning: <Warning color="warning" />,
      error: <Error color="error" />,
      event: <Event color="primary" />,
      forum: <Forum color="primary" />,
      resource: <School color="primary" />,
      system: <NotificationIcon color="action" />,
    };
    return iconMap[type] || <NotificationIcon color="action" />;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'error',
      event: 'primary',
      forum: 'secondary',
      resource: 'primary',
      system: 'default',
    };
    return colorMap[type] || 'default';
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInHours = (now - notifDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 72) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return notifDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter(notif => !notif.read).length : 0;

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationIcon sx={{ mr: 2 }} />
              </Badge>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with your campus activities
            </Typography>
          </Box>
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearAll}
              color="error"
              startIcon={<Clear />}
            >
              Clear All
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSettingsOpen(true)}
              startIcon={<Settings />}
            >
              Settings
            </Button>
          </Box>
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
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {tab.label}
                    {tab.value === 'unread' && unreadCount > 0 && (
                      <Chip label={unreadCount} size="small" color="error" />
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Card>

        {/* Notifications List */}
        <Box>
          {loading ? (
            // Loading Skeletons
            Array.from(new Array(5)).map((_, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" gap={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="80%" height={24} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="60%" height={20} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : Array.isArray(notifications) && notifications.length > 0 ? (
            notifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  sx={{ 
                    mb: 2,
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    border: !notification.read ? '1px solid' : 'none',
                    borderColor: !notification.read ? 'primary.main' : 'transparent',
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" gap={2} flex={1}>
                        <Box sx={{ mt: 0.5 }}>
                          {getNotificationIcon(notification.type)}
                        </Box>
                        
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight={notification.read ? 'normal' : 'bold'}
                            >
                              {notification.title}
                            </Typography>
                            <Chip 
                              label={notification.type} 
                              size="small" 
                              color={getNotificationColor(notification.type)}
                              variant="outlined"
                            />
                            {!notification.read && (
                              <Chip label="New" size="small" color="error" />
                            )}
                          </Box>
                          
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 2 }}
                          >
                            {notification.message}
                          </Typography>
                          
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <IconButton 
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedNotification(notification);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <NotificationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up! New notifications will appear here.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {selectedNotification?.read ? (
            <MenuItem onClick={() => {
              handleMarkAsUnread(selectedNotification._id);
              setAnchorEl(null);
            }}>
              <MarkEmailUnread sx={{ mr: 1 }} /> Mark as Unread
            </MenuItem>
          ) : (
            <MenuItem onClick={() => {
              handleMarkAsRead(selectedNotification._id);
              setAnchorEl(null);
            }}>
              <MarkEmailRead sx={{ mr: 1 }} /> Mark as Read
            </MenuItem>
          )}
          <MenuItem onClick={() => handleDelete(selectedNotification._id)}>
            <Delete sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Settings Dialog */}
        <Dialog 
          open={settingsOpen} 
          onClose={() => setSettingsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogContent>
            <Box py={2}>
              <Typography variant="h6" gutterBottom>
                Delivery Preferences
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Email Notifications"
                sx={{ display: 'block', mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  />
                }
                label="Push Notifications"
                sx={{ display: 'block', mb: 3 }}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Content Preferences
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.eventReminders}
                    onChange={(e) => handleSettingChange('eventReminders', e.target.checked)}
                  />
                }
                label="Event Reminders"
                sx={{ display: 'block', mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.forumUpdates}
                    onChange={(e) => handleSettingChange('forumUpdates', e.target.checked)}
                  />
                }
                label="Forum Updates"
                sx={{ display: 'block', mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.resourceUpdates}
                    onChange={(e) => handleSettingChange('resourceUpdates', e.target.checked)}
                  />
                }
                label="Resource Updates"
                sx={{ display: 'block', mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.adminAnnouncements}
                    onChange={(e) => handleSettingChange('adminAnnouncements', e.target.checked)}
                  />
                }
                label="Admin Announcements"
                sx={{ display: 'block' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default Notifications;
