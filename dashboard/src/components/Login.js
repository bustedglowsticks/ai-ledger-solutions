/*
 * QUANTUM YIELD NEXUS DASHBOARD - LOGIN COMPONENT
 * Secure JWT authentication with role-based access control
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User, Eye, EyeOff, Zap } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const demoCredentials = [
    {
      role: 'Admin',
      email: 'admin@nexus.com',
      password: 'nexus2025',
      description: 'Full access to all features'
    },
    {
      role: 'User',
      email: 'user@nexus.com',
      password: 'user2025',
      description: 'Public dashboard access'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexus-dark via-gray-900 to-nexus-gray">
        <div className="nexus-loading"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexus-dark via-gray-900 to-nexus-gray matrix-bg">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="nexus-card p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-nexus-gradient rounded-full mb-4"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-tech font-bold text-nexus-green mb-2">
              NEXUS ACCESS
            </h1>
            <p className="text-gray-400">
              Secure authentication for Quantum Yield Dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-tech text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="nexus-input w-full pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-tech text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="nexus-input w-full pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="nexus-button w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="nexus-loading"></div>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>ACCESS NEXUS</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-nexus-blue/30">
            <h3 className="text-sm font-tech font-bold text-gray-300 mb-3">
              Demo Credentials
            </h3>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-nexus-gray/30 rounded-lg p-3 cursor-pointer hover:bg-nexus-gray/50 transition-colors"
                  onClick={() => {
                    setFormData({
                      email: cred.email,
                      password: cred.password
                    });
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-tech font-bold text-nexus-green text-sm">
                        {cred.role}
                      </div>
                      <div className="text-xs text-gray-400">
                        {cred.email}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Click to use
                    </div>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {cred.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              🔒 Secured with JWT authentication • Multi-chain entangled • AI-protected
            </p>
          </div>
        </motion.div>

        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-nexus-blue/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-nexus-green/10 rounded-full blur-xl animate-pulse-slow"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-nexus-purple/10 rounded-full blur-xl animate-bounce-slow"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
