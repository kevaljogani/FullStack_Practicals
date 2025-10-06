import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Event,
  Bookmark,
  Settings,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, uploadProfilePicture, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    course: user?.profile?.course || '',
    department: user?.profile?.department || '',
    year: user?.profile?.year || 1,
    bio: user?.profile?.bio || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async () => {
    setLoading(true);
    const result = await updateProfile(profileData);
    if (result.success) {
      setEditing(false);
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setLoading(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      await uploadProfilePicture(file);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box position="relative" display="inline-block">
                  <Avatar
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                    src={user?.profile?.profilePicture}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="profile-image-upload">
                    <Button
                      component="span"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: -8,
                        minWidth: 'auto',
                        borderRadius: '50%',
                        p: 1,
                      }}
                      variant="contained"
                      disabled={loading}
                    >
                      <PhotoCamera fontSize="small" />
                    </Button>
                  </label>
                </Box>

                <Typography variant="h6" fontWeight="bold">
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.profile?.department} • {user?.profile?.course}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Year {user?.profile?.year}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Event fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Events Joined"
                      secondary={user?.joinedEvents?.length || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Bookmark fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Bookmarked Resources"
                      secondary={user?.bookmarkedResources?.length || 0}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Profile Information
                  </Typography>
                  <Box>
                    <Button
                      startIcon={<Lock />}
                      onClick={() => setPasswordDialog(true)}
                      sx={{ mr: 1 }}
                    >
                      Change Password
                    </Button>
                    <Button
                      startIcon={<Edit />}
                      variant={editing ? "outlined" : "contained"}
                      onClick={() => editing ? setEditing(false) : setEditing(true)}
                    >
                      {editing ? 'Cancel' : 'Edit'}
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Course"
                      value={profileData.course}
                      onChange={(e) => setProfileData({ ...profileData, course: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Academic Year"
                      type="number"
                      value={profileData.year}
                      onChange={(e) => setProfileData({ ...profileData, year: parseInt(e.target.value) })}
                      disabled={!editing}
                      inputProps={{ min: 1, max: 4 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!editing}
                      placeholder="Tell us about yourself..."
                    />
                  </Grid>
                </Grid>

                {editing && (
                  <Box mt={3} display="flex" gap={2}>
                    <Button
                      variant="contained"
                      onClick={handleProfileUpdate}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Change Password Dialog */}
        <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box pt={1}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
            <Button 
              onClick={handlePasswordChange} 
              variant="contained"
              disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
            >
              Change Password
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default Profile;
