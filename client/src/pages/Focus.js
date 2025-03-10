import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DarkModeToggle from '../components/DarkModeToggle';
import confetti from 'canvas-confetti';
import NavigationBar from '../components/NavigationBar';

function Focus() {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(30);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(10);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [cycleComplete, setCycleComplete] = useState(false);

  const celebrateFocusCompletion = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      setShowSettings(false);
      
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => console.log('Audio playback failed'));
      } catch (error) {
        console.log('Audio playback error:', error);
      }
      
      if (!isBreak) {
        celebrateFocusCompletion();
        const breakDuration = Math.max((breakMinutes * 60 + breakSeconds), 60);
        setTimeLeft(breakDuration);
        setIsBreak(true);
      } else {
        const focusDuration = Math.max((focusMinutes * 60 + focusSeconds), 60);
        setTimeLeft(focusDuration);
        setIsBreak(false);
        setCycleComplete(true);
        setIsRunning(false);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, breakMinutes, breakSeconds, focusMinutes, focusSeconds, isBreak]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    let total, current;
    if (isRunning) {
      // Use timeLeft for running timer
      total = isBreak 
        ? (breakMinutes * 60 + breakSeconds)
        : (focusMinutes * 60 + focusSeconds);
      current = timeLeft;
    } else {
      // Use current settings for preview
      total = isBreak
        ? (breakMinutes * 60 + breakSeconds)
        : (focusMinutes * 60 + focusSeconds);
      current = total;
    }
    
    // Ensure we don't divide by zero
    total = Math.max(total, 1);
    return ((total - current) / total) * 100;
  };

  const handleFocusTimeChange = (e, type) => {
    const value = parseInt(e.target.value);
    if (type === 'minutes') {
      if (e.target.value === '') {
        setFocusMinutes(0);
        if (!isRunning && !isBreak) {
          setTimeLeft(focusSeconds);
        }
      } else if (value >= 0 && value <= 60) {
        setFocusMinutes(value);
        if (!isRunning && !isBreak) {
          setTimeLeft((value * 60) + focusSeconds);
        }
      }
    } else if (type === 'seconds') {
      if (e.target.value === '') {
        setFocusSeconds(0);
        if (!isRunning && !isBreak) {
          setTimeLeft(focusMinutes * 60);
        }
      } else if (value >= 0 && value < 60) {
        setFocusSeconds(value);
        if (!isRunning && !isBreak) {
          setTimeLeft((focusMinutes * 60) + value);
        }
      }
    }
  };

  const handleBreakTimeChange = (e, type) => {
    const value = parseInt(e.target.value);
    if (type === 'minutes') {
      if (e.target.value === '') {
        setBreakMinutes(0);
        if (!isRunning && isBreak) {
          setTimeLeft(breakSeconds);
        }
      } else if (value >= 0 && value <= 60) {
        setBreakMinutes(value);
        if (!isRunning && isBreak) {
          setTimeLeft((value * 60) + breakSeconds);
        }
      }
    } else if (type === 'seconds') {
      if (e.target.value === '') {
        setBreakSeconds(0);
        if (!isRunning && isBreak) {
          setTimeLeft(breakSeconds);
        }
      } else if (value >= 0 && value < 60) {
        setBreakSeconds(value);
        if (!isRunning && isBreak) {
          setTimeLeft((breakMinutes * 60) + value);
        }
      }
    }
  };

  const handleStart = () => {
    if (cycleComplete) {
      setCycleComplete(false);
    }
    
    // Validate total duration is at least 1 second
    const totalFocusSeconds = (focusMinutes * 60) + focusSeconds;
    const totalBreakSeconds = (breakMinutes * 60) + breakSeconds;
    
    if (totalFocusSeconds === 0) {
      setFocusSeconds(Math.max(focusSeconds, 1));
    }
    if (totalBreakSeconds === 0) {
      setBreakSeconds(Math.max(breakSeconds, 1));
    }
    
    // Only set the timer if we're starting fresh (not resuming)
    if (!isRunning && timeLeft === (isBreak ? Math.max(totalBreakSeconds, 1) : Math.max(totalFocusSeconds, 1))) {
      // Set the timer based on current mode
      if (!isBreak) {
        setTimeLeft(Math.max(totalFocusSeconds, 1));
      } else {
        setTimeLeft(Math.max(totalBreakSeconds, 1));
      }
    }
    
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setCycleComplete(false);
    const totalFocusSeconds = (focusMinutes * 60) + focusSeconds;
    setTimeLeft(Math.max(totalFocusSeconds, 1));
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      isRunning && !isBreak ? 'bg-gray-900 bg-opacity-95' : 'bg-gray-50 dark:bg-gray-900'
    }`}>
      <DarkModeToggle />
      
      {/* Updated NavigationBar implementation */}
      {!isRunning && <NavigationBar />}
      
      {isRunning && (
        <div className="fixed top-4 left-4 z-50">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            onClick={() => setIsRunning(false)}
            className="p-2 rounded-full bg-gray-800 bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        {/* Timer Card */}
        <div
          className="relative w-full max-w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 md:p-8 mb-8"
        >
          {/* Header */}
          <div
            className="text-center mb-6"
          >
            <h1 className={`text-4xl font-bold ${
              isBreak 
                ? 'text-green-500 dark:text-green-300' 
                : 'text-blue-600 dark:text-blue-300'
            }`}>
              {isBreak ? 'Break Time' : 'Focus Time'}
            </h1>
            <p className={`mt-2 text-sm ${
              isBreak
                ? 'text-green-600 dark:text-green-400'
                : 'text-blue-700 dark:text-blue-400'
            }`}>
              {isBreak ? 'Time to recharge' : 'Stay focused on your task'}
            </p>
          </div>

          {/* Timer Display */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="110"
                cx="128"
                cy="128"
              />
              <circle
                className={`${isBreak ? 'text-green-500' : 'text-blue-500'} transition-all duration-1000`}
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="110"
                cx="128"
                cy="128"
                strokeDasharray={`${2 * Math.PI * 110}`}
                strokeDashoffset={`${2 * Math.PI * 110 * (1 - calculateProgress() / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-mono font-bold text-gray-900 dark:text-gray-50"
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {isBreak ? 'Time to relax' : 'Stay focused'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isRunning ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className={`
                  px-6 py-3 rounded-lg text-white font-semibold shadow-lg
                  ${timeLeft < ((isBreak ? (breakMinutes * 60 + breakSeconds) : (focusMinutes * 60 + focusSeconds)))
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'  // Resume color
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'      // Start color
                  }
                  transition-all duration-300 ease-in-out
                `}
              >
                {cycleComplete ? 'Start New Cycle' : 
                  (timeLeft < ((isBreak ? (breakMinutes * 60 + breakSeconds) : (focusMinutes * 60 + focusSeconds))) 
                    ? 'Resume' 
                    : 'Start'
                  )
                }
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg
                  bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700
                  transition-all duration-300 ease-in-out"
              >
                Pause
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 
                dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-gray-100 
                rounded-lg font-semibold shadow-lg hover:from-gray-300 hover:to-gray-400 
                dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 ease-in-out"
            >
              Reset
            </motion.button>
          </div>
        </div>

        {/* Settings Button - Only show when timer is not running */}
        {!isRunning && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 
              text-white rounded-lg font-semibold shadow-lg 
              hover:from-blue-600 hover:to-indigo-700 
              transition-all duration-300 ease-in-out"
          >
            {showSettings ? 'Hide Settings' : 'Show Settings'}
          </motion.button>
        )}

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && !isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-96 mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 
                  bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                  Timer Settings
                </h3>
                <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20"></div>
              </div>
              
              <div className="space-y-6">
                {/* Focus Duration */}
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 
                  dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 
                  dark:border-blue-800/30 shadow-sm">
                  <label className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 block">
                    Focus Duration
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1 block">
                        Minutes
                      </label>
                      <input
                        type="number"
                        value={focusMinutes}
                        onChange={(e) => handleFocusTimeChange(e, 'minutes')}
                        min="0"
                        max="60"
                        className="w-full p-3 border border-blue-200 dark:border-blue-700 
                          rounded-lg bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1 block">
                        Seconds
                      </label>
                      <input
                        type="number"
                        value={focusSeconds}
                        onChange={(e) => handleFocusTimeChange(e, 'seconds')}
                        min="0"
                        max="59"
                        className="w-full p-3 border border-blue-200 dark:border-blue-700 
                          rounded-lg bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-100
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Break Duration */}
                <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 
                  dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 
                  dark:border-green-800/30 shadow-sm">
                  <label className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3 block">
                    Break Duration
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 block">
                        Minutes
                      </label>
                      <input
                        type="number"
                        value={breakMinutes}
                        onChange={(e) => handleBreakTimeChange(e, 'minutes')}
                        min="1"
                        max="60"
                        className="w-full p-3 border border-green-200 dark:border-green-700 
                          rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-green-100
                          focus:ring-2 focus:ring-green-500 focus:border-transparent
                          transition-all duration-200"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 block">
                        Seconds
                      </label>
                      <input
                        type="number"
                        value={breakSeconds}
                        onChange={(e) => handleBreakTimeChange(e, 'seconds')}
                        min="0"
                        max="59"
                        className="w-full p-3 border border-green-200 dark:border-green-700 
                          rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-green-100
                          focus:ring-2 focus:ring-green-500 focus:border-transparent
                          transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cycle complete message */}
        {cycleComplete && (
          <div className={`text-center mt-6 ${isRunning ? 'text-white' : 'text-gray-900 dark:text-gray-50'}`}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-green-500 dark:text-green-300 font-semibold"
            >
              Cycle Complete! Take a longer break or start a new cycle.
            </motion.p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Focus;
