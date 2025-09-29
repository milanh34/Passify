import { Tabs } from "expo-router";
import { useColorScheme, Text } from "react-native";

function Glyph({ label, color }: { label: string; color: string }) {
  return <Text style={{ color, fontWeight: "900" }}>{label}</Text>;
}

export default function TabsLayout() {
  const scheme = useColorScheme();
  const active = scheme === "dark" ? "#22d3ee" : "#4f46e5";
  const inactive = scheme === "dark" ? "#94a3b8" : "#64748b";
  const barBg = scheme === "dark" ? "#0b1220" : "#ffffff";
  const border = scheme === "dark" ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.06)";
  const headerTint = scheme === "dark" ? "#e5e7eb" : "#0f172a";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: { backgroundColor: barBg, borderTopColor: border, height: 56 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: barBg },
        headerTitleStyle: { color: headerTint, fontWeight: "800" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "View", tabBarIcon: ({ color }) => <Glyph label="◎" color={color} /> }}
      />
      <Tabs.Screen
        name="encoder"
        options={{ title: "Encoder", tabBarIcon: ({ color }) => <Glyph label="◇" color={color} /> }}
      />
      <Tabs.Screen
        name="decoder"
        options={{ title: "Decoder", tabBarIcon: ({ color }) => <Glyph label="⚙︎" color={color} /> }}
      />
      {/* Hide accounts from tab bar; it's pushed from the View screen */}
      <Tabs.Screen name="accounts" options={{ href: null }} />
    </Tabs>
  );
}
