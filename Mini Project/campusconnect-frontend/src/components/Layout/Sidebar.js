import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Home,
  Event,
  EventNote,
  Forum,
  FolderShared,
  Notifications,
  AdminPanelSettings,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Events', icon: <Event />, path: '/events' },
    { text: 'My Events', icon: <EventNote />, path: '/my-events' },
    { text: 'Forum', icon: <Forum />, path: '/forum' },
    { text: 'Resources', icon: <FolderShared />, path: '/resources' },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  // Add admin item if user is admin
  if (user?.role === 'admin') {
    menuItems.push({
      text: 'Admin Panel',
      icon: <AdminPanelSettings />,
      path: '/admin'
    });
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          CampusConnect
        </Typography>
      </Toolbar>
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* User Info */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          Welcome back,
        </Typography>
        <Typography variant="subtitle2" fontWeight="bold">
          {user?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.profile?.department} - {user?.profile?.course}
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
