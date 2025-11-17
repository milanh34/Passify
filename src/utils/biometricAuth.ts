import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';


export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';


export interface BiometricCapability {
  isAvailable: boolean;
  biometricType: BiometricType;
  hasHardware: boolean;
  isEnrolled: boolean;
}


export async function checkBiometricCapability(): Promise<BiometricCapability> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!hasHardware || !isEnrolled) {
      return {
        isAvailable: false,
        biometricType: 'none',
        hasHardware,
        isEnrolled,
      };
    }


    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    let biometricType: BiometricType = 'none';
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'facial';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
    }


    return {
      isAvailable: true,
      biometricType,
      hasHardware,
      isEnrolled,
    };
  } catch (error) {
    console.error('Biometric capability check error:', error);
    return {
      isAvailable: false,
      biometricType: 'none',
      hasHardware: false,
      isEnrolled: false,
    };
  }
}


export async function authenticateWithBiometric(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const capability = await checkBiometricCapability();
    
    if (!capability.isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available',
      };
    }


    const biometricName = getBiometricTypeName(capability.biometricType);


    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Unlock Passify with ${biometricName}`,
      cancelLabel: 'Use PIN',
      disableDeviceFallback: true,
      fallbackLabel: 'Use PIN',
    });


    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error === 'user_cancel' 
          ? 'Authentication cancelled' 
          : 'Authentication failed',
      };
    }
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
}


export function getBiometricTypeName(type: BiometricType): string {
  switch (type) {
    case 'facial':
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    case 'fingerprint':
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    case 'iris':
      return 'Iris Recognition';
    default:
      return 'Biometric';
  }
}


export function getBiometricIcon(type: BiometricType): string {
  switch (type) {
    case 'facial':
      return 'scan-outline';
    case 'fingerprint':
      return 'finger-print-outline';
    case 'iris':
      return 'eye-outline';
    default:
      return 'lock-closed-outline';
  }
}
