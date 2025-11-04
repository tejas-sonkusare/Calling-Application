import { useState, useEffect, useRef } from 'react';
import { encryptMessage, decryptMessage, encryptFile, decryptFile } from '../utils/encryption';
import { getSocket } from '../utils/socket';
import { fileToBase64, formatFileSize, getFileIcon, validateFileSize, validateImage } from '../utils/fileUtils';
import { LockIcon } from './Icons';
import EmojiPicker from './EmojiPicker';
import './Chat.css';

function Chat({ roomId, messages, setMessages }) {
  const [messageInput, setMessageInput] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    if (socket) {
      const handleChatMessage = (data) => {
        try {
          let messageData;
          
          if (data.type === 'file' || data.type === 'image') {
            // Decrypt file/image data
            const decryptedData = decryptFile(data.fileData, roomId);
            messageData = {
              type: data.type,
              text: data.fileName || 'File',
              fileData: decryptedData,
              fileName: data.fileName,
              fileSize: data.fileSize,
              mimeType: data.mimeType,
              isOwn: false,
              timestamp: new Date(data.timestamp || Date.now())
            };
          } else {
            // Decrypt text message
            const decrypted = decryptMessage(data.message, roomId);
            messageData = {
              type: 'text',
              text: decrypted,
              isOwn: false,
              timestamp: new Date(data.timestamp || Date.now())
            };
          }
          
          setMessages(prev => [...prev, messageData]);
        } catch (error) {
          console.error('Failed to decrypt message:', error);
        }
      };

      const handleTyping = (data) => {
        if (data.userId !== socket.id) {
          setOtherUserTyping(true);
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      };

      socket.on('chat-message', handleChatMessage);
      socket.on('typing', handleTyping);

      return () => {
        socket.off('chat-message', handleChatMessage);
        socket.off('typing', handleTyping);
      };
    }
  }, [socket, roomId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEmojiPickerOpen && !event.target.closest('.emoji-picker') && !event.target.closest('.attach-btn')) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEmojiPickerOpen]);

  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing', { roomId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !uploading) || !socket) return;

    try {
      if (messageInput.trim()) {
        const encrypted = encryptMessage(messageInput, roomId);
        socket.emit('chat-message', {
          roomId,
          message: encrypted,
          type: 'text',
          timestamp: Date.now()
        });

        setMessages(prev => [...prev, {
          type: 'text',
          text: messageInput,
          isOwn: true,
          timestamp: new Date()
        }]);

        setMessageInput('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleFileUpload = async (file, type = 'file') => {
    if (!file) return;

    if (!validateFileSize(file)) {
      alert('File size must be less than 10MB');
      return;
    }

    if (type === 'image' && !validateImage(file)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    setUploading(true);

    try {
      const base64Data = await fileToBase64(file);
      const encryptedFileData = encryptFile(base64Data, roomId);

      socket.emit('chat-message', {
        roomId,
        type: type,
        fileData: encryptedFileData,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        timestamp: Date.now()
      });

      // Add to messages immediately
      setMessages(prev => [...prev, {
        type: type,
        text: file.name,
        fileData: base64Data,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        isOwn: true,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const type = file.type.startsWith('image/') ? 'image' : 'file';
    await handleFileUpload(file, type);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (msg, index) => {
    if (msg.type === 'image') {
      return (
        <div key={index} className={`chat-message ${msg.isOwn ? 'own' : 'other'}`}>
          <div className="message-content">
            <div className="image-message">
              <img 
                src={`data:${msg.mimeType};base64,${msg.fileData}`} 
                alt={msg.fileName}
                className="message-image"
                onClick={() => window.open(`data:${msg.mimeType};base64,${msg.fileData}`, '_blank')}
              />
              <p className="image-caption">{msg.fileName}</p>
            </div>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
        </div>
      );
    }

    if (msg.type === 'file') {
      const fileIcon = getFileIcon(msg.mimeType);
      return (
        <div key={index} className={`chat-message ${msg.isOwn ? 'own' : 'other'}`}>
          <div className="message-content">
            <div className="file-message">
              <div className="file-icon">{fileIcon}</div>
              <div className="file-info">
                <p className="file-name">{msg.fileName}</p>
                <p className="file-size">{formatFileSize(msg.fileSize)}</p>
              </div>
              <button 
                className="download-btn"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `data:${msg.mimeType};base64,${msg.fileData}`;
                  link.download = msg.fileName;
                  link.click();
                }}
              >
                ⬇️
              </button>
            </div>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className={`chat-message ${msg.isOwn ? 'own' : 'other'}`}>
        <div className="message-content">
          <p>{msg.text}</p>
          <span className="message-time">{formatTime(msg.timestamp)}</span>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`chat-container ${isDragging ? 'dragging' : ''}`}
      ref={chatContainerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="drag-overlay">
          <div className="drag-message">
            <p>📎 Drop file here to send</p>
          </div>
        </div>
      )}
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
          messages.map((msg, index) => renderMessage(msg, index))
        )}
        {otherUserTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="input-actions">
            <button
              type="button"
              className="attach-btn"
              onClick={() => imageInputRef.current?.click()}
              title="Send image"
            >
              📷
            </button>
            <button
              type="button"
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Send file"
            >
              📎
            </button>
            <button
              type="button"
              className="attach-btn"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              title="Emoji"
            >
              😊
            </button>
          </div>
          
          <div className="input-wrapper">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="chat-input"
            />
            {isEmojiPickerOpen && (
              <EmojiPicker onEmojiSelect={handleEmojiSelect} isOpen={isEmojiPickerOpen} />
            )}
          </div>

          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={!messageInput.trim() && !uploading}
          >
            {uploading ? '⏳' : '📤'}
          </button>
        </form>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e.target.files[0], 'image')}
        />
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e.target.files[0], 'file')}
        />
      </div>
    </div>
  );
}

export default Chat;
