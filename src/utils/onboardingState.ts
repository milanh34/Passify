import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@PM:onboarding_state";
const ONBOARDING_VERSION = 1; // Increment when onboarding content changes

export interface OnboardingState {
  onboardingComplete: boolean;
  onboardingCompletedDate?: number;
  onboardingVersion: number;
  lastOnboardingViewDate?: number;
  skippedSlides?: number[];
}

const DEFAULT_STATE: OnboardingState = {
  onboardingComplete: false,
  onboardingVersion: ONBOARDING_VERSION,
};

/**
 * Load onboarding state from AsyncStorage
 */
export async function loadOnboardingState(): Promise<OnboardingState> {
  try {
    const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      const parsed: OnboardingState = JSON.parse(stored);
      
      // Check if onboarding version has changed
      if (parsed.onboardingVersion !== ONBOARDING_VERSION) {
        console.log("Onboarding version changed, resetting state");
        return DEFAULT_STATE;
      }
      
      return parsed;
    }
    return DEFAULT_STATE;
  } catch (error) {
    console.error("Failed to load onboarding state:", error);
    return DEFAULT_STATE;
  }
}

/**
 * Save onboarding state to AsyncStorage
 */
export async function saveOnboardingState(state: OnboardingState): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save onboarding state:", error);
  }
}

/**
 * Mark onboarding as complete
 */
export async function completeOnboarding(): Promise<void> {
  const state: OnboardingState = {
    onboardingComplete: true,
    onboardingCompletedDate: Date.now(),
    onboardingVersion: ONBOARDING_VERSION,
  };
  await saveOnboardingState(state);
}

/**
 * Check if onboarding has been completed
 */
export async function isOnboardingComplete(): Promise<boolean> {
  const state = await loadOnboardingState();
  return state.onboardingComplete;
}

/**
 * Reset onboarding state (for replay from Settings)
 */
export async function resetOnboarding(): Promise<void> {
  await saveOnboardingState({
    ...DEFAULT_STATE,
    lastOnboardingViewDate: Date.now(),
  });
}

/**
 * Skip onboarding
 */
export async function skipOnboarding(): Promise<void> {
  await completeOnboarding();
}
