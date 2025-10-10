import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { DbProvider } from "../src/context/DbContext";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

function RootStack() {
  const { colors } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          // ONLY USE ONE OF THESE (they all work):
          animation: "default", // Native platform animation
          // animation: "fade", // Fade in/out
          // animation: "fade_from_bottom", // Slide up from bottom with fade
          // animation: "slide_from_right", // Slide from right (iOS style)
          // animation: "slide_from_left", // Slide from left
          // animation: "slide_from_bottom", // Slide up from bottom
          // animation: "none", // Instant (no animation)
          animationDuration: 250,
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
            animation: "fade", // Change this to any working option above
            animationDuration: 250,
          }} 
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DbProvider>
        <StatusBar style="auto" />
        <RootStack />
      </DbProvider>
    </ThemeProvider>
  );
}
