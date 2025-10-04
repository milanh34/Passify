import { Stack } from "expo-router";
import { ThemeProvider } from "../src/context/ThemeContext";
import { DbProvider } from "../src/context/DbContext";
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DbProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </DbProvider>
    </ThemeProvider>
  );
}
