import { Stack } from "expo-router";
import { ThemeProvider } from "../src/context/ThemeContext";
import { DbProvider } from "../src/context/DbContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DbProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </DbProvider>
    </ThemeProvider>
  );
}
