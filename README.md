# Real-time Video Calling & Chat Application

A secure, end-to-end encrypted one-to-one video calling and chatting application built with React, Node.js, and WebRTC.

## Features

- 🎥 **Real-time Video Calling**: High-quality peer-to-peer video communication using WebRTC
- 💬 **Encrypted Chat**: AES-256 encrypted text messaging
- 🔒 **End-to-End Encryption**: WebRTC's built-in encryption for video/audio + additional message encryption
- 🚀 **No Authentication Required**: Simple room ID-based connection
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Socket.io
- **WebRTC**: Native WebRTC APIs for peer-to-peer connections
- **Encryption**: crypto-js (AES-256) for chat messages
- **Signaling**: Socket.io for WebRTC signaling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with WebRTC support (Chrome, Firefox, Safari, Edge)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Calling Application"
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `client` directory:

```bash
cd client
cp .env.example .env
```

Edit `.env` and set your socket server URL:
- For local development: `VITE_SOCKET_URL=http://localhost:3001`
- For production: Replace with your deployed server URL

## Running the Application

### Development Mode

1. **Start the Backend Server**:
   ```bash
   cd server
   npm start
   ```
   The server will run on `http://localhost:3001`

2. **Start the Frontend**:
   ```bash
   cd client
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or another port if 5173 is occupied)

3. **Open the Application**:
   - Open your browser and navigate to the frontend URL
   - Create a room or join an existing room using a room ID
   - Share the room ID with another user to start a video call

## Usage

1. **Create a Room**: Click "Create Room" to generate a unique room ID
2. **Share Room ID**: Copy the room ID and share it with the person you want to call
3. **Join Room**: The other person enters the room ID and clicks "Join Room"
4. **Start Calling**: Once both users are in the room, the video call will start automatically
5. **Chat**: Use the chat panel on the right to send encrypted messages
6. **Controls**: 
   - Mute/Unmute audio
   - Turn video on/off
   - End call

## Deployment

### Frontend (Vercel)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd client
   vercel
   ```

3. **Set Environment Variable**:
   - In Vercel dashboard, go to your project settings
   - Add `VITE_SOCKET_URL` with your backend server URL

### Backend (Railway/Render)

The backend requires WebSocket support, so it cannot be deployed on Vercel. Use one of these alternatives:

#### Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Select the `server` directory
4. Set `PORT` environment variable (Railway will provide one automatically)
5. Deploy

#### Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Deploy

### Important Notes

- After deploying the backend, update the `VITE_SOCKET_URL` in your frontend `.env` file and redeploy
- Ensure your backend server URL is accessible (CORS configured)
- For production, consider using HTTPS for better security
- WebRTC works best with HTTPS in production (some browsers require it)

## Security Features

- **WebRTC Encryption**: All video/audio streams are encrypted using DTLS/SRTP
- **Message Encryption**: Chat messages are encrypted using AES-256 with a key derived from the room ID
- **No Server Storage**: Messages and video streams are not stored on the server
- **Room-based Access**: Access controlled by room ID (share securely)

## Project Structure

```
Calling Application/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Home.jsx    # Room creation/joining
│   │   │   ├── VideoCall.jsx # Main video call component
│   │   │   └── Chat.jsx    # Chat component
│   │   ├── utils/          # Utility functions
│   │   │   ├── encryption.js # AES-256 encryption
│   │   │   ├── socket.js   # Socket.io client
│   │   │   └── webrtc.js   # WebRTC utilities
│   │   └── App.jsx         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Express + Socket.io server
│   └── package.json
└── README.md
```

## Troubleshooting

### Video/Audio not working
- Check browser permissions for camera/microphone
- Ensure you're using HTTPS in production (or localhost for development)
- Check browser console for errors

### Connection issues
- Verify the backend server is running and accessible
- Check that `VITE_SOCKET_URL` is correctly set
- Ensure firewall/network allows WebSocket connections

### Messages not encrypting/decrypting
- Ensure both users are using the same room ID
- Check browser console for encryption errors

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

