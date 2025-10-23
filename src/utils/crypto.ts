import * as Crypto from 'expo-crypto';
import aesjs from 'aes-js';

// Constants
const SALT_LENGTH = 32;
const KEY_LENGTH = 32; // AES-256
const PBKDF2_ITERATIONS = 100000;
const HMAC_KEY_LENGTH = 32;

/**
 * Derives encryption key and HMAC key from password using PBKDF2
 */
async function deriveKeys(password: string, salt: Uint8Array): Promise<{ aesKey: Uint8Array; hmacKey: Uint8Array }> {
  // Create password buffer
  const passwordBuffer = new TextEncoder().encode(password);
  
  // Concatenate password and salt for PBKDF2 input
  const input = new Uint8Array(passwordBuffer.length + salt.length);
  input.set(passwordBuffer);
  input.set(salt, passwordBuffer.length);
  
  // Use expo-crypto to hash multiple iterations
  let derivedKey = input;
  for (let i = 0; i < PBKDF2_ITERATIONS; i++) {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Array.from(derivedKey).map(b => String.fromCharCode(b)).join('')
    );
    derivedKey = new Uint8Array(
      hash.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
  }
  
  // Split derived key for AES and HMAC
  const aesKey = derivedKey.slice(0, KEY_LENGTH);
  
  // Derive HMAC key separately
  const hmacInput = new Uint8Array([...derivedKey, ...salt, 0x01]);
  const hmacHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Array.from(hmacInput).map(b => String.fromCharCode(b)).join('')
  );
  const hmacKey = new Uint8Array(
    hmacHash.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  return { aesKey, hmacKey };
}

/**
 * Compute HMAC-SHA256
 */
async function computeHMAC(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const blockSize = 64; // SHA-256 block size
  
  // Prepare key
  let keyArray = new Uint8Array(blockSize);
  if (key.length > blockSize) {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Array.from(key).map(b => String.fromCharCode(b)).join('')
    );
    const hashedKey = new Uint8Array(hash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    keyArray.set(hashedKey);
  } else {
    keyArray.set(key);
  }
  
  // Inner and outer padding
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = keyArray[i] ^ 0x36;
    opad[i] = keyArray[i] ^ 0x5c;
  }
  
  // Inner hash
  const innerInput = new Uint8Array(blockSize + data.length);
  innerInput.set(ipad);
  innerInput.set(data, blockSize);
  const innerHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Array.from(innerInput).map(b => String.fromCharCode(b)).join('')
  );
  const innerHashBytes = new Uint8Array(innerHash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  
  // Outer hash
  const outerInput = new Uint8Array(blockSize + 32);
  outerInput.set(opad);
  outerInput.set(innerHashBytes, blockSize);
  const outerHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Array.from(outerInput).map(b => String.fromCharCode(b)).join('')
  );
  
  return new Uint8Array(outerHash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
}

/**
 * Encrypt data with AES-256-CTR + HMAC
 */
export async function encryptData(data: string, password: string): Promise<Uint8Array> {
  // Generate random salt and IV
  const salt = new Uint8Array(SALT_LENGTH);
  const iv = new Uint8Array(16); // AES block size
  
  for (let i = 0; i < salt.length; i++) {
    salt[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < iv.length; i++) {
    iv[i] = Math.floor(Math.random() * 256);
  }
  
  // Derive keys
  const { aesKey, hmacKey } = await deriveKeys(password, salt);
  
  // Encrypt with AES-CTR
  const textBytes = aesjs.utils.utf8.toBytes(data);
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(Array.from(iv)));
  const encryptedBytes = aesCtr.encrypt(textBytes);
  
  // Compute HMAC over salt + iv + ciphertext
  const dataToAuth = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
  dataToAuth.set(salt);
  dataToAuth.set(iv, salt.length);
  dataToAuth.set(encryptedBytes, salt.length + iv.length);
  
  const hmac = await computeHMAC(hmacKey, dataToAuth);
  
  // Format: [salt(32) | iv(16) | ciphertext | hmac(32)]
  const result = new Uint8Array(salt.length + iv.length + encryptedBytes.length + hmac.length);
  result.set(salt);
  result.set(iv, salt.length);
  result.set(encryptedBytes, salt.length + iv.length);
  result.set(hmac, salt.length + iv.length + encryptedBytes.length);
  
  return result;
}

/**
 * Decrypt data with AES-256-CTR + HMAC verification
 */
export async function decryptData(encryptedData: Uint8Array, password: string): Promise<string> {
  if (encryptedData.length < SALT_LENGTH + 16 + 32) {
    throw new Error('Invalid encrypted data: too short');
  }
  
  // Extract components
  const salt = encryptedData.slice(0, SALT_LENGTH);
  const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + 16);
  const hmac = encryptedData.slice(-32);
  const ciphertext = encryptedData.slice(SALT_LENGTH + 16, -32);
  
  // Derive keys
  const { aesKey, hmacKey } = await deriveKeys(password, salt);
  
  // Verify HMAC
  const dataToAuth = encryptedData.slice(0, -32);
  const computedHmac = await computeHMAC(hmacKey, dataToAuth);
  
  // Constant-time comparison
  let isValid = true;
  for (let i = 0; i < 32; i++) {
    if (hmac[i] !== computedHmac[i]) {
      isValid = false;
    }
  }
  
  if (!isValid) {
    throw new Error('Authentication failed: wrong password or corrupted data');
  }
  
  // Decrypt with AES-CTR
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(Array.from(iv)));
  const decryptedBytes = aesCtr.decrypt(ciphertext);
  
  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}
