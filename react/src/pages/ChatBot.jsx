import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiX } from 'react-icons/fi';
import axios from 'axios';
import PropTypes from 'prop-types';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      text: 'Hello! I’m your Medical Assistant. How can I help you today?',
      sender: 'bot',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      text: inputMessage,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyFormatted = messages
        .map(({ text, sender }) => `${sender === 'user' ? 'User' : 'Assistant'}: ${text}`)
        .join('\n');

      const prompt = `You are a helpful medical assistant. Always respond in English.\n${historyFormatted}\nUser: ${inputMessage}\nAssistant:`;

      const response = await axios.post(
        'http://localhost:3000/api/chat',
        { message: prompt },
        { timeout: 15000 }
      );

      const botReply = response.data?.response || 'Sorry, I couldn’t generate a response.';

      const botMessage = {
        text: botReply,
        sender: 'bot',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat request failed:', error.message);
      const errorMessage = {
        text:
          error.code === 'ECONNABORTED'
            ? '⚠️ Request timed out. Please try again.'
            : '⚠️ Sorry, I’m having trouble connecting. Please try again later.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      className="chat-container"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chat-header">
        <span className="chat-title">Medical Assistant</span>
        <button
          className="chat-close"
          onClick={onClose}
          aria-label="Close chat"
        >
          <FiX />
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          aria-label="Chat input"
          disabled={isLoading}
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={isLoading || !inputMessage.trim()}
          aria-label="Send message"
        >
          <FiSend />
        </button>
      </div>
    </motion.div>
  );
};

ChatBot.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ChatBot;