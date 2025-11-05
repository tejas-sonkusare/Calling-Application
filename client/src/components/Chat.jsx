import { useState, useEffect, useRef } from 'react';
import { encryptMessage, decryptMessage, encryptFile, decryptFile } from '../utils/encryption';
import { getSocket } from '../utils/socket';
import { fileToBase64, formatFileSize, getFileIcon, validateFileSize, validateImage } from '../utils/fileUtils';
import { startRecording, stopRecording, blobToBase64, formatDuration as formatVoiceDuration } from '../utils/voiceUtils';
import { renderTextWithLinks } from '../utils/linkUtils';
import { LockIcon } from './Icons';
import EmojiPicker from './EmojiPicker';
import MessageOptions from './MessageOptions';
import './Chat.css';

function Chat({ roomId, messages, setMessages }) {
  const [messageInput, setMessageInput] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const socket = getSocket();

  // Generate unique message ID
  const generateMessageId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  useEffect(() => {
    if (socket) {
      const handleChatMessage = (data) => {
        try {
          let messageData;
          const messageId = data.messageId || generateMessageId();
          
          if (data.type === 'file' || data.type === 'image') {
            const decryptedData = decryptFile(data.fileData, roomId);
            messageData = {
              id: messageId,
              type: data.type,
              text: data.fileName || 'File',
              fileData: decryptedData,
              fileName: data.fileName,
              fileSize: data.fileSize,
              mimeType: data.mimeType,
              isOwn: false,
              timestamp: new Date(data.timestamp || Date.now()),
              status: 'delivered',
              reactions: data.reactions || [],
              replyTo: data.replyTo || null
            };
          } else if (data.type === 'reaction') {
            // Handle reaction update
            setMessages(prev => prev.map(msg => 
              msg.id === data.messageId 
                ? { ...msg, reactions: [...(msg.reactions || []), { emoji: data.reaction, userId: data.from }] }
                : msg
            ));
            return;
          } else if (data.type === 'edit') {
            // Handle message edit
            setMessages(prev => prev.map(msg => 
              msg.id === data.messageId 
                ? { ...msg, text: decryptMessage(data.message, roomId), edited: true }
                : msg
            ));
            return;
          } else if (data.type === 'delete') {
            // Handle message delete
            setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
            return;
          } else if (data.type === 'voice') {
            const decryptedData = decryptFile(data.fileData, roomId);
            messageData = {
              id: messageId,
              type: 'voice',
              fileData: decryptedData,
              duration: data.duration,
              fileName: data.fileName || 'Voice message',
              isOwn: false,
              timestamp: new Date(data.timestamp || Date.now()),
              status: 'delivered',
              reactions: data.reactions || [],
              replyTo: data.replyTo || null
            };
          } else {
            // Decrypt text message
            const decrypted = decryptMessage(data.message, roomId);
            messageData = {
              id: messageId,
              type: 'text',
              text: decrypted,
              isOwn: false,
              timestamp: new Date(data.timestamp || Date.now()),
              status: 'delivered',
              reactions: data.reactions || [],
              replyTo: data.replyTo || null
            };
          }
          
          setMessages(prev => [...prev, messageData]);
          
          // Mark as read
          if (socket) {
            socket.emit('message-read', { roomId, messageId });
          }
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

      const handleMessageRead = (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId && msg.isOwn
            ? { ...msg, status: 'read' }
            : msg
        ));
      };

      socket.on('chat-message', handleChatMessage);
      socket.on('typing', handleTyping);
      socket.on('message-read', handleMessageRead);

      return () => {
        socket.off('chat-message', handleChatMessage);
        socket.off('typing', handleTyping);
        socket.off('message-read', handleMessageRead);
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
        const messageId = generateMessageId();
        const encrypted = encryptMessage(messageInput, roomId);
        
        socket.emit('chat-message', {
          roomId,
          message: encrypted,
          type: 'text',
          messageId,
          timestamp: Date.now(),
          replyTo: replyingTo?.id || null
        });

        setMessages(prev => [...prev, {
          id: messageId,
          type: 'text',
          text: messageInput,
          isOwn: true,
          timestamp: new Date(),
          status: 'sent',
          reactions: [],
          replyTo: replyingTo,
          edited: false
        }]);

        // Mark as delivered after a short delay (simulating network)
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'delivered' } : msg
          ));
        }, 500);

        setMessageInput('');
        setReplyingTo(null);
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
      const messageId = generateMessageId();
      const base64Data = await fileToBase64(file);
      const encryptedFileData = encryptFile(base64Data, roomId);

      socket.emit('chat-message', {
        roomId,
        type: type,
        fileData: encryptedFileData,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        messageId,
        timestamp: Date.now(),
        replyTo: replyingTo?.id || null
      });

      setMessages(prev => [...prev, {
        id: messageId,
        type: type,
        text: file.name,
        fileData: base64Data,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        isOwn: true,
        timestamp: new Date(),
        status: 'sent',
        reactions: [],
        replyTo: replyingTo
      }]);

      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleReact = (messageId, emoji) => {
    if (socket) {
      socket.emit('chat-message', {
        roomId,
        type: 'reaction',
        messageId,
        reaction: emoji
      });

      setMessages(prev => prev.map(msg => 
        msg.id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), { emoji, userId: socket.id }] }
          : msg
      ));
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setIsEmojiPickerOpen(false);
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setMessageInput(message.text);
    setIsEmojiPickerOpen(false);
  };

  const handleSaveEdit = (e) => {
    e?.preventDefault();
    if (editingMessage && messageInput.trim() && socket) {
      const encrypted = encryptMessage(messageInput, roomId);
      socket.emit('chat-message', {
        roomId,
        type: 'edit',
        messageId: editingMessage.id,
        message: encrypted
      });

      setMessages(prev => prev.map(msg => 
        msg.id === editingMessage.id
          ? { ...msg, text: messageInput, edited: true }
          : msg
      ));

      setMessageInput('');
      setEditingMessage(null);
    }
  };

  const handleDelete = (messageId) => {
    if (socket && window.confirm('Delete this message?')) {
      socket.emit('chat-message', {
        roomId,
        type: 'delete',
        messageId
      });

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
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

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingDuration(0);
      await startRecording();

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      const audioBlob = await stopRecording();
      const base64Data = await blobToBase64(audioBlob);
      const encryptedFileData = encryptFile(base64Data, roomId);
      const messageId = generateMessageId();

      socket.emit('chat-message', {
        roomId,
        type: 'voice',
        fileData: encryptedFileData,
        fileName: `voice-${Date.now()}.webm`,
        fileSize: audioBlob.size,
        mimeType: 'audio/webm',
        duration: recordingDuration,
        messageId,
        timestamp: Date.now(),
        replyTo: replyingTo?.id || null
      });

      setMessages(prev => [...prev, {
        id: messageId,
        type: 'voice',
        fileData: base64Data,
        duration: recordingDuration,
        fileName: `voice-${Date.now()}.webm`,
        mimeType: 'audio/webm',
        isOwn: true,
        timestamp: new Date(),
        status: 'sent',
        reactions: [],
        replyTo: replyingTo
      }]);

      setReplyingTo(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('Failed to save voice message.');
    } finally {
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(today - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return messageDate.toLocaleDateString([], { weekday: 'long' });
    return messageDate.toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    if (status === 'read') return '✓✓';
    if (status === 'delivered') return '✓✓';
    if (status === 'sent') return '✓';
    return '';
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const renderReply = (replyTo) => {
    if (!replyTo) return null;
    const originalMessage = messages.find(m => m.id === replyTo.id || m.id === replyTo);
    if (!originalMessage) return null;

    return (
      <div className="message-reply">
        <div className="reply-line"></div>
        <div className="reply-content">
          <p className="reply-author">{originalMessage.isOwn ? 'You' : 'Friend'}</p>
          <p className="reply-text">
            {originalMessage.type === 'image' ? '🖼️ Image' : 
             originalMessage.type === 'file' ? `📎 ${originalMessage.fileName}` :
             originalMessage.text}
          </p>
        </div>
      </div>
    );
  };

  const renderMessage = (msg, index) => {
    const showDate = index === 0 || 
      new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

    const messageContent = (
      <>
        {msg.replyTo && renderReply(msg.replyTo)}
        {msg.type === 'image' ? (
          <div className="image-message">
            <img 
              src={`data:${msg.mimeType};base64,${msg.fileData}`} 
              alt={msg.fileName}
              className="message-image"
              onClick={() => window.open(`data:${msg.mimeType};base64,${msg.fileData}`, '_blank')}
            />
            <p className="image-caption">{msg.fileName}</p>
          </div>
        ) : msg.type === 'file' ? (
          <div className="file-message">
            <div className="file-icon">{getFileIcon(msg.mimeType)}</div>
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
        ) : msg.type === 'voice' ? (
          <div className="voice-message">
            <audio controls className="voice-player">
              <source src={`data:${msg.mimeType || 'audio/webm'};base64,${msg.fileData}`} />
            </audio>
            <span className="voice-duration">{formatVoiceDuration(msg.duration || 0)}</span>
          </div>
        ) : (
          <p>{msg.text ? renderTextWithLinks(msg.text) : ''}</p>
        )}
        <div className="message-footer">
          <span className="message-time">{formatTime(msg.timestamp)}</span>
          {msg.edited && <span className="edited-badge">edited</span>}
          {msg.isOwn && msg.status && (
            <span className={`message-status ${msg.status}`}>
              {getStatusIcon(msg.status)}
            </span>
          )}
          {msg.reactions && msg.reactions.length > 0 && (
            <div className="message-reactions">
              {Object.entries(msg.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {})).map(([emoji, count]) => (
                <span key={emoji} className="reaction-badge">
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </>
    );

    return (
      <div key={msg.id || index}>
        {showDate && (
          <div className="date-divider">
            <span>{formatDate(msg.timestamp)}</span>
          </div>
        )}
        <div className={`chat-message ${msg.isOwn ? 'own' : 'other'}`}>
          <div className="message-content">
            {messageContent}
            <MessageOptions
              message={msg}
              onReply={() => handleReply(msg)}
              onReact={(emoji) => handleReact(msg.id, emoji)}
              onEdit={() => handleEdit(msg)}
              onDelete={() => handleDelete(msg.id)}
              isOwn={msg.isOwn}
            />
          </div>
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
        <div className="header-left">
          <h3>Chat</h3>
          <button
            className="search-btn"
            onClick={() => setShowSearch(!showSearch)}
            title="Search messages"
          >
            🔍
          </button>
        </div>
        <span className="encrypted-badge">
          <LockIcon className="lock-icon-small" />
          Encrypted
        </span>
      </div>

      {showSearch && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={() => { setSearchQuery(''); setShowSearch(false); }}>
            ✕
          </button>
        </div>
      )}
      
      <div className="chat-messages">
        {filteredMessages.length === 0 ? (
          <div className="chat-empty">
            <p>{searchQuery ? 'No messages found' : 'No messages yet. Start the conversation!'}</p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => renderMessage(msg, index))
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

      {replyingTo && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <p className="reply-preview-label">Replying to:</p>
            <p className="reply-preview-text">
              {replyingTo.type === 'image' ? '🖼️ Image' : 
               replyingTo.type === 'file' ? `📎 ${replyingTo.fileName}` :
               replyingTo.text}
            </p>
          </div>
          <button onClick={() => setReplyingTo(null)}>✕</button>
        </div>
      )}

      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <p>Recording... {formatVoiceDuration(recordingDuration)}</p>
          <button onClick={handleStopRecording}>Stop</button>
        </div>
      )}

      {editingMessage && (
        <div className="edit-preview">
          <p>Editing message...</p>
          <button onClick={() => { setEditingMessage(null); setMessageInput(''); }}>Cancel</button>
        </div>
      )}

      <div className="chat-input-container">
        <form onSubmit={editingMessage ? handleSaveEdit : handleSendMessage} className="chat-input-form">
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
              className={`attach-btn ${isRecording ? 'recording' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                if (!isRecording) handleStartRecording();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                if (isRecording) handleStopRecording();
              }}
              onMouseLeave={(e) => {
                if (isRecording) handleStopRecording();
              }}
              title="Hold to record voice"
            >
              {isRecording ? '🎤' : '🎙️'}
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
              placeholder={editingMessage ? "Edit message..." : "Type a message..."}
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
            {uploading ? '⏳' : editingMessage ? '💾' : '📤'}
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
