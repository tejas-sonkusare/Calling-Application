import { useState } from 'react';
import { CopyIcon, LockIcon } from './Icons';
import './Home.css';

function Home({ onJoinRoom }) {
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateRoomId = () => {
    // Generate a random room ID
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsCreating(true);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim());
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="app-header">
          <LockIcon className="lock-icon" />
          <h1>Video Chat App</h1>
        </div>
        <p className="subtitle">Secure end-to-end encrypted video calling</p>
        
        {!isCreating ? (
          <div className="home-actions">
            <button onClick={handleCreateRoom} className="btn btn-primary">
              Create Room
            </button>
            <div className="divider">
              <span>OR</span>
            </div>
            <div className="join-section">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                className="room-input"
                autoFocus
              />
              <button 
                onClick={handleJoinRoom} 
                className="btn btn-secondary"
                disabled={!roomId.trim()}
              >
                Join Room
              </button>
            </div>
          </div>
        ) : (
          <div className="room-created">
            <p className="room-label">Your Room ID:</p>
            <div className="room-id-display">
              <code>{roomId}</code>
              <button onClick={handleCopyRoomId} className={`btn btn-copy ${copied ? 'copied' : ''}`}>
                <CopyIcon className="copy-icon" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="room-hint">Share this Room ID with your friend to start the call</p>
            <button onClick={handleJoinRoom} className="btn btn-primary">
              Enter Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

