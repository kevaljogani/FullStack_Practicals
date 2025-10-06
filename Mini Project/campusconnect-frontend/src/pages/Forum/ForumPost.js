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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Reply,
  MoreVert,
  Edit,
  Delete,
  Report,
  Share,
  BookmarkBorder,
  Bookmark,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForumPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReply, setSelectedReply] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchPost();
    fetchReplies();
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.emit('join-forum-post', id);
      
      socket.on('new-reply', (reply) => {
        setReplies(prev => [...prev, reply]);
      });

      socket.on('reply-updated', (updatedReply) => {
        setReplies(prev => prev.map(reply => 
          reply._id === updatedReply._id ? updatedReply : reply
        ));
      });

      socket.on('reply-deleted', (replyId) => {
        setReplies(prev => prev.filter(reply => reply._id !== replyId));
      });

      return () => {
        socket.emit('leave-forum-post', id);
        socket.off('new-reply');
        socket.off('reply-updated');
        socket.off('reply-deleted');
      };
    }
  }, [socket, id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/forum/${id}`);
      setPost(response.data);
    } catch (error) {
      toast.error('Failed to fetch post');
      navigate('/forum');
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await axios.get(`/api/forum/${id}/replies`);
      setReplies(response.data);
    } catch (error) {
      toast.error('Failed to fetch replies');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`/api/forum/${id}/like`);
      setPost(response.data);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleBookmark = async () => {
    try {
      await axios.post(`/api/forum/${id}/bookmark`);
      toast.success('Post bookmarked');
    } catch (error) {
      toast.error('Failed to bookmark post');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      const response = await axios.post(`/api/forum/${id}/replies`, {
        content: replyText,
        parentReply: replyingTo?._id
      });
      
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply posted successfully');
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const handleEditPost = async () => {
    try {
      const response = await axios.put(`/api/forum/${id}`, {
        content: editText
      });
      setPost(response.data);
      setEditMode(false);
      toast.success('Post updated successfully');
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(`/api/forum/${id}`);
      toast.success('Post deleted successfully');
      navigate('/forum');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleReplyAction = (action, reply) => {
    setSelectedReply(reply);
    setAnchorEl(null);
    
    switch (action) {
      case 'edit':
        setEditText(reply.content);
        setEditMode(true);
        break;
      case 'delete':
        setDeleteDialogOpen(true);
        break;
      case 'reply':
        setReplyingTo(reply);
        break;
      default:
        break;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAuthor = (authorId) => user?._id === authorId;
  const isLiked = post?.likes?.includes(user?._id);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
        {Array.from(new Array(3)).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={100} sx={{ mb: 2 }} />
        ))}
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6">Post not found</Typography>
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
          onClick={() => navigate('/forum')}
          sx={{ mb: 3 }}
        >
          Back to Forum
        </Button>

        {/* Main Post */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box flex={1}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {post.title}
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar src={post.author?.profilePicture} sx={{ width: 32, height: 32 }}>
                    {post.author?.name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">{post.author?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(post.createdAt)}
                    </Typography>
                  </Box>
                  <Chip label={post.category} color="primary" size="small" />
                </Box>
              </Box>
              
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
            </Box>

            {editMode && isAuthor(post.author?._id) ? (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box display="flex" gap={1}>
                  <Button onClick={handleEditPost} variant="contained" size="small">
                    Save
                  </Button>
                  <Button 
                    onClick={() => setEditMode(false)} 
                    variant="outlined" 
                    size="small"
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
                {post.content}
              </Typography>
            )}

            {post.tags && post.tags.length > 0 && (
              <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                {post.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Post Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={1}>
                <Button
                  startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
                  onClick={handleLike}
                  color={isLiked ? "error" : "inherit"}
                >
                  {post.likes?.length || 0}
                </Button>
                <Button startIcon={<Reply />} onClick={() => setReplyingTo(null)}>
                  Reply
                </Button>
                <IconButton onClick={handleBookmark}>
                  <BookmarkBorder />
                </IconButton>
                <IconButton>
                  <Share />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {post.views || 0} views
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Reply Form */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {replyingTo && (
              <Box mb={2} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="caption" color="text.secondary">
                  Replying to {replyingTo.author?.name}:
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {replyingTo.content.substring(0, 100)}...
                </Typography>
                <Button size="small" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </Box>
            )}
            
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleReply}
              disabled={!replyText.trim()}
            >
              Post Reply
            </Button>
          </CardContent>
        </Card>

        {/* Replies */}
        <Typography variant="h6" gutterBottom>
          Replies ({replies.length})
        </Typography>
        
        {replies.map((reply) => (
          <motion.div
            key={reply._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card sx={{ mb: 2, ml: reply.parentReply ? 4 : 0 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" gap={2} flex={1}>
                    <Avatar src={reply.author?.profilePicture} sx={{ width: 32, height: 32 }}>
                      {reply.author?.name?.[0]}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle2">{reply.author?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(reply.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {reply.content}
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        <Button 
                          size="small" 
                          startIcon={<Reply />}
                          onClick={() => setReplyingTo(reply)}
                        >
                          Reply
                        </Button>
                        <Button size="small" startIcon={<FavoriteBorder />}>
                          {reply.likes?.length || 0}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  {isAuthor(reply.author?._id) && (
                    <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                      <MoreVert />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {isAuthor(post.author?._id) && [
            <MenuItem key="edit" onClick={() => handleReplyAction('edit', selectedReply)}>
              <Edit sx={{ mr: 1 }} /> Edit
            </MenuItem>,
            <MenuItem key="delete" onClick={() => handleReplyAction('delete', selectedReply)}>
              <Delete sx={{ mr: 1 }} /> Delete
            </MenuItem>
          ]}
          <MenuItem onClick={() => setAnchorEl(null)}>
            <Report sx={{ mr: 1 }} /> Report
          </MenuItem>
        </Menu>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Post</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeletePost} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default ForumPost;
