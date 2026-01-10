// src/utils/image.ts

import * as FileSystem from "expo-file-system/legacy";
import { encodePNG, decodePNG, PNGProgressCallback } from "./pngEncoder";

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function savePixelsAsPNG(
  pixels: Uint8Array,
  width: number,
  height: number,
  filename: string,
  onProgress?: (phase: string, percent: number) => void
): Promise<{ cacheUri: string; base64: string }> {
  const pngProgress: PNGProgressCallback = (phase, percent) => {
    if (phase === "Creating PNG structure") {
      onProgress?.("encodePNG", percent);
    } else if (phase === "Compressing image data") {
      onProgress?.("encodePNG", percent);
    } else if (phase === "Finalizing PNG") {
      onProgress?.("encodePNG", percent);
    } else {
      onProgress?.("encodePNG", percent);
    }
  };

  const pngData = await encodePNG(pixels, width, height, pngProgress);

  onProgress?.("writeFile", 0);

  const cacheUri = `${FileSystem.cacheDirectory}${filename}`;
  const info = await FileSystem.getInfoAsync(cacheUri);
  if (info.exists) {
    await FileSystem.deleteAsync(cacheUri);
  }

  const base64 = arrayBufferToBase64(pngData);

  await FileSystem.writeAsStringAsync(cacheUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const postInfo = await FileSystem.getInfoAsync(cacheUri);
  if (!postInfo.exists || postInfo.size === 0) {
    throw new Error("Cache file write failed or produced empty file.");
  }

  onProgress?.("writeFile", 100);

  return { cacheUri, base64 };
}

export async function loadPNGAsPixels(
  fileUri: string,
  onProgress?: (phase: string, percent: number) => void
): Promise<{ pixels: Uint8Array; width: number; height: number }> {
  onProgress?.("readFile", 0);

  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) {
    throw new Error(`File does not exist at ${fileUri}`);
  }
  if (info.size === 0) {
    throw new Error(`File is empty at ${fileUri}`);
  }

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const pngData = base64ToArrayBuffer(base64);
  onProgress?.("readFile", 100);

  const pngProgress: PNGProgressCallback = (phase, percent) => {
    if (phase === "Parsing PNG structure") {
      onProgress?.("decodePNG", percent);
    } else if (phase === "Decompressing image data") {
      onProgress?.("decodePNG", percent);
    } else if (phase === "Extracting pixel data") {
      onProgress?.("decodePNG", percent);
    } else {
      onProgress?.("decodePNG", percent);
    }
  };

  return decodePNG(pngData, pngProgress);
}

export async function getBase64FromUri(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error: any) {
    console.error("Error reading file as base64:", error);
    throw new Error(`Failed to read file: ${error.message}`);
  }
}
