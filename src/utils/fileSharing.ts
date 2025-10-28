import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import IntentLauncher from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';

/**
 * Detect if running in Expo Go vs production build
 */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Share file with native share sheet
 */
export async function shareFile(fileUri: string, mimeType: string = 'image/png'): Promise<boolean> {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Share Unavailable', 'Sharing is not available on this device.');
      return false;
    }
    
    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: 'Share Encrypted Backup',
      UTI: mimeType === 'image/png' ? 'public.png' : 'com.adobe.pdf',
    });
    return true;
  } catch (error: any) {
    console.error('Share error:', error);
    Alert.alert('Share Failed', error.message || 'Failed to share file.');
    return false;
  }
}

/**
 * Request media library permissions
 */
async function requestMediaLibraryPermissions(): Promise<boolean> {
  try {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') return true;
    
    if (!canAskAgain) {
      Alert.alert(
        'Permission Required',
        'Media library access is disabled. Please enable it in your device settings to save images to Photos/Gallery.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // Note: Opening settings requires expo-linking or react-native Linking
            console.log('Open device settings');
          }}
        ]
      );
    }
    return false;
  } catch (error: any) {
    console.error('Permission request error:', error);
    return false;
  }
}

/**
 * Save file to media library (Photos/Gallery)
 */
async function saveToMediaLibrary(fileUri: string): Promise<boolean> {
  try {
    const granted = await requestMediaLibraryPermissions();
    if (!granted) return false;

    const asset = await MediaLibrary.createAssetAsync(fileUri);
    
    if (Platform.OS === 'android') {
      await MediaLibrary.createAlbumAsync('Passify Backups', asset, false);
    }
    
    Alert.alert('Saved', 'File saved to your device gallery.');
    return true;
  } catch (error: any) {
    console.error('Save to media library error:', error);
    Alert.alert('Save Failed', `Could not save to gallery: ${error.message}`);
    return false;
  }
}

/**
 * Android SAF-based save (folder picker)
 */
async function saveWithSAF(sourceUri: string, filename: string): Promise<boolean> {
  try {
    const contentUri = await FileSystem.getContentUriAsync(sourceUri);
    
    await IntentLauncher.startActivityAsync('android.intent.action.CREATE_DOCUMENT', {
      data: contentUri,
      type: 'image/png',
      category: 'android.intent.category.OPENABLE',
      extra: { 'android.intent.extra.TITLE': filename },
    });
    
    return true;
  } catch (error: any) {
    console.error('SAF error:', error);
    
    // Specific error messages
    if (error.message?.includes('Activity not found')) {
      Alert.alert('Feature Unavailable', 'File picker is not available on this device.');
    } else if (error.message?.includes('Permission')) {
      Alert.alert('Permission Denied', 'Storage permission is required to save files.');
    } else {
      Alert.alert('Save Failed', 'Could not save using system file picker.');
    }
    
    return false;
  }
}

/**
 * Main download function with Expo Go detection and fallbacks
 */
export async function downloadImage(fileUri: string, filename: string): Promise<boolean> {
  // Check if running in Expo Go
  if (isExpoGo()) {
    console.log('Running in Expo Go - download to device storage not available');
    
    Alert.alert(
      'Development Mode',
      `Download to device storage is only available in production builds.\n\nFile saved to app directory:\n${fileUri}\n\nUse the Share button to export this file.`,
      [
        { text: 'OK', style: 'cancel' },
        { text: 'Share Now', onPress: () => shareFile(fileUri) }
      ]
    );
    
    return false;
  }

  // Production build - platform-specific download
  try {
    if (Platform.OS === 'android') {
      // Try SAF first
      const safSuccess = await saveWithSAF(fileUri, filename);
      if (safSuccess) return true;
      
      // Fallback to media library
      console.log('SAF failed, trying media library...');
      const mediaSuccess = await saveToMediaLibrary(fileUri);
      if (mediaSuccess) return true;
      
      // Final fallback to share
      console.log('Media library failed, falling back to share...');
      Alert.alert(
        'Save Failed',
        'Could not save to device storage. Would you like to share the file instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share', onPress: () => shareFile(fileUri) }
        ]
      );
      return false;
      
    } else {
      // iOS - try media library first
      const mediaSuccess = await saveToMediaLibrary(fileUri);
      if (mediaSuccess) return true;
      
      // Fallback to share sheet
      console.log('Media library failed, falling back to share...');
      return await shareFile(fileUri);
    }
  } catch (error: any) {
    console.error('Download error:', error);
    Alert.alert('Download Failed', `An unexpected error occurred: ${error.message}`);
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
