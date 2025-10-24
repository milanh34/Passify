import { File, Paths } from 'expo-file-system';
import { encodePNG, decodePNG, ProgressCallback } from './pngEncoder';

/**
 * Save pixel buffer as PNG file with progress
 */
export async function savePixelsAsPNG(
  pixels: Uint8Array,
  width: number,
  height: number,
  filename: string = 'encoded_data.png',
  onProgress?: ProgressCallback
): Promise<string> {
  // Encode to PNG
  const pngData = await encodePNG(pixels, width, height, onProgress);
  
  onProgress?.('Writing to file', 0);
  
  // Create file in document directory
  const file = new File(Paths.document, filename);
  
  await file.create();
  await file.write(pngData);
  
  onProgress?.('Writing to file', 100);
  
  return file.uri;
}

/**
 * Load PNG file and extract pixel buffer with progress
 */
export async function loadPNGAsPixels(
  fileUri: string,
  onProgress?: ProgressCallback
): Promise<{ pixels: Uint8Array; width: number; height: number }> {
  onProgress?.('Reading file', 0);
  
  const file = new File(fileUri);
  const pngData = await file.bytes();
  
  onProgress?.('Reading file', 100);
  
  return decodePNG(pngData, onProgress);
}
