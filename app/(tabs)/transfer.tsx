// app/(tabs)/transfer.tsx

import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";
import ImportTab from "../../src/components/transfer/ImportTab";
import ExportTab from "../../src/components/transfer/ExportTab";

export default function TransferScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [animationKey, setAnimationKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");

  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey((prev) => prev + 1);
    }, [])
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <MotiView
        key={animationKey}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: theme.animations.durationNormal,
        }}
        style={[
          styles.container,
          {
            paddingTop: insets.top + theme.spacing.xl,
            paddingHorizontal: theme.spacing.xl,
          },
        ]}
      >
        <View
          style={[
            styles.tabContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderWidth: theme.shapes.borderThin,
              borderRadius: theme.shapes.radiusMd,
              padding: 3,
              marginBottom: theme.spacing.lg,
            },
          ]}
        >
          <Pressable
            onPress={() => setActiveTab("import")}
            style={[
              styles.tab,
              {
                borderRadius: theme.shapes.radiusSm,
                backgroundColor: activeTab === "import" ? theme.colors.accent : "transparent",
              },
            ]}
          >
            <Ionicons
              name={activeTab === "import" ? "cloud-upload" : "cloud-upload-outline"}
              size={16}
              color={activeTab === "import" ? theme.colors.textInverse : theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "import" ? theme.colors.textInverse : theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeMd,
                },
              ]}
            >
              Import
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("export")}
            style={[
              styles.tab,
              {
                borderRadius: theme.shapes.radiusSm,
                backgroundColor: activeTab === "export" ? theme.colors.accent : "transparent",
              },
            ]}
          >
            <Ionicons
              name={activeTab === "export" ? "cloud-download" : "cloud-download-outline"}
              size={16}
              color={activeTab === "export" ? theme.colors.textInverse : theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "export" ? theme.colors.textInverse : theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeMd,
                },
              ]}
            >
              Export
            </Text>
          </Pressable>
        </View>

        <AnimatePresence exitBeforeEnter>
          {activeTab === "import" ? (
            <MotiView
              key="import"
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: 20 }}
              transition={{ type: "timing", duration: theme.animations.durationFast }}
              style={{ flex: 1 }}
            >
              <ImportTab />
            </MotiView>
          ) : (
            <MotiView
              key="export"
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -20 }}
              transition={{ type: "timing", duration: theme.animations.durationFast }}
              style={{ flex: 1 }}
            >
              <ExportTab />
            </MotiView>
          )}
        </AnimatePresence>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  tabContainer: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tabText: {},
});
