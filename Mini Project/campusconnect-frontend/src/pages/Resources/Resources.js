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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Avatar,
  IconButton,
  Pagination,
  Skeleton,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Category,
  Description,
  Download,
  Favorite,
  FavoriteBorder,
  Share,
  Person,
  Schedule,
  CloudDownload,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Resources = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'research', label: 'Research' },
    { value: 'textbooks', label: 'Textbooks' },
    { value: 'notes', label: 'Study Notes' },
    { value: 'assignments', label: 'Assignments' },
    { value: 'presentations', label: 'Presentations' },
    { value: 'software', label: 'Software' },
    { value: 'templates', label: 'Templates' },
    { value: 'other', label: 'Other' },
  ];

  const types = [
    { value: '', label: 'All Types' },
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'doc', label: 'Word Documents' },
    { value: 'ppt', label: 'Presentations' },
    { value: 'excel', label: 'Spreadsheets' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'archive', label: 'Archives' },
    { value: 'code', label: 'Code Files' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'downloads', label: 'Most Downloaded' },
  ];

  useEffect(() => {
    fetchResources();
  }, [page, searchTerm, categoryFilter, typeFilter, sortBy]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: searchTerm,
        category: categoryFilter,
        type: typeFilter,
        sort: sortBy,
      };

      const response = await axios.get('/api/resources', { params });
      setResources(response.data.resources);
      setTotalPages(Math.ceil(response.data.total / 12));
    } catch (error) {
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleLike = async (resourceId) => {
    try {
      await axios.post(`/api/resources/${resourceId}/like`);
      fetchResources(); // Refresh to get updated like count
    } catch (error) {
      toast.error('Failed to like resource');
    }
  };

  const handleDownload = async (resourceId, filename) => {
    try {
      const response = await axios.get(`/api/resources/${resourceId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download resource');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const ResourceCard = ({ resource }) => {
    const isLiked = resource.likes?.includes(user?._id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
      >
        <Card 
          sx={{ 
            height: '100%',
            cursor: 'pointer',
            '&:hover': { boxShadow: 4 }
          }}
          onClick={() => navigate(`/resources/${resource._id}`)}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h4">{getFileIcon(resource.fileType)}</Typography>
                <Box>
                  <Chip 
                    label={resource.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              </Box>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(resource._id);
                }}
                color={isLiked ? "error" : "default"}
              >
                {isLiked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Box>

            <Typography 
              variant="h6" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {resource.title}
            </Typography>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 2,
              }}
            >
              {resource.description}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Avatar src={resource.uploader?.profilePicture} sx={{ width: 24, height: 24 }}>
                {resource.uploader?.name?.[0]}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {resource.uploader?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • {formatDate(resource.createdAt)}
              </Typography>
            </Box>

            {resource.tags && resource.tags.length > 0 && (
              <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
                {resource.tags.slice(0, 3).map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
                {resource.tags.length > 3 && (
                  <Chip label={`+${resource.tags.length - 3}`} size="small" variant="outlined" />
                )}
              </Box>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Rating value={resource.averageRating || 0} precision={0.5} size="small" readOnly />
                <Typography variant="caption">
                  ({resource.ratings?.length || 0})
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(resource.fileSize)}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CloudDownload fontSize="small" color="action" />
                  <Typography variant="caption">{resource.downloads || 0}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Favorite fontSize="small" color="action" />
                  <Typography variant="caption">{resource.likes?.length || 0}</Typography>
                </Box>
              </Box>
              
              <Button
                size="small"
                startIcon={<Download />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(resource._id, resource.filename);
                }}
              >
                Download
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const ResourceSkeleton = () => (
    <Card>
      <CardContent>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
        <Box display="flex" gap={1} mb={2}>
          <Skeleton variant="rectangular" width={60} height={24} />
          <Skeleton variant="rectangular" width={80} height={24} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={36} />
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
              Learning Resources
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover and share educational materials with your campus community
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/resources/upload')}
            size="large"
          >
            Upload Resource
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
                  placeholder="Search resources..."
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

                {/* Type Filter */}
                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <InputLabel>File Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    }
                  >
                    {types.map((option) => (
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
            <Grid container spacing={3}>
              {loading ? (
                // Loading Skeletons
                Array.from(new Array(8)).map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <ResourceSkeleton />
                  </Grid>
                ))
              ) : resources.length > 0 ? (
                resources.map((resource) => (
                  <Grid item xs={12} sm={6} md={4} key={resource._id}>
                    <ResourceCard resource={resource} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                      <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No resources found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        {searchTerm || categoryFilter || typeFilter
                          ? 'Try adjusting your filters or search terms'
                          : 'Be the first to share a learning resource!'
                        }
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/resources/upload')}
                      >
                        Upload Resource
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

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
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Resources;
