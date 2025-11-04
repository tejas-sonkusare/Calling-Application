#!/bin/bash

# Application Testing Script
# This script helps test the video calling application

echo "=========================================="
echo "Video Chat Application - Testing Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if servers are running
echo "Checking server status..."
echo ""

# Check backend
BACKEND_PID=$(lsof -ti:3001 2>/dev/null)
if [ -n "$BACKEND_PID" ]; then
    echo -e "${GREEN}✓${NC} Backend server is running on port 3001 (PID: $BACKEND_PID)"
else
    echo -e "${RED}✗${NC} Backend server is NOT running on port 3001"
    echo "   Start it with: cd server && npm start"
fi

# Check frontend
FRONTEND_PID=$(lsof -ti:5173 2>/dev/null)
if [ -n "$FRONTEND_PID" ]; then
    echo -e "${GREEN}✓${NC} Frontend server is running on port 5173 (PID: $FRONTEND_PID)"
else
    echo -e "${RED}✗${NC} Frontend server is NOT running on port 5173"
    echo "   Start it with: cd client && npm run dev"
fi

echo ""
echo "=========================================="
echo "Testing Checklist"
echo "=========================================="
echo ""
echo "1. Open http://localhost:5173 in Browser 1"
echo "2. Open http://localhost:5173 in Browser 2 (or incognito)"
echo ""
echo "Test Scenarios:"
echo ""
echo "A. Home Page Tests:"
echo "   - Create a room"
echo "   - Copy room ID"
echo "   - Join room with ID"
echo ""
echo "B. Video Call Tests:"
echo "   - Grant camera/mic permissions"
echo "   - Verify video appears"
echo "   - Test mute/unmute"
echo "   - Test camera on/off"
echo "   - Test screen sharing"
echo "   - Verify call timer"
echo "   - Verify connection quality"
echo ""
echo "C. Chat Tests:"
echo "   - Send messages"
echo "   - Verify encryption"
echo "   - Verify message display"
echo ""
echo "D. End Call Test:"
echo "   - Click end call button"
echo "   - Verify return to home"
echo ""
echo "=========================================="
echo "Browser Console Checks:"
echo "=========================================="
echo ""
echo "Open browser console (F12) and check for:"
echo "  - No errors in red"
echo "  - 'Connected to signaling server' message"
echo "  - Connection status updates"
echo ""
echo "=========================================="
echo "Network Checks:"
echo "=========================================="
echo ""
echo "Open browser DevTools > Network tab:"
echo "  - Verify WebSocket connection to ws://localhost:3001"
echo "  - Check for any failed requests"
echo ""
echo "=========================================="

