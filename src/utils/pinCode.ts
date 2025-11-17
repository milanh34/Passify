import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';


const PIN_KEY = 'Passify_user_pin';
const SALT = 'PassifySecurePIN2025';


export interface PINValidation {
  isValid: boolean;
  minLength: number;
  maxLength: number;
  isNumeric: boolean;
}


export function validatePINFormat(pin: string): PINValidation {
  const minLength = 4;
  const maxLength = 6;
  const isNumeric = /^\d+$/.test(pin);
  const isValid = 
    pin.length >= minLength && 
    pin.length <= maxLength && 
    isNumeric;


  return {
    isValid,
    minLength,
    maxLength,
    isNumeric,
  };
}


async function hashPIN(pin: string): Promise<string> {
  try {
    const combined = pin + SALT;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined
    );
    return hash;
  } catch (error) {
    console.error('Hash PIN error:', error);
    throw new Error('Failed to hash PIN');
  }
}


export async function storePIN(pin: string): Promise<boolean> {
  try {
    const validation = validatePINFormat(pin);
    if (!validation.isValid) {
      throw new Error('Invalid PIN format');
    }


    const hashedPIN = await hashPIN(pin);
    await SecureStore.setItemAsync(PIN_KEY, hashedPIN);
    return true;
  } catch (error) {
    console.error('Store PIN error:', error);
    return false;
  }
}


export async function verifyPIN(pin: string): Promise<boolean> {
  try {
    const storedHash = await SecureStore.getItemAsync(PIN_KEY);
    if (!storedHash) {
      return false;
    }


    const inputHash = await hashPIN(pin);
    return inputHash === storedHash;
  } catch (error) {
    console.error('Verify PIN error:', error);
    return false;
  }
}


export async function isPINSet(): Promise<boolean> {
  try {
    const storedHash = await SecureStore.getItemAsync(PIN_KEY);
    return storedHash !== null;
  } catch (error) {
    console.error('Check PIN error:', error);
    return false;
  }
}


export async function removePIN(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(PIN_KEY);
    return true;
  } catch (error) {
    console.error('Remove PIN error:', error);
    return false;
  }
}


export async function changePIN(oldPIN: string, newPIN: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const isOldValid = await verifyPIN(oldPIN);
    if (!isOldValid) {
      return {
        success: false,
        error: 'Current PIN is incorrect',
      };
    }


    const validation = validatePINFormat(newPIN);
    if (!validation.isValid) {
      return {
        success: false,
        error: `PIN must be ${validation.minLength}-${validation.maxLength} digits`,
      };
    }


    const stored = await storePIN(newPIN);
    if (!stored) {
      return {
        success: false,
        error: 'Failed to save new PIN',
      };
    }


    return { success: true };
  } catch (error: any) {
    console.error('Change PIN error:', error);
    return {
      success: false,
      error: error.message || 'Failed to change PIN',
    };
  }
}
