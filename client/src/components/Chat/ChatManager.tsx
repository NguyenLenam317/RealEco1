import React from 'react';
import axios from 'axios';
import SessionStorageManager from '../../utils/sessionStorage';
import { ChatMessage } from '../../types';

const ChatManager = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');

  React.useEffect(() => {
    // Load existing chat history from sessionStorage
    const savedChatHistory = SessionStorageManager.getChatHistory();
    setMessages(savedChatHistory || []);
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Send message to server and get AI response
      const response = await axios.post('/api/chat/message', { content: newMessage });

      // Create user chat message object
      const userMessage: ChatMessage = {
        role: 'user',
        sender: 'user',
        content: newMessage
      };

      // Create AI response message object
      const aiMessage: ChatMessage = {
        role: 'assistant',
        sender: 'ai',
        content: response.data.response
      };

      // Update local state and sessionStorage
      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      SessionStorageManager.saveChatMessage(userMessage);
      SessionStorageManager.saveChatMessage(aiMessage);

      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, add an error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        sender: 'ai',
        content: 'Sorry, there was an error processing your message.'
      };
      setMessages([...messages, errorMessage]);
    }
  };

  const clearChat = () => {
    // Clear messages from local state and sessionStorage
    setMessages([]);
    SessionStorageManager.clearChatHistory();
  };

  return (
    <div>
      <div className="chat-messages">
        {messages.map((msg: ChatMessage, index: number) => (
          <div 
            key={index} 
            className={`message ${msg.role}`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={clearChat}>Clear Chat</button>
      </div>
    </div>
  );
};

export default ChatManager;
