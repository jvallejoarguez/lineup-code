import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import { getSiteUrl } from '../utils/siteUrl';
import DarkModeToggle from '../components/DarkModeToggle';
import LULogo from '../components/LULogo';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: 'gray'
  });
  const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [showEmailFeedback, setShowEmailFeedback] = useState(false);

  // Calculate password strength when password changes
  useEffect(() => {
    if (formData.password) {
      calculatePasswordStrength(formData.password);
      setShowPasswordFeedback(true);
    } else {
      setShowPasswordFeedback(false);
    }
  }, [formData.password]);

  // Add email validation effect
  useEffect(() => {
    if (formData.email) {
      validateEmail(formData.email);
      setShowEmailFeedback(true);
    } else {
      setShowEmailFeedback(false);
    }
  }, [formData.email]);

  const calculatePasswordStrength = (password) => {
    // Basic password strength calculation
    let score = 0;
    let feedback = '';
    let color = 'red';

    // Length check
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char

    // Set feedback based on score
    if (score === 0) {
      feedback = 'Very Weak';
      color = 'red';
    } else if (score <= 2) {
      feedback = 'Weak';
      color = 'red';
    } else if (score <= 3) {
      feedback = 'Medium';
      color = 'yellow';
    } else if (score === 4) {
      feedback = 'Strong';
      color = 'green';
    } else {
      feedback = 'Very Strong';
      color = 'green';
    }

    setPasswordStrength({ score, feedback, color });
  };

  // Email validation function
  const validateEmail = (email) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Get the correct site URL and ensure we have the full auth callback path
      const siteUrl = `${getSiteUrl()}/auth/callback`;
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: siteUrl
        }
      });

      if (error) throw error;

      // Successful registration
      setSuccessMessage('Registration successful! Please check your email for verification.');
      
      // Redirect after a short delay to allow the user to see the success message
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <DarkModeToggle />
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 dark:from-blue-900/10 dark:to-indigo-900/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-grid-flow"></div>
      </div>

      <div className="relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sm:mx-auto sm:w-full sm:max-w-md text-center"
        >
          {/* Logo */}
          <div className="mx-auto mb-6 flex justify-center">
            <LULogo size="lg" linkTo="/" />
          </div>

          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 relative overflow-hidden">
            {/* Decorative Corner Elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-tr-full"></div>

            {/* Success message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm text-center"
              >
                {successMessage}
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Form fields with enhanced styling */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      showEmailFeedback ? (emailValid ? 'border-green-500 dark:border-green-500' : 'border-red-500 dark:border-red-500') : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200`}
                    placeholder="you@example.com"
                  />
                  {showEmailFeedback && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {emailValid ? (
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Email validation feedback */}
                {showEmailFeedback && !emailValid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Please enter a valid email address (e.g., name@example.com)
                    </p>
                  </motion.div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
                
                {/* Password strength indicator */}
                {showPasswordFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Password strength:</span>
                      <span className={`text-xs font-medium text-${passwordStrength.color}-600 dark:text-${passwordStrength.color}-400`}>
                        {passwordStrength.feedback}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`bg-${passwordStrength.color}-600 h-1.5 rounded-full transition-all duration-300`} 
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Password requirements */}
                    <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <li className={`flex items-center ${formData.password.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}`}>
                        <svg className={`w-3 h-3 mr-1 ${formData.password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {formData.password.length >= 6 ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          )}
                        </svg>
                        At least 6 characters
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                        <svg className={`w-3 h-3 mr-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {/[A-Z]/.test(formData.password) ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          )}
                        </svg>
                        At least 1 uppercase letter
                      </li>
                      <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                        <svg className={`w-3 h-3 mr-1 ${/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {/[0-9]/.test(formData.password) ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          )}
                        </svg>
                        At least 1 number
                      </li>
                      <li className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                        <svg className={`w-3 h-3 mr-1 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {/[^A-Za-z0-9]/.test(formData.password) ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          )}
                        </svg>
                        At least 1 special character
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white sm:text-sm transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Error display with animation */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : 'Create Account'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Register; 