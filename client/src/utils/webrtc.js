/**
 * WebRTC utility functions for peer connection management
 */

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

/**
 * Create a new RTCPeerConnection
 * @returns {RTCPeerConnection} New peer connection instance
 */
export function createPeerConnection() {
  return new RTCPeerConnection(STUN_SERVERS);
}

/**
 * Get user media (camera and microphone)
 * @returns {Promise<MediaStream>} Media stream with video and audio
 */
export async function getUserMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
}

/**
 * Get display media (screen sharing)
 * @returns {Promise<MediaStream>} Media stream with screen share
 */
export async function getDisplayMedia() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    return stream;
  } catch (error) {
    console.error('Error accessing display media:', error);
    throw error;
  }
}

/**
 * Replace video track in peer connection
 * @param {RTCPeerConnection} peerConnection - Peer connection instance
 * @param {MediaStreamTrack} newTrack - New video track to add
 * @param {MediaStream} stream - Stream containing the track
 */
export function replaceVideoTrack(peerConnection, newTrack, stream) {
  const sender = peerConnection.getSenders().find(s => 
    s.track && s.track.kind === 'video'
  );
  if (sender) {
    sender.replaceTrack(newTrack);
  } else {
    peerConnection.addTrack(newTrack, stream);
  }
}

/**
 * Add local stream to peer connection
 * @param {RTCPeerConnection} peerConnection - Peer connection instance
 * @param {MediaStream} stream - Local media stream
 */
export function addLocalStream(peerConnection, stream) {
  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });
}

/**
 * Create and send WebRTC offer
 * @param {RTCPeerConnection} peerConnection - Peer connection instance
 * @returns {Promise<RTCSessionDescriptionInit>} Offer SDP
 */
export async function createOffer(peerConnection) {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
}

/**
 * Create and send WebRTC answer
 * @param {RTCPeerConnection} peerConnection - Peer connection instance
 * @param {RTCSessionDescriptionInit} offer - Received offer
 * @returns {Promise<RTCSessionDescriptionInit>} Answer SDP
 */
export async function createAnswer(peerConnection, offer) {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
}

/**
 * Set remote description from offer/answer
 * @param {RTCPeerConnection} peerConnection - Peer connection instance
 * @param {RTCSessionDescriptionInit} description - Offer or answer SDP
 */
export async function setRemoteDescription(peerConnection, description) {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
  } catch (error) {
    console.error('Error setting remote description:', error);
    throw error;
  }
}

/**
 * Add ICE candidate to peer connection
 * @param {RTCPeerConnection} peerConnection - Peer connection instance
 * @param {RTCIceCandidateInit} candidate - ICE candidate
 */
export async function addIceCandidate(peerConnection, candidate) {
  try {
    if (candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
  }
}

/**
 * Clean up peer connection
 * @param {RTCPeerConnection} peerConnection - Peer connection to clean up
 */
export function cleanupPeerConnection(peerConnection) {
  if (peerConnection) {
    peerConnection.getTracks().forEach(track => track.stop());
    peerConnection.close();
  }
}

