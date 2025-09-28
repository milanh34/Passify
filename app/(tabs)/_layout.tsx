import { Tabs } from "expo-router";
import { useColorScheme, Text } from "react-native";

function Icon({ label, color }: { label: string; color: string }) {
  return <Text style={{ color, fontWeight: "900" }}>{label}</Text>;
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const active = scheme === "dark" ? "#22d3ee" : "#4f46e5";
  const inactive = scheme === "dark" ? "#94a3b8" : "#64748b";
  const barBg = scheme === "dark" ? "#0b1220" : "#ffffff";
  const border = scheme === "dark" ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.06)";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: barBg,
          borderTopColor: border,
          height: 56,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: barBg },
        headerTitleStyle: { color: scheme === "dark" ? "#e5e7eb" : "#0f172a", fontWeight: "800" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Icon label="◎" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Icon label="◇" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Icon label="⚙︎" color={color} />,
        }}
      />
    </Tabs>
  );
}
