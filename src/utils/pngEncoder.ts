import * as Crypto from 'expo-crypto';

/**
 * Encode RGBA pixel buffer to PNG format (simplified, lossless)
 * This is a minimal PNG encoder for our use case
 */
export async function encodePNG(pixels: Uint8Array, width: number, height: number): Promise<Uint8Array> {
  // PNG signature
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = createChunk('IHDR', createIHDR(width, height));
  
  // IDAT chunk (image data)
  const imageData = await createImageData(pixels, width, height);
  const idat = createChunk('IDAT', imageData);
  
  // IEND chunk
  const iend = createChunk('IEND', new Uint8Array(0));
  
  // Combine all parts
  const totalLength = signature.length + ihdr.length + idat.length + iend.length;
  const png = new Uint8Array(totalLength);
  let offset = 0;
  
  png.set(signature, offset);
  offset += signature.length;
  png.set(ihdr, offset);
  offset += ihdr.length;
  png.set(idat, offset);
  offset += idat.length;
  png.set(iend, offset);
  
  return png;
}

function createIHDR(width: number, height: number): Uint8Array {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);
  
  view.setUint32(0, width, false);
  view.setUint32(4, height, false);
  data[8] = 8;  // Bit depth
  data[9] = 6;  // Color type: RGBA
  data[10] = 0; // Compression
  data[11] = 0; // Filter
  data[12] = 0; // Interlace
  
  return data;
}

async function createImageData(pixels: Uint8Array, width: number, height: number): Promise<Uint8Array> {
  // Add filter byte (0 = no filter) to each scanline
  const bytesPerRow = width * 4;
  const filteredData = new Uint8Array(height * (bytesPerRow + 1));
  
  for (let y = 0; y < height; y++) {
    filteredData[y * (bytesPerRow + 1)] = 0; // Filter type
    filteredData.set(
      pixels.slice(y * bytesPerRow, (y + 1) * bytesPerRow),
      y * (bytesPerRow + 1) + 1
    );
  }
  
  // Compress with simplified deflate (store uncompressed for simplicity)
  return deflateStore(filteredData);
}

function deflateStore(data: Uint8Array): Uint8Array {
  // Simplified: store uncompressed blocks
  const maxBlockSize = 65535;
  const numBlocks = Math.ceil(data.length / maxBlockSize);
  
  let totalSize = 0;
  for (let i = 0; i < numBlocks; i++) {
    totalSize += 5; // Block header
    const blockSize = Math.min(maxBlockSize, data.length - i * maxBlockSize);
    totalSize += blockSize;
  }
  
  const compressed = new Uint8Array(totalSize + 6); // +6 for zlib header and checksum
  
  // Zlib header
  compressed[0] = 0x78; // CMF
  compressed[1] = 0x01; // FLG (no compression)
  
  let offset = 2;
  for (let i = 0; i < numBlocks; i++) {
    const isLast = i === numBlocks - 1;
    const blockStart = i * maxBlockSize;
    const blockSize = Math.min(maxBlockSize, data.length - blockStart);
    
    compressed[offset++] = isLast ? 0x01 : 0x00; // BFINAL and BTYPE
    compressed[offset++] = blockSize & 0xFF;
    compressed[offset++] = (blockSize >> 8) & 0xFF;
    compressed[offset++] = (~blockSize) & 0xFF;
    compressed[offset++] = ((~blockSize) >> 8) & 0xFF;
    
    compressed.set(data.slice(blockStart, blockStart + blockSize), offset);
    offset += blockSize;
  }
  
  // Adler-32 checksum
  const adler = adler32(data);
  compressed[offset++] = (adler >> 24) & 0xFF;
  compressed[offset++] = (adler >> 16) & 0xFF;
  compressed[offset++] = (adler >> 8) & 0xFF;
  compressed[offset++] = adler & 0xFF;
  
  return compressed;
}

function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  const MOD_ADLER = 65521;
  
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  
  return (b << 16) | a;
}

function createChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new Uint8Array([
    type.charCodeAt(0),
    type.charCodeAt(1),
    type.charCodeAt(2),
    type.charCodeAt(3),
  ]);
  
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  
  // Length
  view.setUint32(0, data.length, false);
  
  // Type
  chunk.set(typeBytes, 4);
  
  // Data
  chunk.set(data, 8);
  
  // CRC
  const crcData = new Uint8Array(4 + data.length);
  crcData.set(typeBytes);
  crcData.set(data, 4);
  const crc = crc32(crcData);
  view.setUint32(8 + data.length, crc, false);
  
  return chunk;
}

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Decode PNG to RGBA pixel buffer
 */
export function decodePNG(pngData: Uint8Array): { pixels: Uint8Array; width: number; height: number } {
  // Verify PNG signature
  const signature = pngData.slice(0, 8);
  const expectedSig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  
  for (let i = 0; i < 8; i++) {
    if (signature[i] !== expectedSig[i]) {
      throw new Error('Invalid PNG signature');
    }
  }
  
  let offset = 8;
  let width = 0;
  let height = 0;
  let imageData: Uint8Array | null = null;
  
  // Parse chunks
  while (offset < pngData.length) {
    const view = new DataView(pngData.buffer, pngData.byteOffset + offset);
    const length = view.getUint32(0, false);
    const type = String.fromCharCode(
      pngData[offset + 4],
      pngData[offset + 5],
      pngData[offset + 6],
      pngData[offset + 7]
    );
    const data = pngData.slice(offset + 8, offset + 8 + length);
    
    if (type === 'IHDR') {
      const ihdrView = new DataView(data.buffer, data.byteOffset);
      width = ihdrView.getUint32(0, false);
      height = ihdrView.getUint32(4, false);
    } else if (type === 'IDAT') {
      imageData = inflateData(data);
    } else if (type === 'IEND') {
      break;
    }
    
    offset += 12 + length; // length + type + data + crc
  }
  
  if (!imageData || width === 0 || height === 0) {
    throw new Error('Invalid PNG: missing required chunks');
  }
  
  // Remove filter bytes
  const pixels = new Uint8Array(width * height * 4);
  const bytesPerRow = width * 4;
  
  for (let y = 0; y < height; y++) {
    const filterByte = imageData[y * (bytesPerRow + 1)];
    const scanline = imageData.slice(
      y * (bytesPerRow + 1) + 1,
      (y + 1) * (bytesPerRow + 1)
    );
    
    // For simplicity, assume filter type 0 (no filter)
    if (filterByte !== 0) {
      throw new Error('Unsupported PNG filter type');
    }
    
    pixels.set(scanline, y * bytesPerRow);
  }
  
  return { pixels, width, height };
}

function inflateData(compressed: Uint8Array): Uint8Array {
  // Skip zlib header (2 bytes)
  let offset = 2;
  
  const blocks: Uint8Array[] = [];
  
  while (offset < compressed.length - 4) { // -4 for Adler checksum
    const bfinalAndType = compressed[offset++];
    const isLast = (bfinalAndType & 0x01) !== 0;
    const btype = (bfinalAndType >> 1) & 0x03;
    
    if (btype !== 0) {
      throw new Error('Only uncompressed PNG blocks supported');
    }
    
    const len = compressed[offset] | (compressed[offset + 1] << 8);
    offset += 4; // len + nlen
    
    const block = compressed.slice(offset, offset + len);
    blocks.push(block);
    offset += len;
    
    if (isLast) break;
  }
  
  // Concatenate blocks
  const totalLength = blocks.reduce((sum, block) => sum + block.length, 0);
  const result = new Uint8Array(totalLength);
  let resultOffset = 0;
  
  for (const block of blocks) {
    result.set(block, resultOffset);
    resultOffset += block.length;
  }
  
  return result;
}
