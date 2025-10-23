import { File, Paths } from 'expo-file-system';
import { encodePNG, decodePNG } from './pngEncoder';

/**
 * Save pixel buffer as PNG file using new Expo SDK 54 File System API
 */
export async function savePixelsAsPNG(
  pixels: Uint8Array,
  width: number,
  height: number,
  filename: string = 'encoded_data.png'
): Promise<string> {
  // Encode to PNG
  const pngData = await encodePNG(pixels, width, height);
  
  // Convert to base64
  const base64 = arrayBufferToBase64(pngData);
  
  // Create file in document directory using new API
  const file = new File(Paths.document, filename);
  
  // Create and write as base64
  // The write method accepts string or Uint8Array
  // For base64, we need to write the decoded bytes
  await file.create();
  await file.write(pngData); // Write the raw PNG bytes directly
  
  return file.uri;
}

/**
 * Load PNG file and extract pixel buffer using new Expo SDK 54 File System API
 */
export async function loadPNGAsPixels(fileUri: string): Promise<{ pixels: Uint8Array; width: number; height: number }> {
  // Create File object from URI
  const file = new File(fileUri);
  
  // Read as Uint8Array (bytes)
  const pngData = await file.bytes();
  
  // Decode PNG
  return decodePNG(pngData);
}

/**
 * Helper: Uint8Array to base64 string (kept for potential future use)
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Helper: base64 string to Uint8Array (kept for potential future use)
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
