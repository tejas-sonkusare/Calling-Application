import CryptoJS from 'crypto-js';

/**
 * Derive an encryption key from room ID using SHA-256
 * This ensures both users in the same room use the same key
 */
function deriveKey(roomId) {
  // Use SHA-256 to create a deterministic key from room ID
  const hash = CryptoJS.SHA256(roomId);
  return hash.toString();
}

/**
 * Encrypt a message using AES-256
 * @param {string} message - Plain text message to encrypt
 * @param {string} roomId - Room ID used for key derivation
 * @returns {string} Base64 encoded encrypted message
 */
export function encryptMessage(message, roomId) {
  try {
    const key = deriveKey(roomId);
    const encrypted = CryptoJS.AES.encrypt(message, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

/**
 * Decrypt a message using AES-256
 * @param {string} encryptedMessage - Base64 encoded encrypted message
 * @param {string} roomId - Room ID used for key derivation
 * @returns {string} Decrypted plain text message
 */
export function decryptMessage(encryptedMessage, roomId) {
  try {
    const key = deriveKey(roomId);
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) {
      throw new Error('Decryption failed - invalid message or key');
    }
    
    return plaintext;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

