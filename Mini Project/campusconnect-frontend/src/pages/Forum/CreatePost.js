import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  Chip,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import {
  Title,
  Description,
  Category,
  Tag,
  ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'technical', label: 'Technical' },
    { value: 'career', label: 'Career' },
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'events', label: 'Events' },
    { value: 'help', label: 'Help & Support' },
    { value: 'general', label: 'General Discussion' },
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 20) {
      newErrors.content = 'Content must be at least 20 characters long';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/forum', {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
      });

      toast.success('Post created successfully!');
      navigate(`/forum/${response.data._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.response?.data?.errors?.[0]?.msg || 
                    'Failed to create post';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/forum')}
            sx={{ mb: 2 }}
          >
            Back to Forum
          </Button>
          
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Create New Post
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Share your thoughts, ask questions, or start a discussion with the community
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
              <Grid container spacing={3}>
                {/* Title */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Post Title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter a descriptive title for your post"
                    error={!!errors.title}
                    helperText={errors.title || `${formData.title.length}/100 characters`}
                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Title />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Category */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    error={!!errors.category}
                    helperText={errors.category}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Category />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {categories.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Tags Input */}
                <Grid item xs={12} sm={6}>
                  <Box>
                    <TextField
                      fullWidth
                      label="Add Tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter a tag and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      disabled={formData.tags.length >= 5}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Tag />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <Button
                            onClick={handleAddTag}
                            disabled={!tagInput.trim() || formData.tags.length >= 5}
                            size="small"
                          >
                            Add
                          </Button>
                        ),
                      }}
                    />
                    <FormHelperText>
                      {formData.tags.length}/5 tags (optional)
                    </FormHelperText>
                  </Box>
                </Grid>

                {/* Tags Display */}
                {formData.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Content */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={8}
                    label="Post Content"
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Write your post content here... 

You can:
• Ask questions
• Share knowledge
• Start discussions
• Provide helpful tips
• Share experiences

Be respectful and constructive in your posts."
                    error={!!errors.content}
                    helperText={
                      errors.content || 
                      `${formData.content.length} characters (minimum 20 required)`
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <Description />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Guidelines */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Community Guidelines:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Be respectful and constructive
                        • Use clear and descriptive titles
                        • Choose the appropriate category
                        • Use relevant tags to help others find your post
                        • Follow academic integrity policies
                        • No spam, harassment, or inappropriate content
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Submit Buttons */}
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/forum')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || !formData.title.trim() || !formData.content.trim()}
                      size="large"
                    >
                      {loading ? 'Publishing...' : 'Publish Post'}
                    </Button>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Tip: Press Ctrl+Enter to submit
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default CreatePost;
