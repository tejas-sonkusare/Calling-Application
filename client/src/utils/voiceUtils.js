/**
 * Voice message recording utilities
 */

let mediaRecorder = null;
let audioChunks = [];

/**
 * Start recording audio
 * @returns {Promise<MediaRecorder>} MediaRecorder instance
 */
export async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
    return mediaRecorder;
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
}

/**
 * Stop recording and get audio blob
 * @returns {Promise<Blob>} Audio blob
 */
export async function stopRecording() {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      reject(new Error('No active recording'));
      return;
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      // Stop all tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      mediaRecorder = null;
      audioChunks = [];
      resolve(audioBlob);
    };

    mediaRecorder.onerror = (error) => {
      reject(error);
    };

    mediaRecorder.stop();
  });
}

/**
 * Convert blob to base64
 * @param {Blob} blob - Audio blob
 * @returns {Promise<string>} Base64 string
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Format duration in seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

