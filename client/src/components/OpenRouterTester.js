import React, { useState, useEffect } from 'react';

const OpenRouterTester = () => {
  const [result, setResult] = useState('Testing API key...');
  const [manualKey, setManualKey] = useState('');
  
  // Helper function to get consistent headers for OpenRouter requests
  const getOpenRouterHeaders = (apiKey) => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'Referer': window.location.origin,
      'X-Title': 'LineUp Chat'
    };
  };
  
  const testApiKey = async (apiKey) => {
    try {
      setResult('Testing API key: ' + apiKey.substring(0, 10) + '...');
      
      // Simple request to validate the API key
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: getOpenRouterHeaders(apiKey)
      });
      
      if (!response.ok) {
        setResult(`API key validation failed with status: ${response.status}`);
        return false;
      }
      
      const data = await response.json();
      setResult(`API key is valid! Response: ${JSON.stringify(data)}`);
      return true;
    } catch (error) {
      setResult(`API key validation error: ${error.message}`);
      return false;
    }
  };
  
  const testSimpleCompletion = async (apiKey) => {
    try {
      setResult('Testing simple completion with API key: ' + apiKey.substring(0, 10) + '...');
      
      // Simple chat completion request
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: getOpenRouterHeaders(apiKey),
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-distill-llama-70b:free',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say hello' }
          ],
          max_tokens: 100
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        setResult(`Completion request failed with status: ${response.status}. Error: ${errorText}`);
        return false;
      }
      
      const data = await response.json();
      setResult(`Completion successful! Response: ${JSON.stringify(data)}`);
      return true;
    } catch (error) {
      setResult(`Completion error: ${error.message}`);
      return false;
    }
  };
  
  useEffect(() => {
    // Test with the API key from environment
    const envApiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    if (envApiKey) {
      testApiKey(envApiKey);
    } else {
      setResult('No API key found in environment variables');
    }
  }, []);
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>OpenRouter API Tester</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Environment API Key Test</h3>
        <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
          {result}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test with Manual API Key</h3>
        <input
          type="text"
          value={manualKey}
          onChange={(e) => setManualKey(e.target.value)}
          placeholder="Enter OpenRouter API Key"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <div>
          <button 
            onClick={() => testApiKey(manualKey)}
            style={{ marginRight: '10px', padding: '8px 16px' }}
          >
            Test Key Validity
          </button>
          <button 
            onClick={() => testSimpleCompletion(manualKey)}
            style={{ padding: '8px 16px' }}
          >
            Test Completion
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Debugging Tips</h3>
        <ul>
          <li>Make sure your API key starts with <code>sk-or-v1-</code> followed by a long string of characters</li>
          <li>Check if the API key has expired or been revoked</li>
          <li>Verify that your API key has access to the model you're trying to use</li>
          <li>Ensure OpenRouter is operational by checking their status page</li>
          <li>Try creating a new API key at OpenRouter</li>
        </ul>
      </div>
    </div>
  );
};

export default OpenRouterTester; 