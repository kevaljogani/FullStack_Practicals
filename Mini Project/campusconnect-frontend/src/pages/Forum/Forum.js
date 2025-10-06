import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Tabs,
  Tab,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Skeleton,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Category,
  Forum as ForumIcon,
  TrendingUp,
  Schedule,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Forum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'technical', label: 'Technical' },
    { value: 'career', label: 'Career' },
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'events', label: 'Events' },
    { value: 'help', label: 'Help & Support' },
    { value: 'general', label: 'General Discussion' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'replies', label: 'Most Replies' },
  ];

  const tabs = [
    { label: 'All Posts', value: 'all' },
    { label: 'My Posts', value: 'my' },
    { label: 'Following', value: 'following' },
    { label: 'Trending', value: 'trending' },
  ];

  useEffect(() => {
    fetchPosts();
  }, [page, activeTab, searchTerm, categoryFilter, sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        category: categoryFilter,
        sort: sortBy,
        filter: tabs[activeTab].value,
      };

      const response = await axios.get('/api/forum', { params });
      setPosts(response.data.posts);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
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

  const getPostStats = (post) => {
    return {
      replies: post.replies?.length || 0,
      likes: post.likes?.length || 0,
      views: post.views || 0,
    };
  };

  const PostCard = ({ post }) => {
    const stats = getPostStats(post);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
      >
        <Card 
          sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
          onClick={() => navigate(`/forum/${post._id}`)}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box flex={1}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {post.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.content}
                </Typography>
              </Box>
              <Box ml={2}>
                <Chip 
                  label={post.category} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="caption" color="text.secondary">
                By {post.author?.name || 'Anonymous'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.createdAt)}
              </Typography>
            </Box>

            {post.tags && post.tags.length > 0 && (
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
                {post.tags.length > 3 && (
                  <Chip label={`+${post.tags.length - 3} more`} size="small" variant="outlined" />
                )}
              </Box>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={3}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ForumIcon fontSize="small" color="action" />
                  <Typography variant="caption">{stats.replies} replies</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp fontSize="small" color="action" />
                  <Typography variant="caption">{stats.likes} likes</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stats.views} views
                </Typography>
              </Box>
              
              {post.isPinned && (
                <Chip label="Pinned" size="small" color="warning" />
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const PostSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Skeleton variant="text" width="80%" height={32} />
        <Skeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="60%" height={20} />
        <Box display="flex" gap={1} mt={2}>
          <Skeleton variant="rectangular" width={60} height={24} />
          <Skeleton variant="rectangular" width={80} height={24} />
        </Box>
      </CardContent>
    </Card>
  );

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
              Community Forum
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Connect, discuss, and share knowledge with your campus community
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/forum/create')}
            size="large"
          >
            New Post
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Filters Sidebar */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <FilterList sx={{ mr: 1 }} />
                  Filters
                </Typography>
                
                {/* Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                {/* Category Filter */}
                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Category />
                      </InputAdornment>
                    }
                  >
                    {categories.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Sort By */}
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Schedule />
                      </InputAdornment>
                    }
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            {/* Tabs */}
            <Card sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                {tabs.map((tab, index) => (
                  <Tab key={index} label={tab.label} />
                ))}
              </Tabs>
            </Card>

            {/* Posts List */}
            <Box>
              {loading ? (
                // Loading Skeletons
                Array.from(new Array(5)).map((_, index) => (
                  <PostSkeleton key={index} />
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))
              ) : (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <ForumIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No posts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      {searchTerm || categoryFilter
                        ? 'Try adjusting your filters or search terms'
                        : 'Be the first to start a discussion!'
                      }
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/forum/create')}
                    >
                      Create Post
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Forum;
