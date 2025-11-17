// app/(tabs)/transfer.tsx

import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, AnimatePresence } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
            <Ionicons 
              name={activeTab === "export" ? "cloud-upload-outline" : "cloud-upload"} 
              size={16} 
              color={activeTab === "import" ? "#fff" : colors.text} 
            />
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
            <Ionicons 
              name={activeTab === "import" ? "cloud-download-outline" : "cloud-download"} 
              size={16} 
              color={activeTab === "export" ? "#fff" : colors.text} 
            />
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


        <AnimatePresence exitBeforeEnter>
          {activeTab === "import" ? (
            <MotiView
              key="import"
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: 20 }}
              transition={{ type: "timing", duration: 200 }}
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
              transition={{ type: "timing", duration: 200 }}
              style={{ flex: 1 }}
            >
              <ExportTab />
            </MotiView>
          )}
        </AnimatePresence>
      </MotiView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 14,
  },
});
