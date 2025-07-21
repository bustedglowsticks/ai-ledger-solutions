import React, { useState, useEffect } from 'react';
import EliteCommandNexus from './components/EliteCommandNexus';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Mock authentication - in production, this would connect to your backend
  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('eliteNexusUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    // Mock login validation
    const mockUsers = {
      'admin@nexus.com': { 
        name: 'Admin User', 
        role: 'admin', 
        email: 'admin@nexus.com',
        password: 'nexus2025' 
      },
      'master@nexus.com': { 
        name: 'Master Admin', 
        role: 'master', 
        email: 'master@nexus.com',
        password: 'master2025' 
      }
    };

    const mockUser = mockUsers[loginForm.email];
    if (mockUser && mockUser.password === loginForm.password) {
      const userSession = {
        name: mockUser.name,
        role: mockUser.role,
        email: mockUser.email
      };
      setUser(userSession);
      localStorage.setItem('eliteNexusUser', JSON.stringify(userSession));
    } else {
      setLoginError('Invalid credentials. Try admin@nexus.com / nexus2025 or master@nexus.com / master2025');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eliteNexusUser');
    setLoginForm({ email: '', password: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 to-apple-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-apple-blue-500 to-apple-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-apple-gray-600">Loading Elite Nexus...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 to-apple-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-apple-blue-500 to-apple-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-apple-gray-900 mb-2">
              Elite Yield Command Nexus
            </h1>
            <p className="text-apple-gray-600">Ultra-professional XRPL bot management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent"
                placeholder="admin@nexus.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent"
                placeholder="nexus2025"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-apple-blue-500 to-apple-blue-600 text-white py-3 px-4 rounded-lg hover:from-apple-blue-600 hover:to-apple-blue-700 transition-colors font-medium"
            >
              Access Command Nexus
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-apple-gray-200">
            <div className="text-center">
              <p className="text-xs text-apple-gray-500 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs">
                <p className="text-apple-gray-600">Admin: admin@nexus.com / nexus2025</p>
                <p className="text-apple-gray-600">Master: master@nexus.com / master2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <EliteCommandNexus user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;
