import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, accessToken } = useAuth();
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
