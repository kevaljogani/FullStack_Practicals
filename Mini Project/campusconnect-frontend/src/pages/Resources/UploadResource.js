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
  LinearProgress,
  Alert,
  FormHelperText,
} from '@mui/material';
import {
  CloudUpload,
  Title,
  Description,
  Category,
  Tag,
  ArrowBack,
  AttachFile,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const UploadResource = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
  });
  const [file, setFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const categories = [
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

  const acceptedFileTypes = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/avi': '.avi',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
  };

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!Object.keys(acceptedFileTypes).includes(selectedFile.type)) {
        setErrors({ ...errors, file: 'File type not supported' });
        return;
      }

      // Validate file size
      if (selectedFile.size > maxFileSize) {
        setErrors({ ...errors, file: 'File size must be less than 50MB' });
        return;
      }

      setFile(selectedFile);
      setErrors({ ...errors, file: '' });

      // Auto-fill title if not provided
      if (!formData.title) {
        const fileName = selectedFile.name.split('.')[0];
        setFormData({ ...formData, title: fileName });
      }
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
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
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!file) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      uploadData.append('category', formData.category);
      uploadData.append('tags', JSON.stringify(formData.tags));

      const response = await axios.post('/api/resources/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      toast.success('Resource uploaded successfully!');
      navigate(`/resources/${response.data._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 
                    error.response?.data?.errors?.[0]?.msg || 
                    'Failed to upload resource';
      toast.error(message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
            onClick={() => navigate('/resources')}
            sx={{ mb: 2 }}
          >
            Back to Resources
          </Button>
          
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Upload Resource
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Share educational materials with your campus community
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* File Upload */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: errors.file ? 'error.main' : 'grey.300',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'grey.50',
                      },
                    }}
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept={Object.values(acceptedFileTypes).join(',')}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    
                    <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    
                    {file ? (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {file.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Click to select a file
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Supported formats: PDF, DOC, PPT, XLS, Images, Videos, Archives
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Maximum file size: 50MB
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {errors.file && (
                    <FormHelperText error>{errors.file}</FormHelperText>
                  )}
                </Grid>

                {/* Upload Progress */}
                {loading && (
                  <Grid item xs={12}>
                    <Box sx={{ width: '100%' }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Uploading...</Typography>
                        <Typography variant="body2">{uploadProgress}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Grid>
                )}

                {/* Title */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Resource Title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter a descriptive title for your resource"
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

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe what this resource contains and how it can be helpful..."
                    error={!!errors.description}
                    helperText={errors.description}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <Description />
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
                      disabled={formData.tags.length >= 10}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Tag />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <Button
                            onClick={handleAddTag}
                            disabled={!tagInput.trim() || formData.tags.length >= 10}
                            size="small"
                          >
                            Add
                          </Button>
                        ),
                      }}
                    />
                    <FormHelperText>
                      {formData.tags.length}/10 tags (optional)
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

                {/* Guidelines */}
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="subtitle2" gutterBottom>
                      Upload Guidelines:
                    </Typography>
                    <Typography variant="body2">
                      • Ensure you have the right to share this content
                      • Use descriptive titles and detailed descriptions
                      • Choose appropriate categories and tags
                      • Respect copyright and academic integrity policies
                      • Maximum file size: 50MB
                    </Typography>
                  </Alert>
                </Grid>

                {/* Submit Buttons */}
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/resources')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || !file || !formData.title.trim() || !formData.description.trim()}
                      size="large"
                      startIcon={<CloudUpload />}
                    >
                      {loading ? 'Uploading...' : 'Upload Resource'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default UploadResource;
