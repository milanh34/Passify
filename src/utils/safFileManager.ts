// src/utils/safFileManager.ts

import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import * as Sharing from "expo-sharing";

const { StorageAccessFramework } = FileSystem;

export interface SaveResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export interface ReadResult {
  success: boolean;
  content?: string;
  uri?: string;
  error?: string;
}

export async function saveFileWithSAF(
  filename: string,
  base64Content: string,
  mimeType: string = "image/png"
): Promise<SaveResult> {
  try {
    if (Platform.OS !== "android") {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, base64Content, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return { success: true, uri: fileUri };
    }

    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      return { success: false, error: "Storage permission denied by user" };
    }

    const directoryUri = permissions.directoryUri;
    const fileUri = await StorageAccessFramework.createFileAsync(directoryUri, filename, mimeType);

    await FileSystem.writeAsStringAsync(fileUri, base64Content, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { success: true, uri: fileUri };
  } catch (error: any) {
    console.error("SAF save error:", error);
    return {
      success: false,
      error: error.message || "Failed to save file",
    };
  }
}

export async function readFileWithSAF(): Promise<ReadResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/png",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { success: false, error: "User cancelled file selection" };
    }

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { success: true, content, uri: fileUri };
  } catch (error: any) {
    console.error("SAF read error:", error);
    return {
      success: false,
      error: error.message || "Failed to read file",
    };
  }
}

export async function shareFile(fileUri: string, mimeType: string = "image/png"): Promise<boolean> {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      console.error("Sharing is not available on this device");
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: "Save your Passify backup",
    });

    return true;
  } catch (error) {
    console.error("Share error:", error);
    return false;
  }
}
