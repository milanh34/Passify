import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import IntentLauncher from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';

/**
 * Message callback type for displaying user feedback
 */
export type MessageCallback = (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;

/**
 * Detect if running in Expo Go vs production build
 */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Share file with native share sheet
 */
export async function shareFile(
  fileUri: string,
  mimeType: string = 'image/png',
  onMessage?: MessageCallback
): Promise<boolean> {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      onMessage?.('Sharing is not available on this device', 'error');
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: 'Share Encrypted Backup',
      UTI: mimeType === 'image/png' ? 'public.png' : 'com.adobe.pdf',
    });
    return true;
  } catch (error: any) {
    console.error('❌ Share error:', error);
    onMessage?.(`Failed to share file: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Request media library permissions
 */
async function requestMediaLibraryPermissions(onMessage?: MessageCallback): Promise<boolean> {
  try {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') return true;

    if (!canAskAgain) {
      onMessage?.(
        'Media library access is disabled. Please enable it in device settings.',
        'error'
      );
    } else {
      onMessage?.('Storage permission is required to save files', 'warning');
    }

    return false;
  } catch (error: any) {
    console.error('❌ Permission request error:', error);
    onMessage?.('Failed to request storage permission', 'error');
    return false;
  }
}

/**
 * Save file to media library (Photos/Gallery)
 */
async function saveToMediaLibrary(
  fileUri: string,
  onMessage?: MessageCallback
): Promise<boolean> {
  try {
    console.log('📸 Attempting to save to media library...');
    const granted = await requestMediaLibraryPermissions(onMessage);
    if (!granted) {
      console.log('❌ Media library permission not granted');
      return false;
    }

    const asset = await MediaLibrary.createAssetAsync(fileUri);
    console.log('✅ Asset created:', asset.id);

    if (Platform.OS === 'android') {
      try {
        await MediaLibrary.createAlbumAsync('Passify Backups', asset, false);
        console.log('✅ Album created/updated');
      } catch (albumError) {
        console.log('⚠️ Album creation failed (asset still saved):', albumError);
      }
    }

    onMessage?.('File saved to your device gallery', 'success');
    return true;
  } catch (error: any) {
    console.error('❌ Save to media library error:', error);

    // Provide specific error messages
    if (error.message?.includes('permission')) {
      onMessage?.('Storage permission is required to save files to gallery', 'error');
    } else if (error.message?.includes('not found') || error.message?.includes('ENOENT')) {
      onMessage?.('The backup file could not be found. Please try generating it again.', 'error');
    } else {
      onMessage?.(`Could not save to gallery: ${error.message}`, 'error');
    }
    return false;
  }
}

/**
 * Android SAF-based save (folder picker)
 */
async function saveWithSAF(
  sourceUri: string,
  filename: string,
  onMessage?: MessageCallback
): Promise<boolean> {
  try {
    console.log('📂 Attempting SAF download...');
    const contentUri = await FileSystem.getContentUriAsync(sourceUri);

    await IntentLauncher.startActivityAsync('android.intent.action.CREATE_DOCUMENT', {
      data: contentUri,
      type: 'image/png',
      category: 'android.intent.category.OPENABLE',
      extra: { 'android.intent.extra.TITLE': filename },
    });

    console.log('✅ SAF intent launched successfully');
    onMessage?.('File saved successfully', 'success');
    return true;
  } catch (error: any) {
    console.error('❌ SAF error:', error);

    // Specific error messages
    if (error.message?.includes('Activity not found')) {
      console.log('⚠️ SAF not available on this device');
      onMessage?.('File picker is not available on this device', 'warning');
    } else if (error.message?.includes('Permission') || error.message?.includes('denied')) {
      onMessage?.('Storage permission is required to save files', 'error');
    } else if (error.message?.includes('cancelled') || error.message?.includes('cancel')) {
      console.log('ℹ️ User cancelled SAF picker');
      // Don't show message for user cancellation
      return false;
    } else {
      onMessage?.('Could not save using system file picker', 'warning');
    }

    return false;
  }
}

/**
 * Main download function with Expo Go detection and fallbacks
 */
export async function downloadImage(
  fileUri: string,
  filename: string,
  onMessage?: MessageCallback
): Promise<boolean> {
  console.log('📥 Download initiated:', { fileUri, filename, isExpoGo: isExpoGo() });

  // Check if running in Expo Go
  if (isExpoGo()) {
    console.log('⚠️ Running in Expo Go - download to device storage not available');
    onMessage?.(
      'Download to device storage is only available in production builds. Use the Share button to export.',
      'info'
    );
    return false;
  }

  // Production build - platform-specific download
  try {
    // Verify file exists before attempting download
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('Backup file not found. Please regenerate the backup.');
      }
      console.log('✅ File exists, size:', fileInfo.size);
    } catch (checkError: any) {
      console.error('❌ File check failed:', checkError);
      onMessage?.('The backup file could not be found. Please try generating it again.', 'error');
      return false;
    }

    if (Platform.OS === 'android') {
      // Android: Try SAF first
      console.log('🤖 Android detected - trying SAF first');
      const safSuccess = await saveWithSAF(fileUri, filename, onMessage);
      if (safSuccess) {
        console.log('✅ SAF download successful');
        return true;
      }

      // Fallback to media library
      console.log('📸 SAF failed, trying media library...');
      const mediaSuccess = await saveToMediaLibrary(fileUri, onMessage);
      if (mediaSuccess) {
        console.log('✅ Media library save successful');
        return true;
      }

      // Final fallback - just show a message
      console.log('📤 All download methods failed');
      onMessage?.(
        'Could not save to device storage. Please use the Share button instead.',
        'warning'
      );
      return false;

    } else {
      // iOS: Try media library first
      console.log('🍎 iOS detected - trying media library');
      const mediaSuccess = await saveToMediaLibrary(fileUri, onMessage);
      if (mediaSuccess) {
        console.log('✅ Media library save successful');
        return true;
      }

      // Fallback to share sheet
      console.log('📤 Media library failed, falling back to share...');
      onMessage?.('Opening share menu...', 'info');
      return await shareFile(fileUri, 'image/png', onMessage);
    }

  } catch (error: any) {
    console.error('❌ Unexpected download error:', error);
    onMessage?.(
      `Download failed: ${error.message}. Please try the Share button instead.`,
      'error'
    );
    return false;
  }
}

/**
 * Get content URI for sharing (Android)
 */
export async function getContentUri(fileUri: string): Promise<string> {
  if (Platform.OS === 'android') {
    try {
      return await FileSystem.getContentUriAsync(fileUri);
    } catch (error) {
      console.error('getContentUri error:', error);
      return fileUri;
    }
  }
  return fileUri;
}
