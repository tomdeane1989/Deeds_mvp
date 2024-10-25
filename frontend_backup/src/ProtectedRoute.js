import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ element: Component }) {
  // Check if the JWT token exists in local storage
  const token = localStorage.getItem('token');

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Otherwise, render the protected component
  return <Component />;
}

export default ProtectedRoute;