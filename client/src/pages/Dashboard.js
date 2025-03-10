import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import LULogo from '../components/LULogo';
import { supabase } from '../config/supabase';

const CircleButton = ({ title, description, icon, onClick, delay }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: delay 
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center w-full"
    >
      <button
        onClick={onClick}
        className="w-full max-w-[10rem] sm:max-w-[12rem] aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-[2px] shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center p-6 sm:p-8 relative z-10 group-hover:bg-opacity-95">
          <div className="transform group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2 }}
        className="mt-3 sm:mt-6 text-center"
      >
        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-[160px] sm:max-w-[200px]">{description}</p>
      </motion.div>
    </motion.div>
  );
};

const Dashboard = ({ logout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch user data when component mounts
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user's name from metadata or use email as fallback
  const userName = user?.user_metadata?.name || 
                  (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <DarkModeToggle />
      
      {/* Main Content */}
      <div className="h-screen flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <LULogo size="md" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                  LINE.UP
                </span>
              </div>

              {/* Mobile Account Button - Show on mobile only */}
              <div className="sm:hidden flex justify-between items-center">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{loading ? 'Loading...' : userName}</span>
                  <svg className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu Dropdown */}
              {mobileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sm:hidden absolute top-[4.5rem] right-4 left-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => navigate('/account')}
                      className="flex items-center w-full space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Account</span>
                    </button>
                  </div>
                  <div className="p-4">
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center w-full space-x-3 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Desktop Account Section - Hidden on mobile */}
              <div className="hidden sm:flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/account')}
                  className="flex flex-1 sm:flex-none items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{loading ? 'Loading...' : userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">My Account</p>
                  </div>
                </button>

                <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50"
                >
                  Welcome back, {loading ? '...' : userName}! 👋
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-2 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300"
                >
                  Ready to boost your productivity?
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex-1">
          {/* Main Actions */}
          <div className="flex flex-col items-center h-full">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6 sm:mb-8 md:mb-12 text-center"
            >
              What would you like to do?
            </motion.h2>

            {/* Desktop cards: Show on sm screens and above */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-12 w-full max-w-5xl mx-auto">
              <CircleButton
                title="Workflow"
                description="Organize your tasks and manage your projects efficiently"
                delay={0.2}
                icon={
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
                onClick={() => navigate('/workflow')}
              />

              <CircleButton
                title="Focus"
                description="Stay focused with our Pomodoro timer!"
                delay={0.4}
                icon={
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                onClick={() => navigate('/focus')}
              />

              <CircleButton
                title="AI Assistant"
                description="Get assistance from our AI chatbot powered by DeepSeek"
                delay={0.6}
                icon={
                  <div className="relative">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                }
                onClick={() => navigate('/help')}
              />
            </div>

            {/* Mobile cards: Show only on xs screens */}
            <div className="sm:hidden flex flex-col items-center space-y-4 pb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-xs px-4 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Workflow</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Organize your tasks and projects</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/workflow')}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Open Workflow
                </button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-xs px-4 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Focus</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Stay focused with our Pomodoro timer</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/focus')}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Open Focus Timer
                </button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-xs px-4 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3 relative">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">AI Assistant</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Get assistance from our AI chatbot powered by DeepSeek</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/help')}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Open Assistant
                </button>
              </motion.div>
            </div>

            {/* Quick mobile navigation for bottom of screen */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4 mt-auto shadow-lg">
              <div className="flex justify-around">
                <button 
                  onClick={() => navigate('/workflow')}
                  className="flex flex-col items-center p-2"
                >
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="text-xs mt-1">Workflow</span>
                </button>
                <button 
                  onClick={() => navigate('/focus')}
                  className="flex flex-col items-center p-2"
                >
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs mt-1">Focus</span>
                </button>
                <button 
                  onClick={() => navigate('/help')}
                  className="flex flex-col items-center p-2"
                >
                  <div className="relative">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-xs mt-1">AI Assistant</span>
                </button>
                <button 
                  onClick={() => navigate('/account')}
                  className="flex flex-col items-center p-2"
                >
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs mt-1">Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 