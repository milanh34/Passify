// src/utils/fileSharing.ts

import { Platform } from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import IntentLauncher from "expo-intent-launcher";
import * as MediaLibrary from "expo-media-library";
import { log } from "./logger";

export type MessageCallback = (
  message: string,
  type: "success" | "error" | "info" | "warning"
) => void;

export async function shareFile(
  fileUri: string,
  mimeType: string = "image/png",
  onMessage?: MessageCallback
): Promise<boolean> {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      onMessage?.("Sharing is not available on this device", "error");
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: "Share Encrypted Backup",
      UTI: mimeType === "image/png" ? "public.png" : "com.adobe.pdf",
    });
    return true;
  } catch (error: any) {
    if (__DEV__) {
      log.error("❌ Share error:", error);
    }
    onMessage?.("Failed to share file", "error");
    return false;
  }
}

async function requestMediaLibraryPermissions(onMessage?: MessageCallback): Promise<boolean> {
  try {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") return true;

    if (!canAskAgain) {
      onMessage?.(
        "Media library access is disabled. Please enable it in device settings.",
        "error"
      );
    } else {
      onMessage?.("Storage permission is required to save files", "warning");
    }

    return false;
  } catch (error: any) {
    if (__DEV__) {
      log.error("❌ Permission request error:", error);
    }
    onMessage?.("Failed to request storage permission", "error");
    return false;
  }
}

async function saveToMediaLibrary(fileUri: string, onMessage?: MessageCallback): Promise<boolean> {
  try {
    const granted = await requestMediaLibraryPermissions(onMessage);
    if (!granted) {
      return false;
    }

    const asset = await MediaLibrary.createAssetAsync(fileUri);

    if (Platform.OS === "android") {
      try {
        await MediaLibrary.createAlbumAsync("Passify Backups", asset, false);
      } catch (albumError) {
        if (__DEV__) {
          log.info("⚠️ Album creation failed (asset still saved):", albumError);
        }
      }
    }

    onMessage?.("File saved to your device gallery", "success");
    return true;
  } catch (error: any) {
    if (__DEV__) {
      log.error("❌ Save to media library error:", error);
    }

    if (error.message?.includes("permission")) {
      onMessage?.("Storage permission is required to save files to gallery", "error");
    } else if (error.message?.includes("not found") || error.message?.includes("ENOENT")) {
      onMessage?.("The backup file could not be found. Please try generating it again.", "error");
    } else {
      onMessage?.("Could not save to gallery", "error");
    }
    return false;
  }
}

async function saveWithSAF(
  sourceUri: string,
  filename: string,
  onMessage?: MessageCallback
): Promise<boolean> {
  try {
    const contentUri = await FileSystem.getContentUriAsync(sourceUri);

    await IntentLauncher.startActivityAsync("android.intent.action.CREATE_DOCUMENT", {
      data: contentUri,
      type: "image/png",
      category: "android.intent.category.OPENABLE",
      extra: { "android.intent.extra.TITLE": filename },
    });

    onMessage?.("File saved successfully", "success");
    return true;
  } catch (error: any) {
    if (__DEV__) {
      log.error("❌ SAF error:", error);
    }

    if (error.message?.includes("Activity not found")) {
      onMessage?.("File picker is not available on this device", "warning");
    } else if (error.message?.includes("Permission") || error.message?.includes("denied")) {
      onMessage?.("Storage permission is required to save files", "error");
    } else if (error.message?.includes("cancelled") || error.message?.includes("cancel")) {
      return false;
    } else {
      onMessage?.("Could not save using system file picker", "warning");
    }

    return false;
  }
}

export async function downloadImage(
  fileUri: string,
  filename: string,
  onMessage?: MessageCallback
): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      onMessage?.("Backup file not found. Please regenerate the backup.", "error");
      return false;
    }

    if (Platform.OS === "android") {
      const safSuccess = await saveWithSAF(fileUri, filename, onMessage);
      if (safSuccess) {
        return true;
      }

      const mediaSuccess = await saveToMediaLibrary(fileUri, onMessage);
      if (mediaSuccess) {
        return true;
      }

      onMessage?.(
        "Could not save to device storage. Please use the Share button instead.",
        "warning"
      );
      return false;
    } else {
      const mediaSuccess = await saveToMediaLibrary(fileUri, onMessage);
      if (mediaSuccess) {
        return true;
      }

      onMessage?.("Opening share menu...", "info");
      return await shareFile(fileUri, "image/png", onMessage);
    }
  } catch (error: any) {
    if (__DEV__) {
      log.error("❌ Unexpected download error:", error);
    }
    onMessage?.("Download failed. Please try the Share button instead.", "error");
    return false;
  }
}

export async function getContentUri(fileUri: string): Promise<string> {
  if (Platform.OS === "android") {
    try {
      return await FileSystem.getContentUriAsync(fileUri);
    } catch (error) {
      if (__DEV__) {
        log.error("getContentUri error:", error);
      }
      return fileUri;
    }
  }
  return fileUri;
}
