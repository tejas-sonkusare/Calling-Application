import { useState } from 'react';
import Home from './components/Home';
import VideoCall from './components/VideoCall';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState(null);

  const handleJoinRoom = (id) => {
    setRoomId(id);
  };

  const handleLeaveRoom = () => {
    // Clear room ID to redirect to home page
    setRoomId(null);
  };

  return (
    <div className="App">
      {!roomId ? (
        <Home onJoinRoom={handleJoinRoom} />
      ) : (
        <VideoCall roomId={roomId} onLeave={handleLeaveRoom} />
      )}
    </div>
  );
}

export default App;
