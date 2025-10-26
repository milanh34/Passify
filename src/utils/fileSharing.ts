import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import IntentLauncher from 'expo-intent-launcher';

/**
 * Share image using system share sheet.
 */
export async function shareImage(fileUri: string): Promise<boolean> {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Share Unavailable', 'Sharing is not available on this device.');
      return false;
    }
    await Sharing.shareAsync(fileUri, {
      mimeType: 'image/png',
      dialogTitle: 'Share Encrypted Backup',
      UTI: 'public.png',
    });
    return true;
  } catch (error) {
    console.error('Share error:', error);
    return false;
  }
}

/**
 * Download/export with best cross-platform option.
 */
export async function downloadImage(fileUri: string, filename: string): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      return await downloadAndroid(fileUri, filename);
    } else {
      return await shareImage(fileUri);
    }
  } catch (error: any) {
    console.error('Download error:', error);
    Alert.alert('Download Failed', error.message || 'Failed to download file.');
    return false;
  }
}

/**
 * Android: Use Storage Access Framework.
 */
async function downloadAndroid(sourceUri: string, filename: string): Promise<boolean> {
  try {
    // SAF requires content URI; use FileSystem.getContentUriAsync (not deprecated!)
    const contentUri = await FileSystem.getContentUriAsync(sourceUri);
    await IntentLauncher.startActivityAsync('android.intent.action.CREATE_DOCUMENT', {
      data: contentUri,
      type: 'image/png',
      category: 'android.intent.category.OPENABLE',
      extra: { 'android.intent.extra.TITLE': filename },
    });
    return true;
  } catch (error: any) {
    Alert.alert(
      'Download',
      'Failed to save using Files. Please use the Share option to export this file.'
    );
    return false;
  }
}

/**
 * Utility for getting a content URI for Android sharing or SAF.
 */
export async function getContentUri(fileUri: string): Promise<string> {
  if (Platform.OS === 'android') {
    return await FileSystem.getContentUriAsync(fileUri);
  }
  return fileUri;
}
