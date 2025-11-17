// app/_layout.tsx

import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { AnimationProvider } from "../src/context/AnimationContext";
import { DbProvider } from "../src/context/DbContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { View, LogBox, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "../src/components/ErrorBoundary";
import BiometricUnlockScreen from "./screens/BiometricUnlockScreen";
import { useState, useEffect } from "react";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { isOnboardingComplete } from "../src/utils/onboardingState";


LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);


function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isChecking, setIsChecking] = useState(true);


  useEffect(() => {
    if (!navigationState?.key) return;
    
    checkOnboarding();
  }, [navigationState?.key]);


  const checkOnboarding = async () => {
    try {
      const completed = await isOnboardingComplete();
      setIsChecking(false);


      if (!completed && segments[0] !== "onboarding") {
        setTimeout(() => {
          router.replace("/onboarding");
        }, 100);
      }
    } catch (error) {
      console.error("Failed to check onboarding state:", error);
      setIsChecking(false);
    }
  };


  if (isChecking || !navigationState?.key) {
    return null;
  }


  return <>{children}</>;
}


function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLocked, isInitialized } = useAuth();
  const { colors } = useTheme();


  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg[0],
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }


  if (isLocked) {
    return <BiometricUnlockScreen />;
  }


  return <>{children}</>;
}


function RootStack() {
  const { colors } = useTheme();


  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      <OnboardingGate>
        <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              animationDuration: 200,
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{
                animation: "none",
              }}
            />
            <Stack.Screen
              name="customize"
              options={{
                animation: "flip",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="onboarding"
              options={{
                animation: "fade",
                animationDuration: 300,
                gestureEnabled: false,
              }}
            />
          </Stack>
        </AuthGate>
      </OnboardingGate>
    </View>
  );
}


export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AnimationProvider>
            <AuthProvider>
              <DbProvider>
                <StatusBar style="auto" />
                <RootStack />
              </DbProvider>
            </AuthProvider>
          </AnimationProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
