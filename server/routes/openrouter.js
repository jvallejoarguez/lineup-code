const express = require('express');
const axios = require('axios');
const router = express.Router();

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Middleware to check if API key is configured
const checkApiKey = (req, res, next) => {
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenRouter API key is not configured on the server' 
    });
  }
  next();
};

// Route to handle regular (non-streaming) completions
router.post('/completions', checkApiKey, async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens } = req.body;
    
    // Create request payload
    const payload = {
      model: model || 'deepseek/deepseek-r1-distill-llama-70b:free',
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000,
      stream: false
    };
    
    // Make request to OpenRouter API
    const response = await axios.post(OPENROUTER_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.origin || 'http://localhost:3000',
        'X-Title': 'LineUp Chat'
      }
    });
    
    // Return the response data
    res.json(response.data);
  } catch (error) {
    console.error('Error calling OpenRouter API:', error.message);
    res.status(500).json({ 
      error: 'Error calling OpenRouter API', 
      message: error.message 
    });
  }
});

// Route to handle streaming completions
router.post('/completions/stream', checkApiKey, async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens } = req.body;
    
    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Create request payload
    const payload = {
      model: model || 'deepseek/deepseek-r1-distill-llama-70b:free',
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000,
      stream: true
    };
    
    // Make request to OpenRouter API with streaming
    const response = await axios.post(OPENROUTER_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.origin || 'http://localhost:3000',
        'X-Title': 'LineUp Chat'
      },
      responseType: 'stream'
    });
    
    // Pipe the response stream to the client
    response.data.pipe(res);
    
    // Handle client disconnect
    req.on('close', () => {
      response.data.destroy();
    });
  } catch (error) {
    console.error('Error calling OpenRouter API with streaming:', error.message);
    res.status(500).json({ 
      error: 'Error calling OpenRouter API with streaming', 
      message: error.message 
    });
  }
});

module.exports = router; 