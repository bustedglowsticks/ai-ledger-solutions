/*
 * QUANTUM YIELD NEXUS DASHBOARD - AUTHENTICATION CONTEXT
 * JWT-based authentication with role-based access control
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

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
  const [token, setToken] = useState(localStorage.getItem('nexus_token'));

  useEffect(() => {
    if (token) {
      // Validate token and get user info
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async (authToken) => {
    try {
      // Simulate token validation
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      
      if (payload.exp * 1000 > Date.now()) {
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          permissions: payload.permissions || []
        });
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Simulate login API call
      if (email === 'admin@nexus.com' && password === 'nexus2025') {
        const mockToken = createMockToken({
          sub: '1',
          email: 'admin@nexus.com',
          role: 'admin',
          permissions: ['view_admin', 'manage_bots', 'view_commissions', 'export_data']
        });
        
        localStorage.setItem('nexus_token', mockToken);
        setToken(mockToken);
        return { success: true };
      } else if (email === 'user@nexus.com' && password === 'user2025') {
        const mockToken = createMockToken({
          sub: '2',
          email: 'user@nexus.com',
          role: 'user',
          permissions: ['view_public']
        });
        
        localStorage.setItem('nexus_token', mockToken);
        setToken(mockToken);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    setToken(null);
    setUser(null);
  };

  const createMockToken = (payload) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${body}.${signature}`;
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    login,
    logout,
    loading,
    hasPermission,
    isAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
