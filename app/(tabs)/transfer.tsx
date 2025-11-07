import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext'; // 🔐 AUTH: Import useAuth
import { useInactivityTracker } from '../../src/utils/inactivityTracker'; // 🔐 AUTH: Import inactivity tracker
import { useFocusEffect } from 'expo-router';
import React from 'react';

export default function TransferLayout() {
  const { colors, fontConfig } = useTheme();

  // 🔐 AUTH: Get auth state and initialize inactivity tracker
  const { isAuthEnabled } = useAuth();
  const { updateActivity } = useInactivityTracker(isAuthEnabled);

  // 🔐 AUTH: Update activity when transfer tab is focused
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthEnabled) {
        updateActivity();
      }
    }, [isAuthEnabled, updateActivity])
  );

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.bg[0],
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: fontConfig.regular,
          fontSize: 12,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.bg[0],
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        },
        headerTitleStyle: {
          color: colors.text,
          fontFamily: fontConfig.bold,
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="ImportTab"
        options={{
          title: 'Import',
          headerTitle: 'Import Data',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? 'cloud-download' : 'cloud-download-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={[
                styles.tabLabel,
                {
                  color,
                  fontFamily: focused ? fontConfig.bold : fontConfig.regular,
                },
              ]}
            >
              Import
            </Text>
          ),
        }}
        listeners={{
          // 🔐 AUTH: Update activity when tab is pressed
          tabPress: () => {
            if (isAuthEnabled) {
              updateActivity();
            }
          },
        }}
      />

      <Tabs.Screen
        name="ExportTab"
        options={{
          title: 'Export',
          headerTitle: 'Export Data',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? 'cloud-upload' : 'cloud-upload-outline'}
                size={size}
                color={color}
              />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={[
                styles.tabLabel,
                {
                  color,
                  fontFamily: focused ? fontConfig.bold : fontConfig.regular,
                },
              ]}
            >
              Export
            </Text>
          ),
        }}
        listeners={{
          // 🔐 AUTH: Update activity when tab is pressed
          tabPress: () => {
            if (isAuthEnabled) {
              updateActivity();
            }
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
