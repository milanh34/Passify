import * as Crypto from 'expo-crypto';
import aesjs from 'aes-js';
import { ThrottledProgress, ProgressCallback } from '../types/progress';


const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;
const CHUNK_SIZE = 8192; // 8KB chunks


async function deriveKeys(
  password: string,
  salt: Uint8Array,
  progress?: ThrottledProgress
): Promise<{ aesKey: Uint8Array; hmacKey: Uint8Array }> {
  const passwordBuffer = new TextEncoder().encode(password);
  const input = new Uint8Array(passwordBuffer.length + salt.length);
  input.set(passwordBuffer);
  input.set(salt, passwordBuffer.length);
  
  let derivedKey = input;
  
  // FIXED: Update every 1% instead of every 5%
  // Calculate update interval for 1% increments (100 updates total)
  const updateInterval = Math.max(1, Math.floor(PBKDF2_ITERATIONS / 100));
  
  for (let i = 0; i < PBKDF2_ITERATIONS; i++) {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Array.from(derivedKey).map(b => String.fromCharCode(b)).join('')
    );
    derivedKey = new Uint8Array(hash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Update progress every 1% (100 times instead of 20)
    if (progress && i % updateInterval === 0) {
      progress.update('encrypt', i, PBKDF2_ITERATIONS);
    }
  }
  
  // Final update to ensure 100%
  progress?.update('encrypt', PBKDF2_ITERATIONS, PBKDF2_ITERATIONS);
  
  const aesKey = derivedKey.slice(0, KEY_LENGTH);
  
  const hmacInput = new Uint8Array([...derivedKey, ...salt, 0x01]);
  const hmacHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Array.from(hmacInput).map(b => String.fromCharCode(b)).join('')
  );
  const hmacKey = new Uint8Array(hmacHash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  
  return { aesKey, hmacKey };
}


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
  
  const innerInput = new Uint8Array(blockSize + data.length);
  innerInput.set(ipad);
  innerInput.set(data, blockSize);
  const innerHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Array.from(innerInput).map(b => String.fromCharCode(b)).join('')
  );
  const innerHashBytes = new Uint8Array(innerHash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  
  const outerInput = new Uint8Array(blockSize + 32);
  outerInput.set(opad);
  outerInput.set(innerHashBytes, blockSize);
  const outerHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Array.from(outerInput).map(b => String.fromCharCode(b)).join('')
  );
  
  return new Uint8Array(outerHash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
}


export async function encryptData(
  data: string,
  password: string,
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  const progress = onProgress ? new ThrottledProgress(onProgress) : undefined;
  
  // Stage 1: Convert to bytes
  const textBytes = aesjs.utils.utf8.toBytes(data);
  const totalInputBytes = textBytes.length;
  
  // Generate salt and IV
  const salt = new Uint8Array(SALT_LENGTH);
  const iv = new Uint8Array(16);
  for (let i = 0; i < salt.length; i++) salt[i] = Math.floor(Math.random() * 256);
  for (let i = 0; i < iv.length; i++) iv[i] = Math.floor(Math.random() * 256);
  
  // Stage 2: Derive keys (reports internally with 1% granularity)
  const { aesKey, hmacKey } = await deriveKeys(password, salt, progress);
  
  // Stage 3: Encrypt in chunks with 1% granularity
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(Array.from(iv)));
  const encryptedBytes = new Uint8Array(textBytes.length);
  
  // FIXED: Calculate chunk size for 1% updates
  // Ensure we get at least 100 updates for smooth progress
  const effectiveChunkSize = Math.max(1, Math.floor(textBytes.length / 100));
  
  let processedBytes = 0;
  for (let i = 0; i < textBytes.length; i += effectiveChunkSize) {
    const chunkEnd = Math.min(i + effectiveChunkSize, textBytes.length);
    const chunk = textBytes.slice(i, chunkEnd);
    const encrypted = aesCtr.encrypt(chunk);
    encryptedBytes.set(encrypted, i);
    
    processedBytes = chunkEnd;
    progress?.update('encrypt', processedBytes, totalInputBytes);
  }
  
  // Ensure final 100% update
  progress?.update('encrypt', totalInputBytes, totalInputBytes);
  
  // Compute HMAC
  const dataToAuth = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
  dataToAuth.set(salt);
  dataToAuth.set(iv, salt.length);
  dataToAuth.set(encryptedBytes, salt.length + iv.length);
  const hmac = await computeHMAC(hmacKey, dataToAuth);
  
  // Combine result
  const result = new Uint8Array(salt.length + iv.length + encryptedBytes.length + hmac.length);
  result.set(salt);
  result.set(iv, salt.length);
  result.set(encryptedBytes, salt.length + iv.length);
  result.set(hmac, salt.length + iv.length + encryptedBytes.length);
  
  return result;
}


export async function decryptData(
  encryptedData: Uint8Array,
  password: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const progress = onProgress ? new ThrottledProgress(onProgress) : undefined;
  
  if (encryptedData.length < SALT_LENGTH + 16 + 32) {
    throw new Error('Invalid encrypted data: too short');
  }
  
  const salt = encryptedData.slice(0, SALT_LENGTH);
  const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + 16);
  const hmac = encryptedData.slice(-32);
  const ciphertext = encryptedData.slice(SALT_LENGTH + 16, -32);
  
  // Derive keys (reports internally with 1% granularity)
  const { aesKey, hmacKey } = await deriveKeys(password, salt, progress);
  
  // Verify HMAC
  const dataToAuth = encryptedData.slice(0, -32);
  const computedHmac = await computeHMAC(hmacKey, dataToAuth);
  
  let isValid = true;
  for (let i = 0; i < 32; i++) {
    if (hmac[i] !== computedHmac[i]) isValid = false;
  }
  
  if (!isValid) {
    throw new Error('Authentication failed: wrong password or corrupted data');
  }
  
  // Decrypt in chunks with 1% granularity
  const aesCtr = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(Array.from(iv)));
  const decryptedBytes = new Uint8Array(ciphertext.length);
  
  // FIXED: Calculate chunk size for 1% updates
  // Ensure we get at least 100 updates for smooth progress
  const effectiveChunkSize = Math.max(1, Math.floor(ciphertext.length / 100));
  
  let processedBytes = 0;
  for (let i = 0; i < ciphertext.length; i += effectiveChunkSize) {
    const chunkEnd = Math.min(i + effectiveChunkSize, ciphertext.length);
    const chunk = ciphertext.slice(i, chunkEnd);
    const decrypted = aesCtr.decrypt(chunk);
    decryptedBytes.set(decrypted, i);
    
    processedBytes = chunkEnd;
    progress?.update('decrypt', processedBytes, ciphertext.length);
  }
  
  // Ensure final 100% update
  progress?.update('decrypt', ciphertext.length, ciphertext.length);
  
  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}
