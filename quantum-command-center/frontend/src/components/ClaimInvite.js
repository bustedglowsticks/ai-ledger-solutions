/*
 * 🚀 CLAIM INVITE - Secure Invite Claiming Flow
 * Professional onboarding for new admins
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ClaimInvite = ({ onClaim }) => {
  const [searchParams] = useSearchParams();
  const [inviteData, setInviteData] = useState(null);
  const [claimData, setClaimData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');

  const inviteToken = searchParams.get('token');

  useEffect(() => {
    if (inviteToken) {
      validateInvite();
    } else {
      setError('Invalid invite link');
      setLoading(false);
    }
  }, [inviteToken]);

  const validateInvite = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/invite/validate/${inviteToken}`);
      setInviteData(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid or expired invite');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (claimData.password !== claimData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (claimData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setClaiming(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/invite/claim', {
        token: inviteToken,
        password: claimData.password
      });

      const { token, user } = response.data;
      onClaim(token, user);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to claim invite');
    } finally {
      setClaiming(false);
    }
  };

  const handleChange = (e) => {
    setClaimData({
      ...claimData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Validating invite...</p>
        </div>
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invite</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Quantum Bot!
          </h2>
          <p className="text-gray-600">
            You've been invited to join our elite admin network
          </p>
        </div>

        {/* Invite Details */}
        {inviteData && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">👋</div>
              <h3 className="text-lg font-bold text-gray-900">
                Hello, {inviteData.name}!
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Invited by: {inviteData.inviterName}
              </p>
            </div>

            {inviteData.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm italic">
                  "{inviteData.message}"
                </p>
              </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">🎯 Your Benefits:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Access to professional bot dashboard</li>
                <li>• Earn 15% commission on referrals</li>
                <li>• Real-time yield tracking & analytics</li>
                <li>• Exclusive admin hierarchy privileges</li>
              </ul>
            </div>

            {/* Claim Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <div className="text-red-400 mr-2">⚠️</div>
                    <div className="text-red-700 text-sm">{error}</div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Create Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter a secure password"
                  value={claimData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  value={claimData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={claiming}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {claiming ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Claiming Invite...
                  </div>
                ) : (
                  'Claim Invite & Join Network'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500">
          <p>🔒 Your account will be secured with industry-standard encryption</p>
        </div>
      </div>
    </div>
  );
};

export default ClaimInvite;
