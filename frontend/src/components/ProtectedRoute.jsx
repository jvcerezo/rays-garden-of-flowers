import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component checks if a user is logged in.
// If they are, it renders the component that was passed to it (the "children").
// If not, it redirects them to the /login page.
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  // User is logged in, show the child component (e.g., Dashboard)
  return children;
}

export default ProtectedRoute;
