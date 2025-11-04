# Application Testing Guide

## Test Environment Setup

✅ **Backend Server**: Running on port 3001
✅ **Frontend Server**: Running on port 5173

## Test Checklist

### 1. Home Page Functionality

#### Test: Create Room
- [ ] Click "Create Room" button
- [ ] Verify room ID is generated and displayed
- [ ] Verify room ID format is valid (alphanumeric string)
- [ ] Check copy button appears

#### Test: Copy Room ID
- [ ] Click "Copy" button
- [ ] Verify "Copied!" message appears
- [ ] Verify room ID is actually copied to clipboard
- [ ] Paste clipboard and verify it matches displayed room ID

#### Test: Join Room
- [ ] Enter a room ID in the input field
- [ ] Click "Join Room" button
- [ ] Verify navigation to video call screen
- [ ] Test pressing Enter key to join room

#### Test: UI Animations
- [ ] Verify smooth fade-in animation on page load
- [ ] Verify button hover effects
- [ ] Verify gradient animation on background
- [ ] Check lock icon animation

### 2. Video Call Functionality

#### Test: Camera and Microphone Access
- [ ] Verify browser permission prompt appears
- [ ] Grant camera/mic permissions
- [ ] Verify local video appears in bottom-right corner
- [ ] Verify video is muted (no echo)

#### Test: Connection Establishment
- [ ] Open application in two different browser windows/tabs
- [ ] Create room in first window
- [ ] Join same room in second window
- [ ] Verify connection status changes to "Connected"
- [ ] Verify remote video appears in main view
- [ ] Verify local video appears in small window

#### Test: Video Controls
- [ ] Click video toggle button (camera on/off)
- [ ] Verify video track is disabled/enabled
- [ ] Verify button icon changes (VideoIcon ↔ VideoOffIcon)
- [ ] Verify button state changes (active ↔ inactive)

#### Test: Audio Controls
- [ ] Click microphone toggle button (mute/unmute)
- [ ] Verify audio track is disabled/enabled
- [ ] Verify button icon changes (MicIcon ↔ MicOffIcon)
- [ ] Verify button state changes (active ↔ inactive)

#### Test: Screen Sharing
- [ ] Click screen share button
- [ ] Verify browser screen share dialog appears
- [ ] Select screen/window to share
- [ ] Verify local video switches to screen share
- [ ] Verify "Sharing Screen" indicator appears
- [ ] Verify remote peer sees screen share
- [ ] Click screen share again to stop
- [ ] Verify camera view returns
- [ ] Verify screen share indicator disappears

#### Test: Call Duration Timer
- [ ] Verify timer starts when connection is established
- [ ] Verify timer displays in MM:SS format
- [ ] Wait 1 minute and verify timer shows 01:00
- [ ] Verify timer continues counting correctly

#### Test: Connection Quality Indicator
- [ ] Verify signal icon appears
- [ ] Verify icon color changes based on connection quality
- [ ] Green = excellent/good, Yellow = fair, Red = poor
- [ ] Verify quality updates every 5 seconds

#### Test: Connection Status
- [ ] Verify status shows "Connecting..." initially
- [ ] Verify status changes to "Connected" when peer joins
- [ ] Test connection lost scenario (close one window)
- [ ] Verify status shows "Connection Lost"

### 3. Chat Functionality

#### Test: Send Message
- [ ] Type a message in chat input
- [ ] Click "Send" button
- [ ] Verify message appears in chat (right-aligned, own style)
- [ ] Verify message is encrypted before sending
- [ ] Verify timestamp appears on message

#### Test: Receive Message
- [ ] Send message from first window
- [ ] Verify message appears in second window (left-aligned, other style)
- [ ] Verify message is decrypted correctly
- [ ] Verify message content matches sent message

#### Test: Message Encryption
- [ ] Send multiple messages
- [ ] Verify messages are encrypted (check network tab)
- [ ] Verify messages are decrypted correctly on receiver side
- [ ] Verify encryption key is derived from room ID

#### Test: Chat UI
- [ ] Verify chat panel slides in from right
- [ ] Verify messages animate in smoothly
- [ ] Verify scrollbar appears when messages overflow
- [ ] Verify "Encrypted" badge with lock icon
- [ ] Verify empty state message when no messages

#### Test: Chat Input
- [ ] Verify input field focuses on click
- [ ] Verify send button works on Enter key
- [ ] Verify input clears after sending
- [ ] Verify placeholder text displays

### 4. End Call Functionality

#### Test: End Call Button
- [ ] Click end call button (red phone icon)
- [ ] Verify all media streams stop
- [ ] Verify peer connection closes
- [ ] Verify socket disconnects
- [ ] Verify navigation back to home screen
- [ ] Verify cleanup of all resources

### 5. Error Handling

#### Test: No Camera/Microphone
- [ ] Deny camera/microphone permissions
- [ ] Verify error message appears
- [ ] Verify connection status shows "Error"

#### Test: Invalid Room ID
- [ ] Try to join with invalid room ID
- [ ] Verify appropriate error handling

#### Test: Network Issues
- [ ] Disconnect internet temporarily
- [ ] Verify connection status updates
- [ ] Reconnect internet
- [ ] Verify connection attempts to re-establish

### 6. Mobile Responsiveness

#### Test: Mobile View
- [ ] Resize browser to mobile width (< 768px)
- [ ] Verify chat panel moves to bottom
- [ ] Verify video layout adjusts
- [ ] Verify controls remain accessible
- [ ] Verify local video size adjusts
- [ ] Verify all buttons are tappable

### 7. Performance

#### Test: Memory Leaks
- [ ] Create and join multiple rooms
- [ ] End calls multiple times
- [ ] Verify no memory leaks in browser console
- [ ] Verify all media tracks are properly stopped

#### Test: Resource Cleanup
- [ ] End call
- [ ] Verify all intervals are cleared
- [ ] Verify all refs are nullified
- [ ] Verify no console errors

### 8. UI/UX Polish

#### Test: Animations
- [ ] Verify all animations are smooth (60fps)
- [ ] Verify no janky animations
- [ ] Verify loading spinners work
- [ ] Verify fade-in/slide-in effects

#### Test: Visual Feedback
- [ ] Verify button hover states
- [ ] Verify button active states
- [ ] Verify copy button feedback
- [ ] Verify message send feedback

## Automated Testing Commands

### Check Server Status
```bash
# Check backend
lsof -ti:3001 && echo "Backend running" || echo "Backend not running"

# Check frontend  
lsof -ti:5173 && echo "Frontend running" || echo "Frontend not running"
```

### Manual Testing Steps

1. **Start Testing**:
   - Open http://localhost:5173 in browser window 1
   - Open http://localhost:5173 in browser window 2 (or incognito)

2. **Test Room Creation**:
   - Window 1: Click "Create Room"
   - Copy room ID
   - Window 2: Paste room ID and click "Join Room"

3. **Test Video Call**:
   - Grant permissions in both windows
   - Verify video appears
   - Test all controls

4. **Test Chat**:
   - Send messages from both windows
   - Verify encryption/decryption

5. **Test Screen Share**:
   - Click screen share in one window
   - Verify screen appears in other window

6. **End Call**:
   - Click end call button
   - Verify return to home screen

## Known Issues to Check

- [ ] Screen sharing works on all browsers (Chrome, Firefox, Safari)
- [ ] Connection quality indicator updates correctly
- [ ] Timer doesn't reset when connection drops
- [ ] Messages don't duplicate
- [ ] No memory leaks after multiple calls

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Notes

- All features require WebRTC support
- HTTPS may be required for production
- Screen sharing requires browser support
- Camera/microphone permissions are required

