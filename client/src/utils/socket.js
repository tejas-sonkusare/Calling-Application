import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;

/**
 * Initialize and connect to the signaling server
 * @returns {Socket} Socket.io instance
 */
export function initializeSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
      console.log('Connected to signaling server:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }
  
  return socket;
}

/**
 * Get the current socket instance
 * @returns {Socket|null} Socket.io instance or null if not initialized
 */
export function getSocket() {
  return socket;
}

/**
 * Disconnect from the signaling server
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

