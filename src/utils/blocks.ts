// Header structure in first blocks
export interface ImageHeader {
  magic: number; // 0x504D4947 ("PMIG")
  version: number; // 1
  width: number;
  height: number;
  dataLength: number;
  checksum: number;
}

const MAGIC_NUMBER = 0x504D4947; // "PMIG" - Password Manager Image
const VERSION = 1;
const HEADER_SIZE = 24; // 6 fields × 4 bytes
const BLOCK_SIZE = 3; // 3×3 pixels per byte

/**
 * Pack header into bytes
 */
export function packHeader(header: ImageHeader): Uint8Array {
  const buffer = new Uint8Array(HEADER_SIZE);
  const view = new DataView(buffer.buffer);
  
  view.setUint32(0, header.magic, false); // Big-endian
  view.setUint32(4, header.version, false);
  view.setUint32(8, header.width, false);
  view.setUint32(12, header.height, false);
  view.setUint32(16, header.dataLength, false);
  view.setUint32(20, header.checksum, false);
  
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
    width: view.getUint32(8, false),
    height: view.getUint32(12, false),
    dataLength: view.getUint32(16, false),
    checksum: view.getUint32(20, false),
  };
  
  // Validate
  if (header.magic !== MAGIC_NUMBER) {
    throw new Error(`Invalid magic number: expected ${MAGIC_NUMBER}, got ${header.magic}`);
  }
  if (header.version !== VERSION) {
    throw new Error(`Unsupported version: ${header.version}`);
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
 * Calculate required image dimensions for data
 */
export function calculateDimensions(dataLength: number): { width: number; height: number } {
  // Each byte needs a 3×3 block
  const totalBytes = HEADER_SIZE + dataLength;
  const blocksNeeded = totalBytes;
  
  // Calculate square-ish dimensions
  const blocksPerRow = Math.ceil(Math.sqrt(blocksNeeded));
  const width = blocksPerRow * BLOCK_SIZE;
  const height = Math.ceil(blocksNeeded / blocksPerRow) * BLOCK_SIZE;
  
  return { width, height };
}

/**
 * Encode bytes into 3×3 pixel blocks (RGBA format)
 * Each byte is stored in the center pixel's RGB channels (all same value)
 * Surrounding pixels are black for visual separation
 */
export function encodeToBlocks(data: Uint8Array, width: number, height: number): Uint8Array {
  const pixelBuffer = new Uint8Array(width * height * 4); // RGBA
  
  // Fill with black
  for (let i = 3; i < pixelBuffer.length; i += 4) {
    pixelBuffer[i] = 255; // Alpha
  }
  
  let byteIndex = 0;
  const blocksPerRow = Math.floor(width / BLOCK_SIZE);
  
  for (let blockY = 0; blockY < Math.floor(height / BLOCK_SIZE) && byteIndex < data.length; blockY++) {
    for (let blockX = 0; blockX < blocksPerRow && byteIndex < data.length; blockX++) {
      const byte = data[byteIndex++];
      
      // Center pixel of the 3×3 block
      const centerX = blockX * BLOCK_SIZE + 1;
      const centerY = blockY * BLOCK_SIZE + 1;
      const pixelIndex = (centerY * width + centerX) * 4;
      
      // Store byte in RGB channels (grayscale)
      pixelBuffer[pixelIndex] = byte;     // R
      pixelBuffer[pixelIndex + 1] = byte; // G
      pixelBuffer[pixelIndex + 2] = byte; // B
      pixelBuffer[pixelIndex + 3] = 255;  // A
    }
  }
  
  return pixelBuffer;
}

/**
 * Decode bytes from 3×3 pixel blocks
 */
export function decodeFromBlocks(pixelBuffer: Uint8Array, width: number, height: number, dataLength: number): Uint8Array {
  const data = new Uint8Array(dataLength);
  let byteIndex = 0;
  
  const blocksPerRow = Math.floor(width / BLOCK_SIZE);
  
  for (let blockY = 0; blockY < Math.floor(height / BLOCK_SIZE) && byteIndex < dataLength; blockY++) {
    for (let blockX = 0; blockX < blocksPerRow && byteIndex < dataLength; blockX++) {
      // Center pixel of the 3×3 block
      const centerX = blockX * BLOCK_SIZE + 1;
      const centerY = blockY * BLOCK_SIZE + 1;
      const pixelIndex = (centerY * width + centerX) * 4;
      
      // Read byte from R channel (all RGB should be same)
      data[byteIndex++] = pixelBuffer[pixelIndex];
    }
  }
  
  return data;
}
