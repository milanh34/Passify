import { Tabs } from "expo-router";
import { useThemeColors } from "../../src/context/ThemeContext";
import { Text, View } from "react-native";

function Glyph({ label, color }: { label: string; color: string }) {
  return <Text style={{ color, fontWeight: "900" }}>{label}</Text>;
}

export default function TabsLayout() {
  const t = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.active,
        tabBarInactiveTintColor: t.inactive,
        tabBarStyle: { backgroundColor: t.barBg, borderTopColor: t.border, height: 56 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        headerStyle: { backgroundColor: t.headerBg },
        headerTitleStyle: { color: t.headerText, fontWeight: "800" },
        headerShadowVisible: false,
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
      <Tabs.Screen
        name="accounts"
        options={{ href: null, title: "Accounts" }}
      />
    </Tabs>
  );
}
