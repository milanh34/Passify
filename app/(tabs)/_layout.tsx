import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";

export default function TabsLayout() {
  const { colors, fontConfig } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.bg[1] || colors.bg[0],
          borderTopColor: colors.cardBorder,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { 
          fontFamily: fontConfig.bold, 
          fontSize: 11,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
        animation: "none", // Disabled - using custom animations in each screen
        sceneStyle: {
          backgroundColor: colors.bg[0],
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Manage",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          title: "Transfer",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "swap-horizontal" : "swap-horizontal-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="encoder"
        options={{
          title: "Encoder",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "lock-closed" : "lock-closed-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="decoder"
        options={{
          title: "Decoder",
          tabBarIcon: ({ color }) => <Ionicons name="key-outline" size={22} color={color} />
        }}
      />
      <Tabs.Screen name="accounts" options={{ href: null, title: "Accounts" }} />
    </Tabs>
  );
}
