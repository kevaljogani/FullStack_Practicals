import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Divider,
  TextField,
  Rating,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Favorite,
  FavoriteBorder,
  Share,
  MoreVert,
  Edit,
  Delete,
  Report,
  CloudDownload,
  Visibility,
  Comment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resource, setResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchResource();
    fetchComments();
  }, [id]);

  const fetchResource = async () => {
    try {
      const response = await axios.get(`/api/resources/${id}`);
      setResource(response.data);
      
      // Set user's existing rating if any
      const existingRating = response.data.ratings?.find(r => r.user === user?._id);
      if (existingRating) {
        setUserRating(existingRating.rating);
      }
    } catch (error) {
      toast.error('Failed to fetch resource');
      navigate('/resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/resources/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/resources/${id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resource.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download resource');
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/resources/${id}/like`);
      setResource({ ...resource, likes: response.data.likes });
    } catch (error) {
      toast.error('Failed to like resource');
    }
  };

  const handleRating = async (newRating) => {
    try {
      const response = await axios.post(`/api/resources/${id}/rate`, {
        rating: newRating
      });
      setUserRating(newRating);
      setResource({ ...resource, ...response.data });
      toast.success('Rating submitted successfully');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await axios.post(`/api/resources/${id}/comments`, {
        content: commentText
      });
      setComments([...comments, response.data]);
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/resources/${id}`);
      toast.success('Resource deleted successfully');
      navigate('/resources');
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      ppt: '📊',
      excel: '📈',
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      archive: '📦',
      code: '💻',
    };
    return iconMap[fileType] || '📁';
  };

  const isOwner = resource?.uploader?._id === user?._id;
  const isLiked = resource?.likes?.includes(user?._id);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
        {Array.from(new Array(3)).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={100} sx={{ mb: 2 }} />
        ))}
      </Container>
    );
  }

  if (!resource) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6">Resource not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/resources')}
          sx={{ mb: 3 }}
        >
          Back to Resources
        </Button>

        {/* Main Resource Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h2">{getFileIcon(resource.fileType)}</Typography>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {resource.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Chip label={resource.category} color="primary" size="small" />
                    <Chip label={resource.fileType.toUpperCase()} variant="outlined" size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(resource.fileSize)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {isOwner && (
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
              )}
            </Box>

            {/* Author and Date */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar src={resource.uploader?.profilePicture} sx={{ width: 40, height: 40 }}>
                {resource.uploader?.name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {resource.uploader?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uploaded on {formatDate(resource.createdAt)}
                </Typography>
              </Box>
            </Box>

            {/* Description */}
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
              {resource.description}
            </Typography>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                {resource.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            )}

            <Divider sx={{ mb: 3 }} />

            {/* Stats */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <CloudDownload color="primary" />
                  <Typography variant="body2" fontWeight="bold">
                    {resource.downloads || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Downloads
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Favorite color="error" />
                  <Typography variant="body2" fontWeight="bold">
                    {resource.likes?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Likes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Visibility color="action" />
                  <Typography variant="body2" fontWeight="bold">
                    {resource.views || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Views
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Comment color="action" />
                  <Typography variant="body2" fontWeight="bold">
                    {comments.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Comments
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Rating */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Rate this Resource
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Rating
                  value={userRating}
                  onChange={(event, newValue) => handleRating(newValue)}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  Average: {resource.averageRating?.toFixed(1) || 0}/5 
                  ({resource.ratings?.length || 0} ratings)
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2} mb={3}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
                size="large"
              >
                Download
              </Button>
              <Button
                startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
                onClick={handleLike}
                color={isLiked ? "error" : "inherit"}
              >
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button startIcon={<Share />}>
                Share
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comments ({comments.length})
            </Typography>
            
            {/* Add Comment */}
            <Box mb={3}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleComment}
                disabled={!commentText.trim()}
              >
                Post Comment
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Comments List */}
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Box key={comment._id} mb={3}>
                  <Box display="flex" gap={2}>
                    <Avatar src={comment.author?.profilePicture} sx={{ width: 32, height: 32 }}>
                      {comment.author?.name?.[0]}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle2">{comment.author?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  </Box>
                  {comment._id !== comments[comments.length - 1]._id && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Owner Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => navigate(`/resources/${id}/edit`)}>
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => setDeleteDialogOpen(true)}>
            <Delete sx={{ mr: 1 }} /> Delete
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <Report sx={{ mr: 1 }} /> Report
          </MenuItem>
        </Menu>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Resource</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this resource? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default ResourceDetail;
