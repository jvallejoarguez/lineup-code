import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import DarkModeToggle from '../components/DarkModeToggle';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const FeatureCard = ({ title, description, items, icon, iconColor = "blue" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const colorClasses = {
    blue: "from-blue-500 to-indigo-600",
    purple: "from-purple-500 to-indigo-600",
    teal: "from-teal-500 to-blue-500"
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="mb-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-8">
        <div className="flex items-start mb-6">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[iconColor]} mr-4`}>
            {icon}
          </div>
          <motion.h3 
            variants={fadeIn}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {title}
          </motion.h3>
        </div>
        
        <motion.p 
          variants={fadeIn}
          className="text-lg text-gray-600 dark:text-gray-300 mb-6"
        >
          {description}
        </motion.p>
        
        <ul className="space-y-3 text-gray-600 dark:text-gray-300">
          {items.map((item, index) => (
            <motion.li 
              key={index}
              variants={fadeIn}
              className="flex items-center transform hover:translate-x-2 transition-transform duration-300"
            >
              <svg className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  // Floating elements animation
  const floatingAnimation = {
    y: [0, 15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <DarkModeToggle />
      
      {/* Hero Section with 3D Grid Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-grid-flow"></div>
        </div>

        {/* Floating Geometric Shapes */}
        <motion.div 
          animate={floatingAnimation}
          className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
        />
        <motion.div 
          animate={floatingAnimation}
          className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl"
        />

        {/* Main Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ scale }}
            className="space-y-8"
          >
            {/* Logo Mark */}
            <div className="mx-auto w-24 h-24 mb-8">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
                <span className="text-white text-3xl font-bold">LU</span>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                LINE.UP
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your intelligent workspace for 
              <span className="text-blue-600 dark:text-blue-400 font-semibold"> enhanced productivity</span>
            </p>

            {/* CTA Buttons with Hover Effects */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative">Get Started</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="group px-8 py-4 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 transition-all duration-300"
              >
                Sign In
              </motion.button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
              {[
                { number: "3", label: "Core Features" },
                { number: "24/7", label: "AI Assistance" },
                { number: "100%", label: "Open Source" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.number}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Features Section with Interactive Cards */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-20"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Powerful Features
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Kanban Workflow Feature */}
            <FeatureCard
              title="Kanban Workflow"
              description="Organize your tasks with our intuitive drag-and-drop kanban board."
              items={[
                "Create multiple columns for your workflow",
                "Drag and drop tasks between columns",
                "Add subtasks to break down complex work",
                "Customize column colors for better organization"
              ]}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              iconColor="blue"
            />

            {/* Focus Timer Feature */}
            <FeatureCard
              title="Focus Timer"
              description="Stay productive with our customizable Pomodoro timer."
              items={[
                "Set custom focus and break durations",
                "Visual progress tracking",
                "Celebration animations when completing sessions",
                "Dark mode support for late-night work"
              ]}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              iconColor="purple"
            />

            {/* AI Assistant Feature */}
            <FeatureCard
              title="AI Assistant Powered by DeepSeek"
              description="Get instant help and suggestions from our intelligent assistant powered by DeepSeek."
              items={[
                "Ask questions about productivity techniques",
                "Get help with using LINE.UP features",
                "Receive personalized task management advice",
                "Powered by DeepSeek",
                
                
              ]}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              iconColor="teal"
            />
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Start Boosting Your Productivity
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join LINE.UP today and experience a new way to organize your tasks and enhance your productivity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Why Choose LINE.UP?</h3>
                  <ul className="space-y-4">
                    {[
                      "Intuitive and user-friendly interface",
                      "Customizable to fit your workflow",
                      "Intelligent AI assistance powered by DeepSeek",
                      "Dark mode support",
                      "Cross-device synchronization",
                      "Open source and community-driven"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Get Started in Seconds</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create your account and start organizing your tasks right away. No complex setup required.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/register')}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                  >
                    Create Free Account
                  </motion.button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Already have an account? <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h4 className="text-white text-lg font-semibold">LINE.UP</h4>
              <p className="text-sm">
                Empowering students and professionals to achieve more through intelligent productivity tools.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/jvallejoarguez" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://linkedin.com/in/javier-vallejo-arguez" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#get-started" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Get Started</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Sign In</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
            <p>© {new Date().getFullYear()} LINE.UP. All rights reserved. Powered by <a href="https://deepseek.com" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">DeepSeek</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 