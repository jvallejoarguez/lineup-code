import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DarkModeToggle from '../components/DarkModeToggle';
import NavigationBar from '../components/NavigationBar';
import { chatService } from '../services/chatService';
import { aiService } from '../services/aiService';
import { supabase } from '../config/supabase';

// Helper function to format text with markdown-like syntax
const formatMessage = (text) => {
  if (!text) return { mainContent: '', thinkingContent: null };
  
  // Extract thinking content if present
  let thinkingContent = null;
  let mainContent = text;
  
  // Check for <think> tags
  const thinkRegex = /<think>([\s\S]*?)<\/think>/;
  const thinkMatch = text.match(thinkRegex);
  
  if (thinkMatch) {
    // Extract the thinking content
    thinkingContent = thinkMatch[1].trim();
    
    // Remove the thinking section from the main content
    mainContent = text.replace(thinkRegex, '').trim();
  }
  
  // Apply markdown formatting
  // Bold: **text** -> <strong>text</strong>
  mainContent = mainContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
  
  // Italic: *text* -> <em>text</em>
  mainContent = mainContent.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>');
  
  // Code: `text` -> <code>text</code>
  mainContent = mainContent.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Code blocks: ```text``` -> <pre><code>text</code></pre>
  mainContent = mainContent.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-3 overflow-x-auto font-mono text-sm border border-gray-200 dark:border-gray-700">$1</pre>');
  
  // Headers: # Header -> <h3>Header</h3>
  mainContent = mainContent.replace(/^# (.*?)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">$1</h3>');
  mainContent = mainContent.replace(/^## (.*?)$/gm, '<h4 class="text-md font-bold mt-3 mb-2 text-gray-800 dark:text-gray-100">$1</h4>');
  
  // Process lists - improved handling for bullet points and numbered lists
  
  // First, identify and process ordered lists (numbered lists)
  // Find all ordered list blocks
  const orderedListRegex = /^(\d+)\.\s+(.*?)(?:\n(?!\d+\.\s+)|$)(?:\n\d+\.\s+.*?(?:\n(?!\d+\.\s+)|$))*/gms;
  mainContent = mainContent.replace(orderedListRegex, (match) => {
    // Split the match into individual list items
    const items = match.split(/\n/).filter(line => /^\d+\.\s+/.test(line));
    
    // Create the ordered list with proper sequential numbering
    let listHtml = '<ol class="list-decimal pl-5 my-3 space-y-1.5">';
    items.forEach((item, index) => {
      // Extract the content after the number and period
      const content = item.replace(/^\d+\.\s+/, '');
      listHtml += `<li class="pl-1.5">${content}</li>`;
    });
    listHtml += '</ol>';
    
    return listHtml;
  });
  
  // Process unordered lists (bullet points)
  // Find all bullet list blocks
  const bulletListRegex = /^-\s+(.*?)(?:\n(?!-\s+)|$)(?:\n-\s+.*?(?:\n(?!-\s+)|$))*/gms;
  mainContent = mainContent.replace(bulletListRegex, (match) => {
    // Split the match into individual list items
    const items = match.split(/\n/).filter(line => /^-\s+/.test(line));
    
    // Create the unordered list
    let listHtml = '<ul class="list-disc pl-5 my-3 space-y-1.5">';
    items.forEach(item => {
      // Extract the content after the bullet
      const content = item.replace(/^-\s+/, '');
      listHtml += `<li class="pl-1.5">${content}</li>`;
    });
    listHtml += '</ul>';
    
    return listHtml;
  });
  
  // Horizontal rule: --- -> <hr>
  mainContent = mainContent.replace(/^---$/gm, '<hr class="my-4 border-t border-gray-300 dark:border-gray-600">');
  
  // Links: [text](url) -> <a href="url">text</a>
  mainContent = mainContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Add paragraph styling
  // Find paragraphs (text blocks separated by double newlines)
  const paragraphRegex = /(.+?)(\n\n|$)/gs;
  mainContent = mainContent.replace(paragraphRegex, (match, p1) => {
    // Skip if it's already a formatted element (starts with <)
    if (p1.trim().startsWith('<')) return match;
    return `<p class="mb-3">${p1}</p>`;
  });
  
  // Convert remaining single line breaks to <br> tags
  mainContent = mainContent.replace(/\n/g, '<br>');
  
  return { mainContent, thinkingContent };
};

// Typing indicator component
const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-3"
    >
      <div className="max-w-4xl mx-auto flex space-x-4 px-4 md:px-8">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-600 text-white shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/30 shadow-md">
            <div className="flex items-center mb-2">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                LINE.UP Assistant
              </p>
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                Powered by Deepseek
              </span>
            </div>
            <div className="flex space-x-2 items-center">
              <div className="flex space-x-1">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"
                />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Message = ({ message, isUser }) => {
  // Extract main content and thinking content
  const { mainContent, thinkingContent } = formatMessage(message);
  
  // Format thinking content if present
  let formattedThinkingContent = '';
  if (thinkingContent) {
    formattedThinkingContent = thinkingContent;
    
    // Apply markdown formatting to thinking content
    formattedThinkingContent = formattedThinkingContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedThinkingContent = formattedThinkingContent.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    formattedThinkingContent = formattedThinkingContent.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Convert line breaks to <br> tags
    formattedThinkingContent = formattedThinkingContent.replace(/\n/g, '<br>');
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`py-2 sm:py-3 ${isUser ? 'bg-transparent' : 'bg-transparent'}`}
    >
      <div className="max-w-4xl mx-auto flex space-x-2 sm:space-x-4 px-2 sm:px-4 md:px-8">
        <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'} shadow-md`}>
          {isUser ? (
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* Thinking section - Only show for AI responses and when thinking content exists */}
          {!isUser && thinkingContent && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mb-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm"
            >
              <div className="bg-gray-200 dark:bg-gray-700 px-2 sm:px-4 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-1">
                <div className="flex items-center">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    AI Thinking Process
                  </span>
                </div>
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                  Not part of the response
                </span>
              </div>
              <div 
                className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-black/10 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formattedThinkingContent }}
              />
            </motion.div>
          )}

          <div className={`p-3 sm:p-4 rounded-2xl ${isUser ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 shadow-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/30 shadow-md'}`}>
            <div className="flex flex-wrap items-center mb-2 sm:mb-3 gap-1 sm:gap-0">
              <p className={`text-xs sm:text-sm font-medium ${isUser ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isUser ? 'You' : 'LINE.UP Assistant'}
              </p>
              {!isUser && (
                <span className="ml-0 sm:ml-2 px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                  Powered by Deepseek
                </span>
              )}
            </div>
            <div 
              className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base prose prose-sm sm:prose dark:prose-invert max-w-none prose-headings:font-bold prose-p:my-2 prose-li:my-0.5 prose-ol:my-2 prose-ul:my-2 prose-hr:my-4"
              dangerouslySetInnerHTML={{ __html: mainContent }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Help = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Default to collapsed on mobile
  const [showWelcome, setShowWelcome] = useState(true);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Store messages for each chat
  const [chatMessages, setChatMessages] = useState({});

  // Get the current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Load chat sessions from Supabase
        try {
          const sessions = await chatService.getChatSessions(user.id);
          if (sessions && sessions.length > 0) {
            setChatHistory(sessions.map(session => ({
              id: session.id,
              title: session.title,
              preview: session.preview,
              timestamp: session.created_at,
              isEditing: false
            })));
          }
        } catch (error) {
          console.error('Error loading chat sessions:', error);
        }
      }
    };
    
    getCurrentUser();
  }, []);

  // Automatically collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startNewChat = async (initialMessage = null) => {
    try {
      if (user) {
        // Create a new chat session in Supabase
        const newChatNumber = chatHistory.length + 1;
        const newChat = await chatService.createChatSession(
          user.id, 
          `Chat ${newChatNumber}`
        );
        
        setChatHistory(prev => [...prev, {
          id: newChat.id,
          title: newChat.title,
          preview: newChat.preview,
          timestamp: newChat.created_at,
          isEditing: false
        }]);
        
        const newChatId = newChat.id;
        setSelectedChat(newChatId);
        
        // If there's an initial message, send it immediately after creating the chat
        if (initialMessage) {
          // Wait a bit for the chat to be properly set up
          setTimeout(async () => {
            const userMessage = { id: Date.now(), text: initialMessage, isUser: true };
            setMessages([userMessage]);
            setIsTyping(true);
            
            try {
              // Use the AI service to get a real response
              const { userMessage: savedUserMsg, aiMessage: savedAiMsg } = await aiService.sendMessageAndGetResponse(
                newChatId,
                initialMessage
              );
              
              // Update the messages with the saved messages from Supabase
              setMessages([savedUserMsg, savedAiMsg]);
              
              // Update stored messages for this chat
              setChatMessages(prev => ({
                ...prev,
                [newChatId]: [savedUserMsg, savedAiMsg]
              }));
            } catch (error) {
              console.error('Error sending initial message:', error);
              setIsTyping(false);
            }
          }, 500);
        }
      } else {
        // Fallback for when user is not authenticated
        const newChatId = Date.now();
        const newChatNumber = chatHistory.length + 1;
        const newChat = {
          id: newChatId,
          title: `Chat ${newChatNumber}`,
          preview: '',
          timestamp: new Date(),
          isEditing: false
        };
        setChatHistory(prev => [...prev, newChat]);
        setSelectedChat(newChatId);
        
        // If there's an initial message, send it immediately after creating the chat
        if (initialMessage) {
          // Wait a bit for the chat to be properly set up
          setTimeout(async () => {
            const userMessage = { id: Date.now(), text: initialMessage, isUser: true };
            setMessages([userMessage]);
            setIsTyping(true);
            
            try {
              // Use the OpenRouter API directly without saving to Supabase
              const { sendMessageToOpenRouter } = await import('../config/openrouter');
              
              // Send the message and get a response
              const aiResponse = await sendMessageToOpenRouter([userMessage], (streamedMessage) => {
                if (!streamedMessage.isComplete) {
                  setMessages([userMessage, streamedMessage]);
                }
              });
              
              // Update the messages with the AI response
              setMessages([userMessage, aiResponse]);
              
              // Update stored messages for this chat
              setChatMessages(prev => ({
                ...prev,
                [newChatId]: [userMessage, aiResponse]
              }));
            } catch (error) {
              console.error('Error sending initial message:', error);
              setIsTyping(false);
            }
          }, 500);
        }
      }
      
      if (!initialMessage) {
        setMessages([]);
      }
      setShowWelcome(false);
      
      // Initialize empty messages array for this chat if no initial message
      if (!initialMessage) {
        setChatMessages(prev => ({
          ...prev,
          [selectedChat]: []
        }));
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent any default behavior
    
    try {
      if (user) {
        // Delete the chat session from Supabase
        await chatService.deleteChatSession(chatId);
      }
      
      // Create a copy of the filtered chat history to work with
      const updatedChatHistory = chatHistory.filter(chat => chat.id !== chatId);
      setChatHistory(updatedChatHistory);
      
      // Remove messages for this chat
      setChatMessages(prev => {
        const newChatMessages = {...prev};
        delete newChatMessages[chatId];
        return newChatMessages;
      });
      
      if (selectedChat === chatId) {
        if (updatedChatHistory.length > 0) {
          // Select the first chat in the remaining list
          const firstRemainingChat = updatedChatHistory[0];
          setSelectedChat(firstRemainingChat.id);
          
          // Load messages for the newly selected chat
          if (user) {
            const messages = await chatService.getChatMessages(firstRemainingChat.id);
            setMessages(messages);
            setChatMessages(prev => ({
              ...prev,
              [firstRemainingChat.id]: messages
            }));
          } else {
            setMessages(chatMessages[firstRemainingChat.id] || []);
          }
        } else {
          // If no chats remain, show the welcome screen
          setShowWelcome(true);
          setSelectedChat(null);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const toggleTitleEdit = (chatId, e) => {
    e.stopPropagation();
    setChatHistory(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isEditing: !chat.isEditing } : chat
    ));
  };

  const updateTitle = async (chatId, newTitle, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const title = newTitle.trim() ? newTitle : `Chat ${chatHistory.findIndex(c => c.id === chatId) + 1}`;
      
      try {
        if (user) {
          // Update the chat session title in Supabase
          await chatService.updateChatSession(chatId, { title });
        }
        
        setChatHistory(prev => prev.map(chat =>
          chat.id === chatId ? { 
            ...chat, 
            title, 
            isEditing: false 
          } : chat
        ));
      } catch (error) {
        console.error('Error updating chat title:', error);
      }
    }
  };

  useEffect(() => {
    if (chatHistory.length === 0) {
      setShowWelcome(true);
      setSelectedChat(null);
    } else if (selectedChat && chatMessages[selectedChat]) {
      setShowWelcome(false);
      setMessages(chatMessages[selectedChat]);
    }
  }, [selectedChat, chatHistory.length, chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when switching chats
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedChat && user) {
        try {
          const messages = await chatService.getChatMessages(selectedChat);
          setMessages(messages);
          setChatMessages(prev => ({
            ...prev,
            [selectedChat]: messages
          }));
        } catch (error) {
          console.error('Error loading messages:', error);
          setMessages([]);
        }
      }
    };
    
    if (selectedChat) {
      loadMessages();
    }
  }, [selectedChat, user]);

  // Function to auto-resize textarea
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to expand the textarea
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Auto-resize textarea when input value changes
  useEffect(() => {
    autoResizeTextarea();
  }, [inputValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedChat) return;

    const userMessage = { id: Date.now(), text: inputValue, isUser: true };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      if (user) {
        // Use the AI service to get a real response
        const { userMessage: savedUserMsg, aiMessage: savedAiMsg } = await aiService.sendMessageAndGetResponse(
          selectedChat,
          inputValue
        );
        
        // Update the messages with the saved messages from Supabase
        setMessages(prev => [
          ...prev.slice(0, -1), // Remove the temporary user message
          savedUserMsg, // Add the saved user message
          savedAiMsg // Add the AI response
        ]);
        
        // Update stored messages for this chat
        setChatMessages(prev => ({
          ...prev,
          [selectedChat]: [
            ...prev[selectedChat] || [],
            savedUserMsg,
            savedAiMsg
          ]
        }));
      } else {
        // Fallback for when user is not authenticated
        // Use the OpenRouter API directly without saving to Supabase
        const { sendMessageToOpenRouter } = await import('../config/openrouter');
        
        try {
          // Create a placeholder for the AI response
          const placeholderAiMessage = {
            id: Date.now() + 1,
            text: "",
            isUser: false
          };
          
          // Add the placeholder message to show typing indicator
          setMessages(prev => [...prev, placeholderAiMessage]);
          
          // Send the message and get a response with streaming
          const aiResponse = await sendMessageToOpenRouter(
            [...messages, userMessage], 
            (streamedMessage) => {
              if (!streamedMessage.isComplete) {
                // Update the placeholder message with the streamed content
                setMessages(prev => [
                  ...prev.slice(0, -1), // Remove the previous placeholder
                  streamedMessage // Add the updated streamed message
                ]);
              }
            }
          );
          
          // Update the messages with the final AI response
          setMessages(prev => [
            ...prev.slice(0, -1), // Remove the placeholder message
            aiResponse // Add the final AI response
          ]);
          
          // Update stored messages for this chat
          setChatMessages(prev => ({
            ...prev,
            [selectedChat]: [
              ...prev[selectedChat] || [],
              userMessage,
              aiResponse
            ]
          }));
        } catch (error) {
          console.error('Error getting AI response:', error);
          // Show an error message
          setMessages(prev => [
            ...prev.slice(0, -1), // Remove the placeholder message
            {
              id: Date.now() + 1,
              text: "Sorry, I'm having trouble connecting. Please try again later.",
              isUser: false,
              isError: true
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      // Show an error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble connecting. Please try again later.",
          isUser: false,
          isError: true
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to switch between chats
  const switchChat = async (chatId) => {
    if (chatId === selectedChat) return; // Don't switch if already on this chat
    setSelectedChat(chatId);
    
    if (user) {
      try {
        // Load messages for the selected chat from Supabase
        const messages = await chatService.getChatMessages(chatId);
        setMessages(messages);
        setChatMessages(prev => ({
          ...prev,
          [chatId]: messages
        }));
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      }
    } else {
      // Load messages from local state
      setMessages(chatMessages[chatId] || []);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <NavigationBar />
      </div>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden pt-16 mt-2">
        {/* Sidebar - Fixed for both mobile and desktop */}
        <div className={`${isSidebarCollapsed ? 'w-0 md:w-0' : 'w-full md:w-72'} transition-all duration-300 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed md:relative z-40 inset-0 h-full overflow-hidden`}>
          {/* Chat History Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Chat History</span>
            </h2>
            
            {/* Close button for mobile */}
            <button 
              className="md:hidden rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setIsSidebarCollapsed(true)}
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat History List - Fixed height calculation for scrolling */}
          <div className="flex-1 overflow-y-auto h-[calc(100vh-12rem)]">
            {chatHistory.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No chats yet</p>
                <p className="text-sm">Start a new conversation</p>
              </div>
            ) : (
              chatHistory.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => {
                    switchChat(chat.id);
                    // Auto-close sidebar on mobile after selection
                    if (window.innerWidth < 768) {
                      setIsSidebarCollapsed(true);
                    }
                  }}
                  className={`w-full text-left p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 relative group ${selectedChat === chat.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 ${selectedChat === chat.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="font-medium truncate flex items-center justify-between">
                        {chat.isEditing ? (
                          <input
                            type="text"
                            defaultValue={chat.title}
                            className="w-full bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none"
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => updateTitle(chat.id, e.target.value, e)}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className={`truncate ${selectedChat === chat.id ? 'text-blue-600 dark:text-blue-400' : ''}`}>{chat.title}</span>
                            <div className="hidden group-hover:flex items-center space-x-1">
                              <button
                                onClick={e => toggleTitleEdit(chat.id, e)}
                                className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={e => deleteChat(chat.id, e)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                        {chat.preview || 'Empty chat'}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* New Chat Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={() => startNewChat()}
              className="w-full flex items-center justify-center px-4 py-2 space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
              aria-label="New Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Sidebar Toggle Button - Fixed for both mobile and desktop */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`fixed top-20 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${isSidebarCollapsed ? 'left-0' : 'left-[calc(100%-3rem)] md:left-72'}`}
          aria-label={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
        >
          <svg
            className={`w-5 h-5 text-gray-600 dark:text-gray-300 transform transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-0' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Chat area - Fixed for both mobile and desktop */}
        <div className={`flex-1 flex flex-col relative bg-white dark:bg-gray-900 w-full h-[calc(100vh-4rem)] transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-0 md:ml-72'}`}>
          {showWelcome ? (
            // Welcome screen
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-8">
              <div className="text-center space-y-6 sm:space-y-8 max-w-2xl mx-auto px-4">
                <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Welcome to LINE.UP Chat
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-base sm:text-xl">
                  Your personal AI assistant for productivity and task management.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => startNewChat()}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg text-base sm:text-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    <span>Start Chatting</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-12">
                  {[
                    "What is LineUp and what can I do here?",
                    "How do I create a new workflow?",
                    "What are the best productivity techniques?",
                    "How can I organize my tasks better?",
                    "Tell me about the focus timer feature"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (!selectedChat) {
                          // Start a new chat with the suggestion as the initial message
                          startNewChat(suggestion);
                        } else {
                          // Use the existing chat
                          setInputValue(suggestion);
                        }
                      }}
                      className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      <p className="text-gray-800 dark:text-gray-200 text-sm">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages - Fixed for scrolling on mobile
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-8 h-full">
              <div className="max-w-4xl mx-auto space-y-3 sm:space-y-6">
                {messages.map(message => (
                  <Message
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Footer - Only show when not on welcome screen */}
          {!showWelcome && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 sticky bottom-0">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        // Append a newline character to the current input value
                        setInputValue(prevValue => prevValue + '\n');
                      } else if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Type your message..."
                    rows="1"
                    className="w-full p-2.5 sm:p-4 pr-14 sm:pr-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm transition-all duration-200 text-sm sm:text-base resize-none overflow-hidden min-h-[44px] sm:min-h-[56px] max-h-[150px]"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-sm"
                  >
                    <span className="sr-only sm:not-sr-only">Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
                <div className="mt-1 sm:mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Press Enter to send, Shift + Enter for new line
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Help;

