import * as FileSystem from 'expo-file-system/legacy';
import { encodePNG, decodePNG, PNGProgressCallback } from './pngEncoder';


/**
 * Saves pixel buffer as PNG file using legacy FileSystem API.
 * Compatible with Expo Go and SDK 54.
 */
export async function savePixelsAsPNG(
  pixels: Uint8Array,
  width: number,
  height: number,
  filename = 'encoded_data.png',
  onProgress?: (phase: string, percent: number) => void
): Promise<string> {
  // FIXED: Map PNG encoder phases to proper phase names
  const pngProgress: PNGProgressCallback = (phase, percent) => {
    // Map internal PNG phases to user-friendly display phases
    if (phase === 'Creating PNG structure') {
      onProgress?.('encodePNG', percent);
    } else if (phase === 'Compressing image data') {
      onProgress?.('encodePNG', percent);
    } else if (phase === 'Finalizing PNG') {
      onProgress?.('encodePNG', percent);
    } else {
      onProgress?.('encodePNG', percent);
    }
  };

  const pngData = await encodePNG(pixels, width, height, pngProgress);

  onProgress?.('writeFile', 0);

  // Compose full document path the legacy way
  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  // Delete existing file if any
  const info = await FileSystem.getInfoAsync(fileUri);
  if (info.exists) {
    await FileSystem.deleteAsync(fileUri);
  }

  // Write PNG data base64 encoded
  const base64 = arrayBufferToBase64(pngData);
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Verify it exists and is not empty
  const postInfo = await FileSystem.getInfoAsync(fileUri);
  if (!postInfo.exists || postInfo.size === 0) {
    throw new Error('File write failed or produced empty file.');
  }

  onProgress?.('writeFile', 100);

  return fileUri;
}


/**
 * Loads PNG from file URI, returns decoded pixels buffer.
 */
export async function loadPNGAsPixels(
  fileUri: string,
  onProgress?: (phase: string, percent: number) => void
): Promise<{ pixels: Uint8Array; width: number; height: number }> {
  onProgress?.('readFile', 0);

  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) {
    throw new Error(`File does not exist at ${fileUri}`);
  }
  if (info.size === 0) {
    throw new Error(`File is empty at ${fileUri}`);
  }

  // Read as base64 string
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const pngData = base64ToArrayBuffer(base64);

  onProgress?.('readFile', 100);

  // FIXED: Map PNG decoder phases to proper phase names
  const pngProgress: PNGProgressCallback = (phase, percent) => {
    // Map internal PNG phases to user-friendly display phases
    if (phase === 'Parsing PNG structure') {
      onProgress?.('decodePNG', percent);
    } else if (phase === 'Decompressing image data') {
      onProgress?.('decodePNG', percent);
    } else if (phase === 'Extracting pixel data') {
      onProgress?.('decodePNG', percent);
    } else {
      onProgress?.('decodePNG', percent);
    }
  };

  return decodePNG(pngData, pngProgress);
}


/**
 * Util: Uint8Array to base64
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}


/**
 * Util: base64 to Uint8Array
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
