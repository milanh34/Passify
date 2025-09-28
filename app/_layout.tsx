import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const scheme = useColorScheme();
  const bg = scheme === "dark" ? "#0b1220" : "#f8fafc";
  const tint = scheme === "dark" ? "#e5e7eb" : "#0f172a";

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: bg },
        headerTitleStyle: { color: tint, fontWeight: "800" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
