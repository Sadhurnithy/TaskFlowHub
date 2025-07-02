import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/profile`);
          setUser(response.data.data);
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credential) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        return { success: false, error: data.message || "Auth failed" };
      }
  
      // ✅ Save token in localStorage
      localStorage.setItem('token', data.token);
  
      // ✅ Set axios default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  
      // ✅ Set user in context
      setUser(data.user);
  
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };
  

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh`);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      logout();
      return { success: false };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, profileData);
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      return { success: false, error: error.response?.data?.message || 'Profile update failed' };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    updateProfile,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { API_URL };