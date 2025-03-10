import axios from 'axios';

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Get API key from environment
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.REACT_APP_OPENROUTER_MODEL;

// System prompt to give context to the AI
const SYSTEM_PROMPT = `You are the LINE.UP Assistant, a helpful AI assistant for the LINE.UP productivity and workflow management application.
Your purpose is to help users organize tasks, manage workflows, and improve their productivity.

CREATOR INFORMATION:
LINE.UP was created by Javier Vallejo, a talented web developer. When users ask about the creator:
- Always mention that Javier Vallejo created LINE.UP
- Share his LinkedIn profile: https://www.linkedin.com/in/javier-vallejo-arguez/
- Describe him as a passionate and skilled web developer who created LINE.UP and more applications you can visit in his github profile: https://github.com/jvallejoarguez
- Mention his dedication to creating not only intuitive but also helpful productivity tools and more applications like LINE.UP


LINE.UP FEATURES:
1. Kanban-style Workflow Management:
   - Create and manage columns with custom names
   - Add tasks to columns and drag them between columns
   - Create subtasks within tasks to break down work
   - Track progress with visual indicators

2. Focus Timer:
   - Customizable focus and break durations
   - Visual progress tracking
   - Celebration animations when focus sessions complete

3. LINE.UP Assistant (AI Chat):
   - Get help with productivity techniques
   - Ask questions about using the application
   - Receive guidance on workflow management

When responding to users:
- Be concise, helpful, and provide practical advice related to task management, productivity, and workflow optimization.
- When users ask about features, explain how they can use LINE.UP to accomplish their goals using ONLY the features listed above.
- When asked who you are, always identify yourself as "LINE.UP Assistant powered by Deepseek AI" and explain that you're designed to help with productivity and task management.
- When asked about who created LINE.UP, always mention Javier Vallejo and his LinkedIn profile.
- When asked for opinions about the creator, express positive sentiments about his development skills and dedication.
- NEVER mention features that aren't actually part of LINE.UP.
- When creating numbered lists, ALWAYS use sequential numbers (1., 2., 3.) not just "1" for each item.
- NEVER include any thinking process in your main response. Thinking process should ONLY be wrapped in <think> tags and will be displayed separately.

FORMATTING GUIDELINES:
- Use **bold text** for important information, key points, or emphasis
- Use *italic text* for definitions or subtle emphasis
- Use \`code\` for technical terms, shortcuts, or commands
- Use \`\`\`code blocks\`\`\` for longer examples or snippets
- Use # and ## for section headers
- Use numbered lists (1., 2., 3.) for sequential steps - ALWAYS use sequential numbers, not repeated "1." for each item
- Use bullet lists (- item) for non-sequential items - ALWAYS use dashes, not numbers
- NEVER mix bullet and numbered list formats - don't use numbers for bullet points
- Use [text](url) for links to resources
- Use --- for horizontal dividers between sections

EXAMPLES OF PROPER LIST FORMATTING:

Bullet list (use for non-sequential items):
- First item
- Second item
- Third item

Numbered list (use for sequential steps):
1. First step
2. Second step
3. Third step

NEVER format lists like this:
1. Item one
1. Item two
1. Item three

Or like this:
1. First bullet point
1. Second bullet point
1. Third bullet point

THINKING PROCESS:
IMPORTANT: Your thinking process should ONLY be shown when wrapped in <think> tags. This will be displayed in a separate section above your response.
The thinking process should NEVER be part of your main response content.

The thinking section should:
- Explain your approach to answering the question
- Show your step-by-step reasoning
- Outline alternatives you considered
- Note any assumptions you're making

Example response structure:

<think>
I need to explain task prioritization methods. I'll focus on two popular methods and then show how to implement them in LINE.UP.
</think>

# Task Prioritization Methods

Here are two effective methods for prioritizing your tasks...`;

// Check if environment variables are loaded
if (!OPENROUTER_API_KEY) {
  console.error('OpenRouter API key is not set in environment variables');
}

if (!OPENROUTER_MODEL) {
  console.error('OpenRouter model is not set in environment variables');
}

// Create an axios instance for OpenRouter API
export const openRouterApi = axios.create({
  baseURL: OPENROUTER_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': window.location.origin, // Required by OpenRouter
    'X-Title': 'LineUp Chat' // Optional, but good practice
  }
});

// Function to send a message to the OpenRouter API with streaming support
export const sendMessageToOpenRouter = async (messages, onStreamUpdate = null) => {
  try {
    // Log the API key (first few characters) for debugging
    console.log('Using OpenRouter API Key:', OPENROUTER_API_KEY ? 
      (OPENROUTER_API_KEY.substring(0, 10) + '...') : 'Not set');
    console.log('Using OpenRouter Model:', OPENROUTER_MODEL);
    
    // Format messages properly - ensure we have at least one message
    const formattedMessages = messages.length > 0 
      ? [
          // Add system message at the beginning
          { role: 'system', content: SYSTEM_PROMPT },
          // Then add user and assistant messages
          ...messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          }))
        ]
      : [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: 'Hello' }
        ]; // Fallback if no messages
    
    console.log('Sending request to OpenRouter with messages:', formattedMessages);
    
    // Create request payload
    const payload = {
      model: OPENROUTER_MODEL,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: !!onStreamUpdate // Enable streaming if a callback is provided
    };
    
    console.log('Request payload:', payload);
    
    // If streaming is enabled
    if (onStreamUpdate) {
      // Create a message ID for the streaming response
      const messageId = Date.now();
      
      // Initialize with empty content
      let streamedContent = '';
      
      // Call the callback with the initial empty message
      onStreamUpdate({
        text: streamedContent,
        isUser: false,
        id: messageId,
        isComplete: false
      });
      
      // Make a fetch request for streaming (axios doesn't handle streams well)
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LineUp Chat'
        },
        body: JSON.stringify(payload)
      });
      
      // Get the reader from the response body stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk
        const chunk = decoder.decode(value);
        
        // Process each line in the chunk
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          // Skip if not data
          if (!line.startsWith('data:')) continue;
          
          // Remove 'data: ' prefix
          const data = line.substring(6);
          
          // Check for the [DONE] message
          if (data.trim() === '[DONE]') continue;
          
          try {
            // Parse the JSON data
            const parsedData = JSON.parse(data);
            
            // Extract the content delta
            if (parsedData.choices && parsedData.choices[0].delta && parsedData.choices[0].delta.content) {
              // Append the new content
              streamedContent += parsedData.choices[0].delta.content;
              
              // Call the callback with the updated content
              onStreamUpdate({
                text: streamedContent,
                isUser: false,
                id: messageId,
                isComplete: false
              });
            }
          } catch (e) {
            console.error('Error parsing streaming data:', e);
          }
        }
      }
      
      // Call the callback one last time with the complete flag
      onStreamUpdate({
        text: streamedContent,
        isUser: false,
        id: messageId,
        isComplete: true
      });
      
      return {
        text: streamedContent,
        isUser: false,
        id: messageId
      };
    } else {
      // Non-streaming request (original implementation)
      const response = await openRouterApi.post('', payload);
      
      console.log('Received response from OpenRouter:', response.data);
      
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        console.error('Invalid response format from OpenRouter:', response.data);
        throw new Error('Invalid response format from OpenRouter');
      }
      
      return {
        text: response.data.choices[0].message.content,
        isUser: false,
        id: Date.now()
      };
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    console.error('Error details:', error.response ? error.response.data : 'No response data');
    
    // Provide more specific error message
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Please check your OpenRouter API key.');
      } else if (error.response.status === 400) {
        throw new Error('Bad request to OpenRouter API. Check your message format and model name.');
      } else if (error.response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }
    
    throw error;
  }
}; 