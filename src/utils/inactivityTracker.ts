import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ACTIVITY_KEY = '@Passify:last_activity';

export type InactivityTimeout = 1 | 5 | 10 | 30 | 0; // 0 = Never

/**
 * Get last activity timestamp
 */
export async function getLastActivity(): Promise<number> {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
    return timestamp ? parseInt(timestamp, 10) : Date.now();
  } catch (error) {
    console.error('Get last activity error:', error);
    return Date.now();
  }
}

/**
 * Update last activity timestamp
 */
export async function updateLastActivity(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch (error) {
    console.error('Update last activity error:', error);
  }
}

/**
 * Check if inactivity timeout has been exceeded
 */
export async function checkInactivityTimeout(
  timeoutMinutes: InactivityTimeout
): Promise<boolean> {
  if (timeoutMinutes === 0) {
    return false; // Never lock
  }

  try {
    const lastActivity = await getLastActivity();
    const now = Date.now();
    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    return (now - lastActivity) > timeoutMs;
  } catch (error) {
    console.error('Check inactivity error:', error);
    return false;
  }
}

/**
 * Hook to track screen activity and update last interaction time
 */
export function useInactivityTracker(isEnabled: boolean = true) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isEnabled) return;

    // Update activity on mount
    updateLastActivity();

    // Listen to app state changes
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App came to foreground - don't update activity
          // Let AuthContext check timeout
          console.log('🔍 App returned to foreground');
        } else if (nextAppState.match(/inactive|background/)) {
          // App going to background - update last activity
          updateLastActivity();
          console.log('⏸️  App going to background');
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isEnabled]);

  // Return function to manually update activity
  return {
    updateActivity: updateLastActivity,
  };
}

/**
 * Get human-readable timeout label
 */
export function getTimeoutLabel(minutes: InactivityTimeout): string {
  if (minutes === 0) return 'Never';
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
}
