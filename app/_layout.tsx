import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { AnimationProvider } from "../src/context/AnimationContext";
import { DbProvider } from "../src/context/DbContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { View, LogBox, ActivityIndicator } from "react-native";
import ErrorBoundary from "../src/components/ErrorBoundary";
import BiometricUnlockScreen from "./screens/BiometricUnlockScreen"; 

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error("🔴 Unhandled Promise Rejection:", event.reason);
  event.preventDefault();
};

const handleGlobalError = (error: ErrorEvent) => {
  console.error("🔴 Global Error:", error.error);
  error.preventDefault();
};

// 🔐 AUTH: New component to handle lock/unlock state
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLocked, isInitialized } = useAuth();
  const { colors } = useTheme();

  // Show loading spinner while auth is initializing
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

  // Show unlock screen if locked
  if (isLocked) {
    return <BiometricUnlockScreen />;
  }

  // Show main app if unlocked
  return <>{children}</>;
}

function RootStack() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      {/* 🔐 AUTH: Wrap Stack with AuthGate to control access */}
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
        </Stack>
      </AuthGate>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AnimationProvider>
          {/* 🔐 AUTH: Wrap DbProvider with AuthProvider */}
          <AuthProvider>
            <DbProvider>
              <StatusBar style="auto" />
              <RootStack />
            </DbProvider>
          </AuthProvider>
        </AnimationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
