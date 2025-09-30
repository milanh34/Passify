import { Stack } from "expo-router";
import { DbProvider } from "../src/context/DbContext"; // Import provider

export default function RootLayout() {
  return (
    <DbProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </DbProvider>
  );
}
