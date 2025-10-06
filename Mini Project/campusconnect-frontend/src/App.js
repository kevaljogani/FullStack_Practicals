import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import Events from './pages/Events/Events';
import EventDetail from './pages/Events/EventDetail';
import CreateEvent from './pages/Events/CreateEvent';
import Forum from './pages/Forum/Forum';
import ForumPost from './pages/Forum/ForumPost';
import CreatePost from './pages/Forum/CreatePost';
import Resources from './pages/Resources/Resources';
import ResourceDetail from './pages/Resources/ResourceDetail';
import UploadResource from './pages/Resources/UploadResource';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import MyEvents from './pages/MyEvents';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

// Public Route Component (redirect to home if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return !user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Events */}
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="my-events" element={<MyEvents />} />
          
          {/* Forum */}
          <Route path="forum" element={<Forum />} />
          <Route path="forum/:id" element={<ForumPost />} />
          <Route path="forum/create" element={<CreatePost />} />
          
          {/* Resources */}
          <Route path="resources" element={<Resources />} />
          <Route path="resources/:id" element={<ResourceDetail />} />
          <Route path="resources/upload" element={<UploadResource />} />
          
          {/* Notifications */}
          <Route path="notifications" element={<Notifications />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
