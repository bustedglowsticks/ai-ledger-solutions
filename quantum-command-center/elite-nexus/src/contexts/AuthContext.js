import React, { createContext, useContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

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
  const [godMode, setGodMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          setGodMode(decoded.role === 'master');
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Demo login logic - replace with actual API call
      if (email === 'master@quantumbot.com' && password === 'master123') {
        const mockToken = {
          id: 'master-001',
          email: 'master@quantumbot.com',
          role: 'master',
          name: 'Master Admin',
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        };
        
        const tokenString = btoa(JSON.stringify(mockToken));
        localStorage.setItem('token', tokenString);
        setUser(mockToken);
        setGodMode(true);
        return { success: true, role: 'master' };
      } else if (email === 'admin@quantumbot.com' && password === 'admin123') {
        const mockToken = {
          id: 'admin-001',
          email: 'admin@quantumbot.com',
          role: 'admin',
          name: 'Admin User',
          referralId: 'ref-001',
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        };
        
        const tokenString = btoa(JSON.stringify(mockToken));
        localStorage.setItem('token', tokenString);
        setUser(mockToken);
        setGodMode(false);
        return { success: true, role: 'admin' };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setGodMode(false);
  };

  const toggleGodMode = () => {
    if (user?.role === 'master') {
      setGodMode(!godMode);
    }
  };

  const value = {
    user,
    loading,
    godMode,
    login,
    logout,
    toggleGodMode,
    isAuthenticated: !!user,
    isMaster: user?.role === 'master',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
