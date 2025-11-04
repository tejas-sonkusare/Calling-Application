import { useState, useEffect, useRef } from 'react';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { getSocket } from '../utils/socket';
import { LockIcon } from './Icons';
import './Chat.css';

function Chat({ roomId, messages, setMessages }) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    if (socket) {
      const handleChatMessage = (data) => {
        try {
          const decrypted = decryptMessage(data.message, roomId);
          setMessages(prev => [...prev, {
            text: decrypted,
            isOwn: false,
            timestamp: new Date()
          }]);
        } catch (error) {
          console.error('Failed to decrypt message:', error);
        }
      };

      socket.on('chat-message', handleChatMessage);

      return () => {
        socket.off('chat-message', handleChatMessage);
      };
    }
  }, [socket, roomId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket) return;

    try {
      const encrypted = encryptMessage(messageInput, roomId);
      socket.emit('chat-message', {
        roomId,
        message: encrypted
      });

      setMessages(prev => [...prev, {
        text: messageInput,
        isOwn: true,
        timestamp: new Date()
      }]);

      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat</h3>
        <span className="encrypted-badge">
          <LockIcon className="lock-icon-small" />
          Encrypted
        </span>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.isOwn ? 'own' : 'other'}`}>
              <div className="message-content">
                <p>{msg.text}</p>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;

