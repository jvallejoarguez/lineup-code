import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DarkModeToggle from '../components/DarkModeToggle';
import LULogo from '../components/LULogo';

function EmailConfirmation() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const hash = window.location.hash;
        if (!hash) {
          setStatus('error');
          setMessage('No confirmation link found. Please check your email for the confirmation link.');
          return;
        }

        const accessToken = hash.match(/access_token=([^&]*)/)?.[1];
        const refreshToken = hash.match(/refresh_token=([^&]*)/)?.[1];

        if (!accessToken || !refreshToken) {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try again or request a new confirmation email.');
          return;
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) throw error;

        window.history.replaceState(null, document.title, window.location.pathname);
        setStatus('success');
        setMessage('Your email has been successfully confirmed!');
      } catch (err) {
        setStatus('error');
        setMessage('Failed to confirm your email. Please try again or contact support.');
      }
    };

    confirmEmail();
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <DarkModeToggle />
      <div className="relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <LULogo size="lg" linkTo="/" />
          </div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Email Confirmation
          </h2>
        </motion.div>

        <motion.div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10">
            <div className="text-center space-y-6">
              {status === 'processing' && (
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              )}
              {status === 'success' && (
                <div className="text-green-600 dark:text-green-400 text-xl">{message}</div>
              )}
              {status === 'error' && (
                <div className="text-red-600 dark:text-red-400 text-xl">{message}</div>
              )}
              <button
                onClick={handleLoginClick}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EmailConfirmation; 