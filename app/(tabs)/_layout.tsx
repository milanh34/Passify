// app/(tabs)/_layout.tsx

import { Tabs, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

export default function TabsLayout() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const isOnAccounts = segments[segments.length - 1] === "accounts";
  const isOnConnectedAccounts = segments[segments.length - 1] === "connected-accounts";

  const tabBarBottomPadding = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceBorder,
          borderTopWidth: theme.shapes.borderThin,
          height: theme.components.tabBar.height + tabBarBottomPadding,
          paddingBottom: tabBarBottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontBold,
          fontSize: theme.components.tabBar.labelSize,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
        animation: "none",
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Manage",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused || isOnAccounts || isOnConnectedAccounts ? "grid" : "grid-outline"}
              size={theme.components.tabBar.iconSize}
              color={focused || isOnAccounts || isOnConnectedAccounts ? theme.colors.accent : color}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontFamily: theme.typography.fontBold,
                fontSize: theme.components.tabBar.labelSize,
                color:
                  focused || isOnAccounts || isOnConnectedAccounts
                    ? theme.colors.accent
                    : theme.colors.textMuted,
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
              size={theme.components.tabBar.iconSize}
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
              size={theme.components.tabBar.iconSize}
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
              size={theme.components.tabBar.iconSize}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
