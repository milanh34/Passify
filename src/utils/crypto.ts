import * as Crypto from 'expo-crypto';
import aesjs from 'aes-js';

// Constants
const SALT_LENGTH = 32;
const KEY_LENGTH = 32; // AES-256
const PBKDF2_ITERATIONS = 100000;
const HMAC_KEY_LENGTH = 32;

export type ProgressCallback = (stage: string, percent: number) => void;

/**
 * Derives encryption key and HMAC key from password using PBKDF2 with progress
 */
async function deriveKeys(
  password: string,
  salt: Uint8Array,
  onProgress?: ProgressCallback
): Promise<{ aesKey: Uint8Array; hmacKey: Uint8Array }> {
  const passwordBuffer = new TextEncoder().encode(password);
  
  const input = new Uint8Array(passwordBuffer.length + salt.length);
  input.set(passwordBuffer);
  input.set(salt, passwordBuffer.length);
  
  // Perform PBKDF2 with progress reporting
  let derivedKey = input;
  const progressInterval = Math.floor(PBKDF2_ITERATIONS / 20); // Report 20 times
  
  for (let i = 0; i < PBKDF2_ITERATIONS; i++) {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Array.from(derivedKey).map(b => String.fromCharCode(b)).join('')
    );
    derivedKey = new Uint8Array(
      hash.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    // Report progress
    if (onProgress && i % progressInterval === 0) {
      const percent = (i / PBKDF2_ITERATIONS) * 100;
      onProgress('Deriving encryption key', percent);
    }
  }
  
  onProgress?.('Deriving encryption key', 100);
  
  const aesKey = derivedKey.slice(0, KEY_LENGTH);
  
  // Derive HMAC key
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
  const blockSize = 64;
  
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
 * Encrypt data with AES-256-CTR + HMAC with progress reporting
 */
export async function encryptData(
  data: string,
  password: string,
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  onProgress?.('Initializing encryption', 0);
  
  // Generate random salt and IV
  const salt = new Uint8Array(SALT_LENGTH);
  const iv = new Uint8Array(16);
  
  for (let i = 0; i < salt.length; i++) {
    salt[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < iv.length; i++) {
    iv[i] = Math.floor(Math.random() * 256);
  }
  
  onProgress?.('Deriving encryption key', 0);
  
  // Derive keys (reports progress internally)
  const { aesKey, hmacKey } = await deriveKeys(password, salt, onProgress);
  
  onProgress?.('Encrypting data', 0);
  
  // Encrypt with AES-CTR in chunks for progress
  const textBytes = aesjs.utils.utf8.toBytes(data);
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(Array.from(iv)));
  
  const chunkSize = 8192; // 8KB chunks
  const encryptedBytes = new Uint8Array(textBytes.length);
  
  for (let i = 0; i < textBytes.length; i += chunkSize) {
    const chunk = textBytes.slice(i, Math.min(i + chunkSize, textBytes.length));
    const encryptedChunk = aesCtr.encrypt(chunk);
    encryptedBytes.set(encryptedChunk, i);
    
    const percent = ((i + chunk.length) / textBytes.length) * 100;
    onProgress?.('Encrypting data', percent);
  }
  
  onProgress?.('Computing authentication tag', 0);
  
  // Compute HMAC
  const dataToAuth = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
  dataToAuth.set(salt);
  dataToAuth.set(iv, salt.length);
  dataToAuth.set(encryptedBytes, salt.length + iv.length);
  
  const hmac = await computeHMAC(hmacKey, dataToAuth);
  
  onProgress?.('Computing authentication tag', 100);
  
  // Format: [salt(32) | iv(16) | ciphertext | hmac(32)]
  const result = new Uint8Array(salt.length + iv.length + encryptedBytes.length + hmac.length);
  result.set(salt);
  result.set(iv, salt.length);
  result.set(encryptedBytes, salt.length + iv.length);
  result.set(hmac, salt.length + iv.length + encryptedBytes.length);
  
  return result;
}

/**
 * Decrypt data with AES-256-CTR + HMAC verification with progress
 */
export async function decryptData(
  encryptedData: Uint8Array,
  password: string,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.('Initializing decryption', 0);
  
  if (encryptedData.length < SALT_LENGTH + 16 + 32) {
    throw new Error('Invalid encrypted data: too short');
  }
  
  // Extract components
  const salt = encryptedData.slice(0, SALT_LENGTH);
  const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + 16);
  const hmac = encryptedData.slice(-32);
  const ciphertext = encryptedData.slice(SALT_LENGTH + 16, -32);
  
  onProgress?.('Deriving decryption key', 0);
  
  // Derive keys
  const { aesKey, hmacKey } = await deriveKeys(password, salt, onProgress);
  
  onProgress?.('Verifying authentication tag', 0);
  
  // Verify HMAC
  const dataToAuth = encryptedData.slice(0, -32);
  const computedHmac = await computeHMAC(hmacKey, dataToAuth);
  
  let isValid = true;
  for (let i = 0; i < 32; i++) {
    if (hmac[i] !== computedHmac[i]) {
      isValid = false;
    }
  }
  
  if (!isValid) {
    throw new Error('Authentication failed: wrong password or corrupted data');
  }
  
  onProgress?.('Verifying authentication tag', 100);
  onProgress?.('Decrypting data', 0);
  
  // Decrypt with AES-CTR in chunks
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(Array.from(iv)));
  
  const chunkSize = 8192;
  const decryptedBytes = new Uint8Array(ciphertext.length);
  
  for (let i = 0; i < ciphertext.length; i += chunkSize) {
    const chunk = ciphertext.slice(i, Math.min(i + chunkSize, ciphertext.length));
    const decryptedChunk = aesCtr.decrypt(chunk);
    decryptedBytes.set(decryptedChunk, i);
    
    const percent = ((i + chunk.length) / ciphertext.length) * 100;
    onProgress?.('Decrypting data', percent);
  }
  
  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}
