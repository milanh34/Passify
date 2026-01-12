// src/utils/pinCode.ts

import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import {
  recordFailedAttempt,
  recordSuccessfulAttempt,
  checkLockoutStatus,
} from "./pinAttemptTracker";

const PIN_HASH_KEY = "Passify_pin_hash";
const PIN_SALT_KEY = "Passify_pin_salt";

export interface PINValidation {
  isValid: boolean;
  minLength: number;
  maxLength: number;
  isNumeric: boolean;
}

export interface PINVerifyResult {
  success: boolean;
  error?: string;
  isLockedOut?: boolean;
  lockoutRemainingMs?: number;
  lockoutMessage?: string;
  failedAttempts?: number;
  showDataWipeWarning?: boolean;
}

export function validatePINFormat(pin: string): PINValidation {
  const minLength = 4;
  const maxLength = 6;
  const isNumeric = /^\d+$/.test(pin);
  const isValid = pin.length >= minLength && pin.length <= maxLength && isNumeric;

  return {
    isValid,
    minLength,
    maxLength,
    isNumeric,
  };
}

async function generateSalt(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getUserSalt(): Promise<string> {
  let salt = await SecureStore.getItemAsync(PIN_SALT_KEY);

  if (!salt) {
    salt = await generateSalt();
    await SecureStore.setItemAsync(PIN_SALT_KEY, salt);
  }

  return salt;
}

async function hashPIN(pin: string): Promise<string> {
  try {
    const salt = await getUserSalt();
    const combined = pin + salt;

    let hash = combined;
    const iterations = 10000;

    for (let i = 0; i < iterations; i++) {
      hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, hash);
    }

    return hash;
  } catch (error) {
    console.error("Hash PIN error:", error);
    throw new Error("Failed to hash PIN");
  }
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export async function storePIN(pin: string): Promise<boolean> {
  try {
    const validation = validatePINFormat(pin);
    if (!validation.isValid) {
      throw new Error("Invalid PIN format");
    }

    const hashedPIN = await hashPIN(pin);
    await SecureStore.setItemAsync(PIN_HASH_KEY, hashedPIN);
    return true;
  } catch (error) {
    console.error("Store PIN error:", error);
    return false;
  }
}

export async function verifyPIN(pin: string): Promise<boolean> {
  const result = await verifyPINWithDetails(pin);
  return result.success;
}

export async function verifyPINWithDetails(pin: string): Promise<PINVerifyResult> {
  try {
    const lockoutStatus = await checkLockoutStatus();

    if (lockoutStatus.isLockedOut) {
      return {
        success: false,
        isLockedOut: true,
        lockoutRemainingMs: lockoutStatus.remainingMs,
        lockoutMessage: `Too many attempts. Try again in ${lockoutStatus.remainingFormatted}`,
        failedAttempts: lockoutStatus.failedAttempts,
        showDataWipeWarning: lockoutStatus.showDataWipeWarning,
      };
    }

    if (lockoutStatus.shouldWipeData) {
      return {
        success: false,
        error: "Maximum attempts exceeded. Data has been wiped for security.",
        showDataWipeWarning: true,
      };
    }

    const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
    if (!storedHash) {
      return {
        success: false,
        error: "No PIN configured",
      };
    }

    const inputHash = await hashPIN(pin);
    const isCorrect = constantTimeCompare(inputHash, storedHash);

    if (isCorrect) {
      await recordSuccessfulAttempt();
      return { success: true };
    } else {
      const attemptResult = await recordFailedAttempt();

      return {
        success: false,
        error: "Incorrect PIN",
        isLockedOut: attemptResult.isLockedOut,
        lockoutRemainingMs: attemptResult.lockoutDurationMs,
        lockoutMessage: attemptResult.lockoutMessage,
        failedAttempts: attemptResult.failedAttempts,
        showDataWipeWarning: attemptResult.showDataWipeWarning,
      };
    }
  } catch (error: any) {
    console.error("Verify PIN error:", error);
    return {
      success: false,
      error: error.message || "Verification failed",
    };
  }
}

export async function getPINLockoutStatus(): Promise<{
  isLockedOut: boolean;
  remainingMs: number;
  remainingFormatted: string;
  failedAttempts: number;
}> {
  const status = await checkLockoutStatus();
  return {
    isLockedOut: status.isLockedOut,
    remainingMs: status.remainingMs,
    remainingFormatted: status.remainingFormatted,
    failedAttempts: status.failedAttempts,
  };
}

export async function isPINSet(): Promise<boolean> {
  try {
    const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
    return storedHash !== null;
  } catch (error) {
    console.error("Check PIN error:", error);
    return false;
  }
}

export async function removePIN(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(PIN_HASH_KEY);
    await SecureStore.deleteItemAsync(PIN_SALT_KEY);
    return true;
  } catch (error) {
    console.error("Remove PIN error:", error);
    return false;
  }
}

export async function changePIN(
  oldPIN: string,
  newPIN: string
): Promise<{
  success: boolean;
  error?: string;
  isLockedOut?: boolean;
  lockoutMessage?: string;
}> {
  try {
    const verifyResult = await verifyPINWithDetails(oldPIN);

    if (!verifyResult.success) {
      return {
        success: false,
        error: verifyResult.error || "Current PIN is incorrect",
        isLockedOut: verifyResult.isLockedOut,
        lockoutMessage: verifyResult.lockoutMessage,
      };
    }

    const validation = validatePINFormat(newPIN);
    if (!validation.isValid) {
      return {
        success: false,
        error: `PIN must be ${validation.minLength}-${validation.maxLength} digits`,
      };
    }

    const newSalt = await generateSalt();
    await SecureStore.setItemAsync(PIN_SALT_KEY, newSalt);

    const stored = await storePIN(newPIN);
    if (!stored) {
      return {
        success: false,
        error: "Failed to save new PIN",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Change PIN error:", error);
    return {
      success: false,
      error: error.message || "Failed to change PIN",
    };
  }
}
