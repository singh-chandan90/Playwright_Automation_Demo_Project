
import CryptoJS from 'crypto-js';

// Encryption function
export function encrypt(text: string): string {
  // Get the SALT from environment variables with fallback
  const SALT = process.env.SALT || "defaultSALT";
  return CryptoJS.AES.encrypt(text, SALT).toString();
}

// Decryption function
export function decrypt(cipherText: string): string {
  // Get the SALT from environment variables with fallback
  const SALT = process.env.SALT || "defaultSALT";
  const bytes = CryptoJS.AES.decrypt(cipherText, SALT);
  return bytes.toString(CryptoJS.enc.Utf8);
}
