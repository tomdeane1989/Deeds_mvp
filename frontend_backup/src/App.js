import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Project from './components/Project';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state

  // Check if the user is authenticated by verifying the JWT token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify the token with the backend
      axios.get('http://localhost:5001/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          if (response.data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token'); // Remove invalid token
            setIsAuthenticated(false);
          }
        })
        .catch(error => {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token'); // Remove token on error
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false); // Remove the loading state after the request is done
        });
    } else {
      setLoading(false); // No token present, stop loading
    }
  }, []);

  // Protect the project route
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>; // Show loading indicator while checking token
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

export default App;