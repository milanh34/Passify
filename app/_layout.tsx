import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { AnimationProvider } from "../src/context/AnimationContext"; // ADD THIS
import { DbProvider } from "../src/context/DbContext";
import { StatusBar } from "expo-status-bar";
import { View, LogBox } from "react-native";
import ErrorBoundary from "../src/components/ErrorBoundary";

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

function RootStack() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
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
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AnimationProvider>
          <DbProvider>
            <StatusBar style="auto" />
            <RootStack />
          </DbProvider>
        </AnimationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
