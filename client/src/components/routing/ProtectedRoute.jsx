import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Show nothing while auth state is loading
  if (loading) {
    return null; 
  }

  if (!user) {
    // If not loading and no user, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If not loading and there is a user, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
    