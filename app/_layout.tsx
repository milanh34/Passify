import { Stack } from "expo-router";
import { ThemeProvider } from "../src/context/ThemeContext";
import { DbProvider } from "../src/context/DbContext";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DbProvider>
        <StatusBar style="auto" />
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: Platform.OS === "ios" ? "default" : "slide_from_right",
            presentation: "card",
          }} 
        >
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              animation: "none" 
            }} 
          />
          <Stack.Screen 
            name="customize" 
            options={{ 
              animation: "slide_from_right",
              animationDuration: 250,
            }} 
          />
        </Stack>
      </DbProvider>
    </ThemeProvider>
  );
}
