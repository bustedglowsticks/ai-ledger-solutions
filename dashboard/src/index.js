/*
 * QUANTUM YIELD NEXUS DASHBOARD - MAIN ENTRY POINT
 * Ultra-professional React app with 3D heat maps, live ledger flows, and AI overlays
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import AdminDashboard from './components/AdminDashboard';
import PublicDashboard from './components/PublicDashboard';
import YieldVoteDAO from './components/YieldVoteDAO';
import DecentralizedYieldGovernanceNexus from './components/DecentralizedYieldGovernanceNexus';
import Login from './components/Login';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/public" element={<PublicDashboard />} />
            <Route path="/dao" element={<YieldVoteDAO />} />
        <Route path="/nexus-dao" element={<DecentralizedYieldGovernanceNexus />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
