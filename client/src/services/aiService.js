import { sendMessageToOpenRouter } from '../config/openrouter';
import { chatService } from './chatService';

// Service for handling AI operations
export const aiService = {
  // Send a message to the AI and save the response
  async sendMessageAndGetResponse(sessionId, userMessage) {
    try {
      console.log('Starting AI service request for session:', sessionId);
      
      // First save the user message to Supabase
      const savedUserMessage = await chatService.saveMessage(sessionId, {
        text: userMessage,
        isUser: true
      });
      console.log('Saved user message:', savedUserMessage);
      
      // Get all messages for this session to provide context to the AI
      const allMessages = await chatService.getChatMessages(sessionId);
      console.log('Retrieved message history, count:', allMessages.length);
      
      // Send the messages to OpenRouter API
      console.log('Sending request to OpenRouter...');
      
      // Create a placeholder message in Supabase for the AI response
      const placeholderAiMessage = await chatService.saveMessage(sessionId, {
        text: "",
        isUser: false
      });
      console.log('Created placeholder AI message:', placeholderAiMessage);
      
      // Use streaming API
      await sendMessageToOpenRouter(allMessages, async (streamUpdate) => {
        if (streamUpdate.isComplete) {
          // Final update - update the message in Supabase
          await chatService.updateMessage(placeholderAiMessage.id, {
            text: streamUpdate.text
          });
          console.log('Updated AI response in Supabase with final text');
        } else if (streamUpdate.text && streamUpdate.text.length > 0 && streamUpdate.text.length % 20 === 0) {
          // Periodically update the message in Supabase (every 20 characters)
          // This reduces database writes while still providing updates
          await chatService.updateMessage(placeholderAiMessage.id, {
            text: streamUpdate.text
          });
          console.log('Updated AI response in Supabase with partial text');
        }
      });
      
      // Get the final message from Supabase
      const finalAiMessage = await chatService.getMessage(placeholderAiMessage.id);
      console.log('Retrieved final AI message from Supabase');
      
      // Update the chat session preview with the user's message
      await chatService.updateChatSession(sessionId, {
        preview: userMessage
      });
      
      return {
        userMessage: savedUserMessage,
        aiMessage: finalAiMessage
      };
    } catch (error) {
      console.error('Error in AI service:', error);
      
      // Create a more specific error message based on the error
      let errorMessage = "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.";
      
      if (error.message) {
        if (error.message.includes('Authentication failed')) {
          errorMessage = "There's an issue with the API key configuration. Please check the setup guide and ensure your OpenRouter API key is correct.";
        } else if (error.message.includes('Bad request')) {
          errorMessage = "There was an issue with the request format. This might be due to an invalid model name or message format.";
        } else if (error.message.includes('Rate limit')) {
          errorMessage = "The API rate limit has been exceeded. Please wait a moment and try again.";
        } else if (error.message.includes('network')) {
          errorMessage = "There seems to be a network issue. Please check your internet connection and try again.";
        }
      }
      
      // Save the specific error message
      const fallbackMessage = await chatService.saveMessage(sessionId, {
        text: errorMessage,
        isUser: false
      });
      
      return {
        userMessage: {
          text: userMessage,
          isUser: true,
          id: Date.now(),
          timestamp: new Date().toISOString()
        },
        aiMessage: fallbackMessage
      };
    }
  }
}; 