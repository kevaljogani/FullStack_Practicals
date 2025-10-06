import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';
import { Visibility, VisibilityOff, School, Person, AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  // Basic form data - always required
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '', // No default role - user must select
  });

  // Student-specific fields
  const [studentData, setStudentData] = useState({
    studentId: '',
    course: '',
    year: '',
    department: '',
    phone: '',
    dateOfBirth: ''
  });

  // Admin-specific fields
  const [adminData, setAdminData] = useState({
    employeeId: '',
    designation: '',
    department: '',
    phone: '',
    officeLocation: '',
    permissions: []
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Business Administration',
    'Commerce',
    'Arts and Sciences',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Other',
  ];

  // Course options for students
  const courses = [
    'B.Tech',
    'M.Tech',
    'BCA',
    'MCA',
    'BBA',
    'MBA',
    'B.Com',
    'M.Com',
    'BA',
    'MA',
    'BSc',
    'MSc',
    'PhD',
    'Diploma'
  ];

  // Year options for students
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

  // Admin designation options
  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Head of Department',
    'Dean',
    'Director',
    'Principal',
    'Vice Principal',
    'Administrative Officer',
    'Registrar',
    'Deputy Registrar',
    'Librarian',
    'Lab Assistant',
    'Technical Staff'
  ];

  // Admin permission options
  const permissionOptions = [
    'Event Management',
    'User Management',
    'Content Moderation',
    'Resource Management',
    'Forum Management',
    'System Settings',
    'Academic Records',
    'Library Management'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleStudentChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleAdminChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handlePermissionChange = (e) => {
    const { value } = e.target;
    setAdminData({
      ...adminData,
      permissions: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required basic information');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Role-specific validation
    if (formData.role === 'student') {
      if (!studentData.studentId || !studentData.course || !studentData.year || !studentData.department) {
        setError('Please fill in all required student information');
        setLoading(false);
        return;
      }
    }

    if (formData.role === 'admin') {
      if (!adminData.employeeId || !adminData.designation || !adminData.department) {
        setError('Please fill in all required admin information');
        setLoading(false);
        return;
      }
    }

    // Combine form data based on role
    const { confirmPassword, ...basicData } = formData;
    const registrationData = {
      ...basicData,
      ...(formData.role === 'student' ? studentData : adminData)
    };
    
    const result = await register(registrationData);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const renderStudentFields = () => (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Person sx={{ color: 'primary.main', mr: 1 }} />
        <Typography variant="h6" color="primary">
          Student Information
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="studentId"
            label="Student ID"
            value={studentData.studentId}
            onChange={handleStudentChange}
            disabled={loading}
            placeholder="e.g., CS2024001"
            helperText="Enter your official student ID"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            name="course"
            label="Course/Program"
            value={studentData.course}
            onChange={handleStudentChange}
            disabled={loading}
          >
            {courses.map((course) => (
              <MenuItem key={course} value={course}>
                {course}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            name="year"
            label="Academic Year"
            value={studentData.year}
            onChange={handleStudentChange}
            disabled={loading}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            name="department"
            label="Department"
            value={studentData.department}
            onChange={handleStudentChange}
            disabled={loading}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="phone"
            label="Phone Number"
            value={studentData.phone}
            onChange={handleStudentChange}
            disabled={loading}
            placeholder="e.g., +91 9876543210"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={studentData.dateOfBirth}
            onChange={handleStudentChange}
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderAdminFields = () => (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AdminPanelSettings sx={{ color: 'primary.main', mr: 1 }} />
        <Typography variant="h6" color="primary">
          Administrator Information
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="employeeId"
            label="Employee ID"
            value={adminData.employeeId}
            onChange={handleAdminChange}
            disabled={loading}
            placeholder="e.g., EMP2024001"
            helperText="Enter your official employee ID"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            name="designation"
            label="Designation"
            value={adminData.designation}
            onChange={handleAdminChange}
            disabled={loading}
          >
            {designations.map((designation) => (
              <MenuItem key={designation} value={designation}>
                {designation}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            name="department"
            label="Department"
            value={adminData.department}
            onChange={handleAdminChange}
            disabled={loading}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="phone"
            label="Phone Number"
            value={adminData.phone}
            onChange={handleAdminChange}
            disabled={loading}
            placeholder="e.g., +91 9876543210"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="officeLocation"
            label="Office Location"
            value={adminData.officeLocation}
            onChange={handleAdminChange}
            disabled={loading}
            placeholder="e.g., Room 201, Admin Block"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Permissions (Optional)</InputLabel>
            <Select
              multiple
              name="permissions"
              value={adminData.permissions}
              onChange={handlePermissionChange}
              label="Permissions (Optional)"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {permissionOptions.map((permission) => (
                <MenuItem key={permission} value={permission}>
                  {permission}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <School sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography component="h1" variant="h4" fontWeight="bold">
                Join CampusConnect
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Create your account with role-specific information to connect with your campus community
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Basic Information - Always Required */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    type="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    select
                    id="role"
                    label="I am a..."
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Select your role to show relevant fields"
                  >
                    <MenuItem value="">
                      <em>Select your role</em>
                    </MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="admin">Administrator/Faculty</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Minimum 6 characters"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => togglePasswordVisibility('password')}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Role-specific fields */}
              {formData.role === 'student' && renderStudentFields()}
              {formData.role === 'admin' && renderAdminFields()}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 4, mb: 2 }}
                disabled={loading || !formData.role}
                size="large"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
              
              <Box textAlign="center">
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign In
                </Link>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Register;
