import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeSocket, getSocket, disconnectSocket } from '../utils/socket';
import {
  createPeerConnection,
  getUserMedia,
  getDisplayMedia,
  addLocalStream,
  replaceVideoTrack,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
  cleanupPeerConnection
} from '../utils/webrtc';
import Chat from './Chat';
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, PhoneIcon, ShareScreenIcon, SignalIcon } from './Icons';
import './VideoCall.css';

function VideoCall({ roomId, onLeave }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const statsIntervalRef = useRef(null);

  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const stopStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    // Stop timers
    stopCallTimer();
    stopStatsMonitoring();
    
    // Stop local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Stop screen share stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    // Cleanup peer connection
    if (peerConnectionRef.current) {
      cleanupPeerConnection(peerConnectionRef.current);
      peerConnectionRef.current = null;
    }

    // Disconnect socket
    disconnectSocket();
  }, [stopCallTimer, stopStatsMonitoring]);

  const startCall = useCallback(async () => {
    try {
      // Get user media
      const stream = await getUserMedia();
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      addLocalStream(pc, stream);

      // Handle remote stream
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        setConnectionStatus('Connected');
        setIsLoading(false);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            roomId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        setConnectionStatus(state);
        if (state === 'connected') {
          setIsLoading(false);
          if (!callTimerRef.current) {
            startCallTimer();
          }
          if (!statsIntervalRef.current) {
            startStatsMonitoring(pc);
          }
        } else if (state === 'disconnected' || state === 'failed') {
          setConnectionStatus('Connection Lost');
          stopCallTimer();
          stopStatsMonitoring();
        }
      };

      // Join room
      if (socketRef.current) {
        socketRef.current.emit('join-room', roomId);

        // Listen for room users
        socketRef.current.on('room-users', async ({ users }) => {
          if (users.length > 0) {
            // Another user is already in the room, create offer
            const offer = await createOffer(pc);
            socketRef.current.emit('offer', {
              roomId,
              offer
            });
          }
        });

        // Listen for user joined
        socketRef.current.on('user-joined', async () => {
          // New user joined, create offer
          const offer = await createOffer(pc);
          socketRef.current.emit('offer', {
            roomId,
            offer
          });
        });

        // Handle incoming offer
        socketRef.current.on('offer', async ({ offer }) => {
          const answer = await createAnswer(pc, offer);
          socketRef.current.emit('answer', {
            roomId,
            answer
          });
        });

        // Handle incoming answer
        socketRef.current.on('answer', async ({ answer }) => {
          await setRemoteDescription(pc, answer);
        });

        // Handle incoming ICE candidate
        socketRef.current.on('ice-candidate', async ({ candidate }) => {
          await addIceCandidate(pc, candidate);
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
      setIsLoading(false);
      setConnectionStatus('Error');
    }
  }, [roomId]);

  const startCallTimer = useCallback(() => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const startStatsMonitoring = (pc) => {
    statsIntervalRef.current = setInterval(async () => {
      try {
        const stats = await pc.getStats();
        let bytesReceived = 0;
        let bytesSent = 0;

        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            bytesReceived += report.bytesReceived || 0;
          }
          if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            bytesSent += report.bytesSent || 0;
          }
        });

        // Determine connection quality based on bandwidth
        // This is a simplified approach - in production, use more sophisticated metrics
        if (bytesReceived > 1000000 || bytesSent > 1000000) {
          setConnectionQuality('excellent');
        } else if (bytesReceived > 500000 || bytesSent > 500000) {
          setConnectionQuality('good');
        } else if (bytesReceived > 100000 || bytesSent > 100000) {
          setConnectionQuality('fair');
        } else {
          setConnectionQuality('poor');
        }
      } catch (error) {
        console.error('Error getting stats:', error);
      }
    }, 5000);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await getDisplayMedia();
        screenStreamRef.current = screenStream;
        
        const videoTrack = screenStream.getVideoTracks()[0];
        if (peerConnectionRef.current && localStreamRef.current) {
          replaceVideoTrack(peerConnectionRef.current, videoTrack, screenStream);
          
          // Update local video display
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          
          setIsScreenSharing(true);
          
          // Stop screen share when user clicks stop in browser
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }
      } else {
        // Stop screen sharing and return to camera
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        
        if (localStreamRef.current && peerConnectionRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            replaceVideoTrack(peerConnectionRef.current, videoTrack, localStreamRef.current);
            
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
            }
          }
        }
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      setIsScreenSharing(false);
    }
  };

  useEffect(() => {
    initializeSocket();
    socketRef.current = getSocket();
    startCall();

    return () => {
      cleanup();
    };
  }, [startCall, cleanup]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const handleEndCall = () => {
    // Cleanup all resources first
    cleanup();
    // Small delay to ensure cleanup completes before navigation
    setTimeout(() => {
      onLeave();
    }, 100);
  };

  return (
    <div className="video-call-container">
      <div className="video-section">
        <div className="video-grid">
          <div className="video-wrapper remote-video">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="video-element remote-video-element"
              />
            ) : (
              <div className="video-placeholder">
                <div className="loading-animation">
                  <div className="spinner"></div>
                </div>
                <p>Waiting for peer to join...</p>
                <p className="status">{connectionStatus}</p>
              </div>
            )}
          </div>

          <div className="video-wrapper local-video">
            {localStream ? (
              <>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="video-element local-video-element"
                />
                {isScreenSharing && <div className="screen-share-indicator">🖥️ Sharing Screen</div>}
              </>
            ) : (
              <div className="video-placeholder">
                <div className="loading-animation">
                  <div className="spinner"></div>
                </div>
                <p>Loading camera...</p>
              </div>
            )}
          </div>
        </div>

        <div className="controls">
          <button
            onClick={toggleAudio}
            className={`control-btn ${isAudioEnabled ? 'active' : 'inactive'}`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <MicIcon className="icon" /> : <MicOffIcon className="icon" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`control-btn ${isVideoEnabled ? 'active' : 'inactive'}`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <VideoIcon className="icon" /> : <VideoOffIcon className="icon" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`control-btn ${isScreenSharing ? 'screen-sharing' : ''}`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <ShareScreenIcon className="icon" />
          </button>
          <button
            onClick={handleEndCall}
            className="control-btn end-call"
            title="End call"
          >
            <PhoneIcon className="icon" />
          </button>
        </div>

        <div className="room-info">
          <div className="room-id-section">
            <p>Room ID: <code>{roomId}</code></p>
            <div className="call-info">
              <span className="call-duration">{formatDuration(callDuration)}</span>
              <SignalIcon className="signal-icon" quality={connectionQuality} />
            </div>
          </div>
          <span className={`status-indicator ${connectionStatus.toLowerCase().replace(' ', '-')}`}>
            {connectionStatus}
          </span>
        </div>
      </div>

      <div className="chat-section">
        <Chat roomId={roomId} messages={messages} setMessages={setMessages} />
      </div>
    </div>
  );
}

export default VideoCall;

