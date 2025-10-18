import { Tabs, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";

export default function TabsLayout() {
  const { colors, fontConfig } = useTheme();
  const segments = useSegments();

  // Check if we're on the accounts screen
  const isOnAccounts = segments[segments.length - 1] === "accounts";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.bg[1] || colors.bg[0],
          borderTopColor: colors.cardBorder,
          height: 75,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { 
          fontFamily: fontConfig.bold, 
          fontSize: 11,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
        animation: "none",
        sceneStyle: {
          backgroundColor: colors.bg[0],
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Manage",
          // Custom icon - highlighted when focused OR on accounts
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={(focused || isOnAccounts) ? "grid" : "grid-outline"} 
              size={22} 
              color={(focused || isOnAccounts) ? colors.accent : color} 
            />
          ),
          // Custom label - highlighted when focused OR on accounts
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontFamily: fontConfig.bold,
                fontSize: 11,
                color: (focused || isOnAccounts) ? colors.accent : colors.subtext,
              }}
            >
              Manage
            </Text>
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
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "key" : "key-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen name="accounts" options={{ href: null, title: "Accounts" }} />
    </Tabs>
  );
}
