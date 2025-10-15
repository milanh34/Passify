import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useAnimation } from "../../src/context/AnimationContext";
import ImportTab from "../../src/components/transfer/ImportTab";
import ExportTab from "../../src/components/transfer/ExportTab";

export default function TransferScreen() {
  const { colors, fontConfig } = useTheme();
  const insets = useSafeAreaInsets();
  const [animationKey, setAnimationKey] = useState(0);
  const { TAB_ANIMATION } = useAnimation();
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");

  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey((prev) => prev + 1);
    }, [])
  );

  return (
    <LinearGradient colors={colors.bg} style={styles.root}>
      <MotiView
        key={animationKey}
        from={TAB_ANIMATION.from}
        animate={TAB_ANIMATION.animate}
        transition={{
          type: TAB_ANIMATION.type,
          duration: TAB_ANIMATION.duration,
        }}
        style={[styles.container, { paddingTop: insets.top + 20 }]}
      >
        {/* Tab Switcher */}
        <View
          style={[
            styles.tabContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.accent + "30",
            },
          ]}
        >
          <Pressable
            onPress={() => setActiveTab("import")}
            style={[
              styles.tab,
              activeTab === "import" && {
                backgroundColor: colors.accent,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === "import" ? "#fff" : colors.text,
                  fontFamily: fontConfig.bold,
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
              activeTab === "export" && {
                backgroundColor: colors.accent,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === "export" ? "#fff" : colors.text,
                  fontFamily: fontConfig.bold,
                },
              ]}
            >
              Export
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        {activeTab === "import" ? <ImportTab /> : <ExportTab />}
      </MotiView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
  },
});
