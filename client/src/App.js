import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workflow from './pages/Workflow';
import Focus from './pages/Focus';
import Help from './pages/Help';
import Account from './pages/Account';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import EmailConfirmation from './pages/EmailConfirmation';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<LandingPage />} 
        />
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!session ? <Register /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/email-confirmation" 
          element={<EmailConfirmation />} 
        />
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />
        <Route 
          path="/auth/callback" 
          element={<AuthCallback />} 
        />
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard logout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/account" 
          element={session ? <Account /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/workflow" 
          element={session ? <Workflow /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/focus" 
          element={session ? <Focus /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/help" 
          element={session ? <Help /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/privacy-policy" 
          element={<PrivacyPolicy />} 
        />
        <Route 
          path="/terms-of-service" 
          element={<TermsOfService />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
