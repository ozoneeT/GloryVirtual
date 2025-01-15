import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check admin status from user metadata
      setIsAdmin(user.user_metadata?.role === 'admin');
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/explore" />;
}; 