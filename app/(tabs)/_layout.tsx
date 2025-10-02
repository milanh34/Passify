import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";

function Glyph({ label, color }: { label: string; color: string }) {
  return <Text style={{ color, fontWeight: "900" }}>{label}</Text>;
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: { backgroundColor: colors.barBg, borderTopColor: colors.cardBorder, height: 56 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        headerStyle: { backgroundColor: colors.headerBg },
        headerTitleStyle: { color: colors.text, fontWeight: "800" },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "View", tabBarIcon: ({ color }) => <Glyph label="◎" color={color} /> }} />
      <Tabs.Screen name="encoder" options={{ title: "Encoder", tabBarIcon: ({ color }) => <Glyph label="◇" color={color} /> }} />
      <Tabs.Screen name="decoder" options={{ title: "Decoder", tabBarIcon: ({ color }) => <Glyph label="⚙︎" color={color} /> }} />
      <Tabs.Screen name="accounts" options={{ href: null, title: "Accounts" }} />
    </Tabs>
  );
}
