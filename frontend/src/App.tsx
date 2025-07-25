import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ProfileSetup from './components/Profile/ProfileSetup';
import JobAnalysis from './components/Job/JobAnalysis';
import EmailGenerator from './components/Email/EmailGenerator';
import { CandidateProfile } from './types';
import { candidateApi } from './services/api';

function App() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load candidate profile on app start
    const loadProfile = async () => {
      try {
        const candidateProfile = await candidateApi.getProfile();
        setProfile(candidateProfile);
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Profile doesn't exist, will create new one
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateProfile = (newProfile: CandidateProfile) => {
    setProfile(newProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AutoReach AI...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          profile={profile}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Header */}
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            profile={profile}
          />
          
          {/* Page Content */}
          <main className="flex-1 p-6">
            <Routes>
              <Route 
                path="/" 
                element={
                  profile ? (
                    <Dashboard profile={profile} />
                  ) : (
                    <Navigate to="/profile" replace />
                  )
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProfileSetup 
                    profile={profile}
                    onProfileUpdate={updateProfile}
                  />
                } 
              />
              <Route 
                path="/jobs" 
                element={
                  profile ? (
                    <JobAnalysis profile={profile} />
                  ) : (
                    <Navigate to="/profile" replace />
                  )
                } 
              />
              <Route 
                path="/email-generator" 
                element={
                  profile ? (
                    <EmailGenerator profile={profile} />
                  ) : (
                    <Navigate to="/profile" replace />
                  )
                } 
              />
              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#22c55e',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App; 