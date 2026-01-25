// src/utils/pinAttemptTracker.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "./logger";

const PIN_ATTEMPTS_KEY = "@Passify:pin_attempts";

export interface PINAttemptState {
  failedAttempts: number;
  lastFailedAttempt: number;
  lockoutUntil: number;
  totalLifetimeFailures: number;
}

const DEFAULT_STATE: PINAttemptState = {
  failedAttempts: 0,
  lastFailedAttempt: 0,
  lockoutUntil: 0,
  totalLifetimeFailures: 0,
};

const LOCKOUT_THRESHOLDS: { attempts: number; durationMs: number; message: string }[] = [
  { attempts: 5, durationMs: 30 * 1000, message: "Too many attempts. Wait 30 seconds." },
  { attempts: 8, durationMs: 2 * 60 * 1000, message: "Too many attempts. Wait 2 minutes." },
  { attempts: 10, durationMs: 5 * 60 * 1000, message: "Too many attempts. Wait 5 minutes." },
  { attempts: 12, durationMs: 15 * 60 * 1000, message: "Too many attempts. Wait 15 minutes." },
  { attempts: 15, durationMs: 60 * 60 * 1000, message: "Too many attempts. Wait 1 hour." },
  { attempts: 20, durationMs: 24 * 60 * 60 * 1000, message: "Account locked for 24 hours." },
];

const DATA_WIPE_WARNING_THRESHOLD = 25;

const DATA_WIPE_THRESHOLD = 30;

export async function getPINAttemptState(): Promise<PINAttemptState> {
  try {
    const stored = await AsyncStorage.getItem(PIN_ATTEMPTS_KEY);
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    }
    return DEFAULT_STATE;
  } catch (error) {
    log.error("❌ Failed to get PIN attempt state:", error);
    return DEFAULT_STATE;
  }
}

async function savePINAttemptState(state: PINAttemptState): Promise<void> {
  try {
    await AsyncStorage.setItem(PIN_ATTEMPTS_KEY, JSON.stringify(state));
  } catch (error) {
    log.error("❌ Failed to save PIN attempt state:", error);
  }
}

export async function checkLockoutStatus(): Promise<{
  isLockedOut: boolean;
  remainingMs: number;
  remainingFormatted: string;
  failedAttempts: number;
  showDataWipeWarning: boolean;
  shouldWipeData: boolean;
}> {
  const state = await getPINAttemptState();
  const now = Date.now();

  const isLockedOut = state.lockoutUntil > now;
  const remainingMs = isLockedOut ? state.lockoutUntil - now : 0;

  return {
    isLockedOut,
    remainingMs,
    remainingFormatted: formatRemainingTime(remainingMs),
    failedAttempts: state.failedAttempts,
    showDataWipeWarning: state.totalLifetimeFailures >= DATA_WIPE_WARNING_THRESHOLD,
    shouldWipeData: state.totalLifetimeFailures >= DATA_WIPE_THRESHOLD,
  };
}

export async function recordFailedAttempt(): Promise<{
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutDurationMs: number;
  lockoutMessage: string;
  showDataWipeWarning: boolean;
  shouldWipeData: boolean;
}> {
  const state = await getPINAttemptState();
  const now = Date.now();

  state.failedAttempts += 1;
  state.totalLifetimeFailures += 1;
  state.lastFailedAttempt = now;

  let lockoutDurationMs = 0;
  let lockoutMessage = "";

  for (const threshold of LOCKOUT_THRESHOLDS) {
    if (state.failedAttempts >= threshold.attempts) {
      lockoutDurationMs = threshold.durationMs;
      lockoutMessage = threshold.message;
    }
  }

  if (lockoutDurationMs > 0) {
    state.lockoutUntil = now + lockoutDurationMs;
  }

  await savePINAttemptState(state);

  log.info(
    `🔒 Failed PIN attempt #${state.failedAttempts} (lifetime: ${state.totalLifetimeFailures})`
  );

  return {
    failedAttempts: state.failedAttempts,
    isLockedOut: lockoutDurationMs > 0,
    lockoutDurationMs,
    lockoutMessage,
    showDataWipeWarning: state.totalLifetimeFailures >= DATA_WIPE_WARNING_THRESHOLD,
    shouldWipeData: state.totalLifetimeFailures >= DATA_WIPE_THRESHOLD,
  };
}

export async function recordSuccessfulAttempt(): Promise<void> {
  const state = await getPINAttemptState();

  state.failedAttempts = 0;
  state.lockoutUntil = 0;
  state.lastFailedAttempt = 0;

  await savePINAttemptState(state);
  log.info("✅ PIN attempt successful, counter reset");
}

export async function resetAttemptTracking(): Promise<void> {
  await AsyncStorage.removeItem(PIN_ATTEMPTS_KEY);
  log.info("✅ PIN attempt tracking reset");
}

export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return "";

  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0 && minutes < 5) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
}

export async function getAttemptsUntilNextLockout(): Promise<{
  attemptsRemaining: number;
  nextLockoutDuration: string;
}> {
  const state = await getPINAttemptState();

  for (const threshold of LOCKOUT_THRESHOLDS) {
    if (state.failedAttempts < threshold.attempts) {
      return {
        attemptsRemaining: threshold.attempts - state.failedAttempts,
        nextLockoutDuration: formatRemainingTime(threshold.durationMs),
      };
    }
  }

  return {
    attemptsRemaining: 0,
    nextLockoutDuration: "maximum",
  };
}
