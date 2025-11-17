// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkBiometricCapability,
  authenticateWithBiometric,
  BiometricCapability,
} from '../utils/biometricAuth';
import { isPINSet, verifyPIN } from '../utils/pinCode';
import {
  InactivityTimeout,
  checkInactivityTimeout,
  updateLastActivity,
} from '../utils/inactivityTracker';


const AUTH_PREFERENCES_KEY = '@Passify:auth_preferences';


export interface AuthPreferences {
  biometricEnabled: boolean;
  inactivityTimeout: InactivityTimeout;
  lastUnlockTime: number;
  lastUnlockMethod: 'biometric' | 'pin' | 'none';
}


interface AuthContextType {
  isLocked: boolean;
  isAuthEnabled: boolean;
  biometricCapability: BiometricCapability | null;
  preferences: AuthPreferences;
  isPINConfigured: boolean;
  isInitialized: boolean;


  unlock: (method: 'biometric' | 'pin') => Promise<void>;
  lock: () => void;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  setInactivityTimeout: (minutes: InactivityTimeout) => Promise<void>;
  refreshBiometricCapability: () => Promise<void>;
  checkPINStatus: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


const DEFAULT_PREFERENCES: AuthPreferences = {
  biometricEnabled: false,
  inactivityTimeout: 5,
  lastUnlockTime: Date.now(),
  lastUnlockMethod: 'none',
};


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [biometricCapability, setBiometricCapability] =
    useState<BiometricCapability | null>(null);
  const [preferences, setPreferences] = useState<AuthPreferences>(DEFAULT_PREFERENCES);
  const [isPINConfigured, setIsPINConfigured] = useState(false);
  
  const appState = useRef(AppState.currentState);


  const loadPreferences = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Load auth preferences error:', error);
    }
  }, []);


  const savePreferences = useCallback(async (newPrefs: AuthPreferences) => {
    try {
      await AsyncStorage.setItem(AUTH_PREFERENCES_KEY, JSON.stringify(newPrefs));
      setPreferences(newPrefs);
    } catch (error) {
      console.error('Save auth preferences error:', error);
    }
  }, []);


  const isAuthEnabled = (preferences.biometricEnabled && biometricCapability?.isAvailable) || isPINConfigured;


  useEffect(() => {
    const initialize = async () => {
      console.log('🔐 Initializing AuthContext...');
      
      await loadPreferences();
      
      const capability = await checkBiometricCapability();
      setBiometricCapability(capability);
      
      const hasPIN = await isPINSet();
      setIsPINConfigured(hasPIN);


      const stored = await AsyncStorage.getItem(AUTH_PREFERENCES_KEY);
      const savedPrefs = stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
      
      if ((savedPrefs.biometricEnabled && capability.isAvailable) || hasPIN) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }


      setIsInitialized(true);
      console.log('✅ AuthContext initialized:', {
        biometric: capability.isAvailable,
        pin: hasPIN,
        locked: isLocked,
      });
    };


    initialize();
  }, [loadPreferences]);


  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          console.log('🔍 App returned to foreground, checking inactivity...');
          
          if (isAuthEnabled && !isLocked) {
            const shouldLock = await checkInactivityTimeout(preferences.inactivityTimeout);
            if (shouldLock) {
              console.log('🔒 Locking due to inactivity');
              setIsLocked(true);
            }
          }
        }


        appState.current = nextAppState;
      }
    );


    return () => {
      subscription.remove();
    };
  }, [isAuthEnabled, isLocked, preferences.inactivityTimeout]);


  const unlock = useCallback(
    async (method: 'biometric' | 'pin') => {
      const newPrefs: AuthPreferences = {
        ...preferences,
        lastUnlockTime: Date.now(),
        lastUnlockMethod: method,
      };
      await savePreferences(newPrefs);
      await updateLastActivity();
      setIsLocked(false);
      console.log(`✅ Unlocked via ${method}`);
    },
    [preferences, savePreferences]
  );


  const lock = useCallback(() => {
    if (isAuthEnabled) {
      setIsLocked(true);
      console.log('🔒 App locked');
    }
  }, [isAuthEnabled]);


  const setBiometricEnabled = useCallback(
    async (enabled: boolean) => {
      const newPrefs: AuthPreferences = {
        ...preferences,
        biometricEnabled: enabled,
      };
      await savePreferences(newPrefs);
      
      if (!enabled && !isPINConfigured) {
        setIsLocked(false);
      }
    },
    [preferences, savePreferences, isPINConfigured]
  );


  const setInactivityTimeout = useCallback(
    async (minutes: InactivityTimeout) => {
      const newPrefs: AuthPreferences = {
        ...preferences,
        inactivityTimeout: minutes,
      };
      await savePreferences(newPrefs);
    },
    [preferences, savePreferences]
  );


  const refreshBiometricCapability = useCallback(async () => {
    const capability = await checkBiometricCapability();
    setBiometricCapability(capability);
  }, []);


  const checkPINStatus = useCallback(async () => {
    const hasPIN = await isPINSet();
    setIsPINConfigured(hasPIN);
    
    if (!hasPIN && !preferences.biometricEnabled) {
      setIsLocked(false);
    }
  }, [preferences.biometricEnabled]);


  const value: AuthContextType = {
    isLocked,
    isAuthEnabled,
    biometricCapability,
    preferences,
    isPINConfigured,
    isInitialized,
    unlock,
    lock,
    setBiometricEnabled,
    setInactivityTimeout,
    refreshBiometricCapability,
    checkPINStatus,
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
