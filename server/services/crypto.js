import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY_SOURCE = process.env.ENCRYPTION_KEY || 'pentester_ai_default_master_encryption_key_2026';

// Derive a 32-byte key
function getEncryptionKey() {
  return crypto.createHash('sha256').update(DEFAULT_KEY_SOURCE).digest();
}

/**
 * Encrypt a sensitive string (e.g. Gemini API Key)
 */
export function encryptSecret(plainText) {
  if (!plainText) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a ciphertext created by encryptSecret
 */
export function decryptSecret(cipherText) {
  if (!cipherText) return '';
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      // Legacy or unencrypted fallback
      return cipherText;
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return '';
  }
}

/**
 * Mask an API key for safe UI display (e.g. AIzaSy...94xK)
 */
export function maskApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return '';
  if (apiKey.length <= 8) return '********';
  const start = apiKey.slice(0, 6);
  const end = apiKey.slice(-4);
  return `${start}••••••••••••${end}`;
}
