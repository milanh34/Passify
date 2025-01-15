// app/_layout.tsx

import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { AnimationProvider } from "../src/context/AnimationContext";
import { DbProvider, useDb } from "../src/context/DbContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { View, LogBox, ActivityIndicator, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "../src/components/ErrorBoundary";
import DatabaseErrorScreen from "../src/components/DatabaseErrorScreen";
import BiometricUnlockScreen from "./screens/BiometricUnlockScreen";
import { useState, useEffect } from "react";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { isOnboardingComplete } from "../src/utils/onboardingState";
import { initializeScreenSecurity } from "../src/utils/screenSecurity";
import { errorHandler, safeAsync } from "../src/utils/errorHandler";

LogBox.ignoreLogs(["Non-serializable values were found in the navigation state"]);

errorHandler.initialize();

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
    const completed = await safeAsync(() => isOnboardingComplete(), {
      context: "checkOnboarding",
      fallback: false,
    });

    setIsChecking(false);

    if (!completed && segments[0] !== "onboarding") {
      setTimeout(() => {
        router.replace("/onboarding");
      }, 100);
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

  useEffect(() => {
    safeAsync(() => initializeScreenSecurity(), {
      context: "initializeScreenSecurity",
    });
  }, []);

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

function DatabaseGate({ children }: { children: React.ReactNode }) {
  const { isDbLoading, dbError, refreshDatabase } = useDb();
  const { colors, fontConfig } = useTheme();

  if (isDbLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg[0],
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text
          style={{
            color: colors.subtext,
            fontFamily: fontConfig.regular,
            fontSize: 14,
          }}
        >
          Loading encrypted database...
        </Text>
      </View>
    );
  }

  if (dbError) {
    return <DatabaseErrorScreen error={dbError} onRetry={refreshDatabase} />;
  }

  return <>{children}</>;
}

function RootStack() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      <OnboardingGate>
        <AuthGate>
          <DatabaseGate>
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
                name="settings"
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
              <Stack.Screen
                name="legal"
                options={{
                  animation: "slide_from_right",
                  animationDuration: 200,
                }}
              />
              <Stack.Screen
                name="accounts"
                options={{
                  animation: "slide_from_right",
                  animationDuration: 200,
                }}
              />
              <Stack.Screen
                name="connected-accounts"
                options={{
                  animation: "slide_from_right",
                  animationDuration: 200,
                }}
              />
            </Stack>
          </DatabaseGate>
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
