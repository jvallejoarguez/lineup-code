import { supabase } from '../config/supabase';

// Service for handling chat operations with Supabase
export const chatService = {
  // Get all chat sessions for the current user
  async getChatSessions(userId) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
    
    return data;
  },
  
  // Create a new chat session
  async createChatSession(userId, title = 'New Chat', preview = '') {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([
        { user_id: userId, title, preview }
      ])
      .select();
    
    if (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
    
    return data[0];
  },
  
  // Update a chat session
  async updateChatSession(sessionId, updates) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select();
    
    if (error) {
      console.error('Error updating chat session:', error);
      throw error;
    }
    
    return data[0];
  },
  
  // Delete a chat session
  async deleteChatSession(sessionId) {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);
    
    if (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
    
    return true;
  },
  
  // Save a message to a chat session
  async saveMessage(sessionId, message) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        { 
          session_id: sessionId, 
          content: message.text, 
          is_user: message.isUser 
        }
      ])
      .select();
    
    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }
    
    return {
      id: data[0].id,
      text: data[0].content,
      isUser: data[0].is_user,
      timestamp: data[0].created_at
    };
  },
  
  // Get all messages for a chat session
  async getChatMessages(sessionId) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
    
    return data.map(msg => ({
      id: msg.id,
      text: msg.content,
      isUser: msg.is_user,
      timestamp: msg.created_at
    }));
  },
  
  // Get a specific message by ID
  async getMessage(messageId) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
    
    return {
      id: data.id,
      text: data.content,
      isUser: data.is_user,
      timestamp: data.created_at
    };
  },
  
  // Update a message
  async updateMessage(messageId, updates) {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ content: updates.text })
      .eq('id', messageId)
      .select();
    
    if (error) {
      console.error('Error updating message:', error);
      throw error;
    }
    
    return {
      id: data[0].id,
      text: data[0].content,
      isUser: data[0].is_user,
      timestamp: data[0].created_at
    };
  }
}; 