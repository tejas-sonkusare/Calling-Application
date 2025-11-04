import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;

/**
 * Initialize and connect to the signaling server
 * @returns {Socket} Socket.io instance
 */
export function initializeSocket() {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    console.log('Connecting to signaling server:', url);
    
    socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
      console.log('✅ Connected to signaling server:', socket.id);
      console.log('Server URL:', url);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from signaling server. Reason:', reason);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      console.error('⚠️ Make sure:');
      console.error('   1. Backend server is deployed');
      console.error('   2. VITE_SOCKET_URL is set in Vercel');
      console.error('   3. Backend URL is correct:', url);
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });
    
    socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message);
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

