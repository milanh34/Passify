import { ThrottledProgress } from '../types/progress';


export interface ImageHeader {
  magic: number;
  version: number;
  mode: number;
  width: number;
  height: number;
  dataLength: number;
  checksum: number;
  reserved: number;
}


const MAGIC_NUMBER = 0x504D4947;
const VERSION = 2;
const MODE_1X1 = 1;
const HEADER_SIZE = 32;
const BYTES_PER_PIXEL = 4;


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
  
  if (header.magic !== MAGIC_NUMBER) {
    throw new Error(`Invalid magic number`);
  }
  if (header.version !== VERSION) {
    throw new Error(`Unsupported version: ${header.version}`);
  }
  if (header.mode !== MODE_1X1) {
    throw new Error(`Unsupported encoding mode: ${header.mode}`);
  }
  
  return header;
}


export function calculateChecksum(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = (sum + data[i]) & 0xFFFFFFFF;
  }
  return sum;
}


export function calculateDimensions(dataLength: number): { width: number; height: number } {
  const totalBytes = HEADER_SIZE + dataLength;
  const pixelsNeeded = Math.ceil(totalBytes / BYTES_PER_PIXEL);
  const width = Math.ceil(Math.sqrt(pixelsNeeded));
  const height = Math.ceil(pixelsNeeded / width);
  return { width, height };
}


export function encodeToPixels(
  data: Uint8Array,
  width: number,
  height: number,
  progress?: ThrottledProgress
): Uint8Array {
  const pixelBuffer = new Uint8Array(width * height * 4);
  const totalBytes = data.length;
  
  // Fill with random noise
  for (let i = 0; i < pixelBuffer.length; i++) {
    pixelBuffer[i] = Math.floor(Math.random() * 256);
  }
  
  // FIXED: Calculate update interval for 1% increments (100 updates total)
  // Update at least every 1% of total bytes processed
  const updateInterval = Math.max(1, Math.floor(totalBytes / 100));
  
  // Encode data
  let byteIndex = 0;
  for (let pixelIndex = 0; pixelIndex < Math.ceil(totalBytes / 4); pixelIndex++) {
    const offset = pixelIndex * 4;
    
    for (let channel = 0; channel < 4 && byteIndex < totalBytes; channel++) {
      pixelBuffer[offset + channel] = data[byteIndex++];
    }
    
    // Update progress every 1% (100 times instead of every 1024 bytes)
    if (progress && byteIndex % updateInterval === 0) {
      progress.update('pack', byteIndex, totalBytes);
    }
  }
  
  // Ensure final 100% update
  progress?.update('pack', totalBytes, totalBytes);
  return pixelBuffer;
}


export function decodeFromPixels(
  pixelBuffer: Uint8Array,
  dataLength: number,
  progress?: ThrottledProgress
): Uint8Array {
  const data = new Uint8Array(dataLength);
  
  // FIXED: Calculate update interval for 1% increments (100 updates total)
  // Update at least every 1% of total bytes processed
  const updateInterval = Math.max(1, Math.floor(dataLength / 100));
  
  let byteIndex = 0;
  
  for (let pixelIndex = 0; pixelIndex < Math.ceil(dataLength / 4); pixelIndex++) {
    const offset = pixelIndex * 4;
    
    for (let channel = 0; channel < 4 && byteIndex < dataLength; channel++) {
      data[byteIndex++] = pixelBuffer[offset + channel];
    }
    
    // Update progress every 1% (100 times instead of every 1024 bytes)
    if (progress && byteIndex % updateInterval === 0) {
      progress.update('unpack', byteIndex, dataLength);
    }
  }
  
  // Ensure final 100% update
  progress?.update('unpack', dataLength, dataLength);
  return data;
}


export const BLOCK_CONSTANTS = {
  HEADER_SIZE,
  BYTES_PER_PIXEL,
  MODE_1X1,
  VERSION,
  MAGIC_NUMBER,
};
