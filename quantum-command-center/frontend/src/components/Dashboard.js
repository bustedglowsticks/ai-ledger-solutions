/*
 * 🚀 QUANTUM BOT COMMAND CENTER - DASHBOARD
 * Ultra-professional Apple-inspired layout with TradingView heat maps
 */

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import axios from 'axios';
import BotHeatMap from './BotHeatMap';
import CommissionFlow from './CommissionFlow';
import InviteModal from './InviteModal';

const Dashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [viewMode, setViewMode] = useState('heat'); // 'heat', 'list', 'flow'

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('quantum-bot-token');
      const response = await axios.get('http://localhost:3001/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  const handleInviteSent = () => {
    setShowInviteModal(false);
    loadDashboardData(); // Refresh data
  };

  const processCommissions = async () => {
    try {
      const token = localStorage.getItem('quantum-bot-token');
      await axios.post('http://localhost:3001/api/process-commissions', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadDashboardData(); // Refresh data
      alert('Commissions processed successfully!');
    } catch (error) {
      console.error('Failed to process commissions:', error);
      alert('Failed to process commissions');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  const isMaster = user?.role === 'master';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-white">
      {/* Apple-inspired Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-900">
                🚀 Quantum Bot Command
              </div>
              {isMaster && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  MASTER
                </span>
              )}
              {isAdmin && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ADMIN
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('heat')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'heat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Heat Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('flow')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'flow' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Commission Flow
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Invite Admin
              </button>
              
              {isMaster && (
                <button
                  onClick={processCommissions}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Process Commissions
                </button>
              )}
              
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bots</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isMaster ? dashboardData?.totalBots || 0 : dashboardData?.bots?.length || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Yield</p>
                <p className="text-2xl font-bold text-green-600">
                  {isMaster ? 
                    `${(dashboardData?.totalYield || 0).toFixed(1)}%` : 
                    `${(dashboardData?.bots?.reduce((sum, b) => sum + (b.yield || 0), 0) || 0).toFixed(1)}%`
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commissions</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData?.user?.totalCommissions?.toFixed(2) || '0.00'} XRP
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Referrals</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData?.referrals || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Based on View Mode */}
        {viewMode === 'heat' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Bot Performance Heat Map</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>High Yield</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Medium Yield</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Low Yield</span>
                </div>
              </div>
            </div>
            <BotHeatMap 
              bots={isMaster ? dashboardData?.allBots || [] : dashboardData?.bots || []}
              onBotSelect={setSelectedBot}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Bot Portfolio</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volatility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {isMaster && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(isMaster ? dashboardData?.allBots || [] : dashboardData?.bots || []).map((bot, index) => (
                    <tr key={bot.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{bot.name || `Bot ${bot.id}`}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          bot.yield > 60 ? 'text-green-600' : 
                          bot.yield > 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {bot.yield?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${
                          bot.volatility < 0.15 ? 'text-green-600' : 
                          bot.volatility < 0.25 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {(bot.volatility * 100)?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bot.commissions?.toFixed(2) || '0.00'} XRP
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bot.status === 'active' ? 'bg-green-100 text-green-800' :
                          bot.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {bot.status}
                        </span>
                      </td>
                      {isMaster && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {bot.owner || 'Unknown'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'flow' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Commission Flow Visualization</h2>
              <div className="text-sm text-gray-600">
                Real-time commission tracking with rocket animations
              </div>
            </div>
            <CommissionFlow 
              bots={isMaster ? dashboardData?.allBots || [] : dashboardData?.bots || []}
              user={dashboardData?.user}
            />
          </div>
        )}

        {/* Selected Bot Details Modal */}
        {selectedBot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Bot Details</h3>
                <button
                  onClick={() => setSelectedBot(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedBot.name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Yield:</span>
                  <span className="ml-2 text-sm font-bold text-green-600">{selectedBot.yield?.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Volatility:</span>
                  <span className="ml-2 text-sm text-gray-900">{(selectedBot.volatility * 100)?.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Commissions:</span>
                  <span className="ml-2 text-sm font-bold text-yellow-600">{selectedBot.commissions?.toFixed(2)} XRP</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`ml-2 text-sm font-medium ${
                    selectedBot.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedBot.status}
                  </span>
                </div>
                {isMaster && selectedBot.owner && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Owner:</span>
                    <span className="ml-2 text-sm text-gray-900">{selectedBot.owner}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInviteSent={handleInviteSent}
          userId={dashboardData?.user?.id}
        />
      )}
    </div>
  );
};

export default Dashboard;
