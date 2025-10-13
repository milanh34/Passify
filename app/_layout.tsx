import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { AnimationProvider } from "../src/context/AnimationContext"; // ADD THIS
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
    <ThemeProvider>
      <AnimationProvider>
        <DbProvider>
          <StatusBar style="auto" />
          <RootStack />
        </DbProvider>
      </AnimationProvider>
    </ThemeProvider>
  );
}
