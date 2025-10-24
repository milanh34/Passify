export type ProgressCallback = (stage: string, percent: number) => void;

// Header structure
export interface ImageHeader {
  magic: number; // 0x504D4947 ("PMIG")
  version: number; // 2 (updated for 1x1 RGBA)
  mode: number; // 1 = 1x1 encoding
  width: number;
  height: number;
  dataLength: number;
  checksum: number;
  reserved: number; // For future use
}

const MAGIC_NUMBER = 0x504D4947;
const VERSION = 2;
const MODE_1X1 = 1;
const HEADER_SIZE = 32; // 8 fields × 4 bytes
const BYTES_PER_PIXEL = 4; // RGBA

/**
 * Pack header into bytes
 */
export function packHeader(header: ImageHeader): Uint8Array {
  const buffer = new Uint8Array(HEADER_SIZE);
  const view = new DataView(buffer.buffer);
  
  view.setUint32(0, header.magic, false);
  view.setUint32(4, header.version, false);
  view.setUint32(8, header.mode, false);
  view.setUint32(12, header.width, false);
  view.setUint32(16, header.height, false);
  view.setUint32(20, header.dataLength, false);
  view.setUint32(24, header.checksum, false);
  view.setUint32(28, header.reserved, false);
  
  return buffer;
}

/**
 * Unpack header from bytes
 */
export function unpackHeader(bytes: Uint8Array): ImageHeader {
  if (bytes.length < HEADER_SIZE) {
    throw new Error('Invalid header: too short');
  }
  
  const view = new DataView(bytes.buffer, bytes.byteOffset);
  
  const header: ImageHeader = {
    magic: view.getUint32(0, false),
    version: view.getUint32(4, false),
    mode: view.getUint32(8, false),
    width: view.getUint32(12, false),
    height: view.getUint32(16, false),
    dataLength: view.getUint32(20, false),
    checksum: view.getUint32(24, false),
    reserved: view.getUint32(28, false),
  };
  
  // Validate
  if (header.magic !== MAGIC_NUMBER) {
    throw new Error(`Invalid magic number: expected ${MAGIC_NUMBER}, got ${header.magic}`);
  }
  if (header.version !== VERSION) {
    throw new Error(`Unsupported version: ${header.version} (expected ${VERSION})`);
  }
  if (header.mode !== MODE_1X1) {
    throw new Error(`Unsupported encoding mode: ${header.mode}`);
  }
  
  return header;
}

/**
 * Calculate simple checksum
 */
export function calculateChecksum(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = (sum + data[i]) & 0xFFFFFFFF;
  }
  return sum;
}

/**
 * Calculate required image dimensions for data (1x1 encoding)
 * Each pixel stores 4 bytes (RGBA)
 */
export function calculateDimensions(dataLength: number): { width: number; height: number } {
  const totalBytes = HEADER_SIZE + dataLength;
  const pixelsNeeded = Math.ceil(totalBytes / BYTES_PER_PIXEL);
  
  // Calculate square-ish dimensions
  const width = Math.ceil(Math.sqrt(pixelsNeeded));
  const height = Math.ceil(pixelsNeeded / width);
  
  return { width, height };
}

/**
 * Encode bytes into RGBA pixels (1x1 mode - colored output)
 * Each pixel stores 4 bytes: R=byte[0], G=byte[1], B=byte[2], A=byte[3]
 */
export function encodeToPixels(
  data: Uint8Array,
  width: number,
  height: number,
  onProgress?: ProgressCallback
): Uint8Array {
  const pixelBuffer = new Uint8Array(width * height * 4); // RGBA
  
  // Fill remaining pixels with random noise (makes image colorful)
  for (let i = 0; i < pixelBuffer.length; i++) {
    pixelBuffer[i] = Math.floor(Math.random() * 256);
  }
  
  // Encode data bytes into pixels
  let byteIndex = 0;
  const totalPixels = Math.ceil(data.length / 4);
  const progressInterval = Math.max(1, Math.floor(totalPixels / 50));
  
  for (let pixelIndex = 0; pixelIndex < totalPixels && byteIndex < data.length; pixelIndex++) {
    const offset = pixelIndex * 4;
    
    // Pack 4 bytes into RGBA channels
    for (let channel = 0; channel < 4 && byteIndex < data.length; channel++) {
      pixelBuffer[offset + channel] = data[byteIndex++];
    }
    
    // Report progress
    if (onProgress && pixelIndex % progressInterval === 0) {
      const percent = (pixelIndex / totalPixels) * 100;
      onProgress('Encoding to pixels', percent);
    }
  }
  
  onProgress?.('Encoding to pixels', 100);
  
  return pixelBuffer;
}

/**
 * Decode bytes from RGBA pixels (1x1 mode)
 */
export function decodeFromPixels(
  pixelBuffer: Uint8Array,
  dataLength: number,
  onProgress?: ProgressCallback
): Uint8Array {
  const data = new Uint8Array(dataLength);
  
  const totalPixels = Math.ceil(dataLength / 4);
  const progressInterval = Math.max(1, Math.floor(totalPixels / 50));
  
  let byteIndex = 0;
  
  for (let pixelIndex = 0; pixelIndex < totalPixels && byteIndex < dataLength; pixelIndex++) {
    const offset = pixelIndex * 4;
    
    // Unpack 4 bytes from RGBA channels
    for (let channel = 0; channel < 4 && byteIndex < dataLength; channel++) {
      data[byteIndex++] = pixelBuffer[offset + channel];
    }
    
    // Report progress
    if (onProgress && pixelIndex % progressInterval === 0) {
      const percent = (pixelIndex / totalPixels) * 100;
      onProgress('Decoding from pixels', percent);
    }
  }
  
  onProgress?.('Decoding from pixels', 100);
  
  return data;
}

/**
 * Get header constants for external use
 */
export const BLOCK_CONSTANTS = {
  HEADER_SIZE,
  BYTES_PER_PIXEL,
  MODE_1X1,
  VERSION,
  MAGIC_NUMBER,
};
