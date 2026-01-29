// app/settings.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import { useAppTheme } from "../src/themes/hooks/useAppTheme";
import {
  AppearanceSection,
  SecuritySection,
  DisplaySection,
  TutorialSection,
  LegalSection,
} from "../src/components/settings";
import Toast from "../src/components/Toast";

export default function Settings() {
  const { fontsLoaded } = useTheme();
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("success");

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: theme.colors.background }]} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            borderBottomColor: theme.colors.surfaceBorder,
            height: insets.top + theme.components.header.height,
          },
        ]}
      >
        <Pressable
          onPress={router.back}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderRadius: theme.components.header.backButtonRadius,
            },
          ]}
          android_ripple={{ color: theme.colors.accentMuted }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.components.header.titleSize,
            },
          ]}
        >
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
      >
        <AppearanceSection />
        <SecuritySection showToast={showToastMessage} />
        <DisplaySection showToast={showToastMessage} />
        <TutorialSection />
        <LegalSection />
      </ScrollView>
      <Toast visible={showToast} message={toastMessage} type={toastType} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    flex: 1,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    opacity: 0.75,
  },
});
