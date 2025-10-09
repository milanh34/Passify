import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";

export default function Customize() {
  const { mode, font, changeTheme, changeFont, colors, THEMES, FONTS, fontConfig, fontsLoaded } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: colors.bg[0], paddingTop: insets.top + 20 }]} />;
  }

  return (
    <LinearGradient colors={colors.bg} style={[styles.root, { paddingTop: insets.top + 20 }]}>
      <Stack.Screen
        options={{
          title: "Customize",
          headerStyle: { backgroundColor: colors.bg[0] },
          headerTitleStyle: { color: colors.text, fontFamily: fontConfig.bold },
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}>
        
        {/* Color Theme Section */}
        <View style={[styles.section, { borderColor: colors.cardBorder }]}>
          <Pressable 
            onPress={() => toggleSection("theme")} 
            style={[styles.sectionHeader, { backgroundColor: colors.card }]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <View style={styles.headerLeft}>
              <Ionicons name="color-palette" size={22} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
                Color Theme
              </Text>
            </View>
            <Ionicons 
              name={expandedSection === "theme" ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={colors.accent} 
            />
          </Pressable>
          
          <AnimatePresence exitBeforeEnter>
            {expandedSection === "theme" && (
              <MotiView
                key="theme-content"
                from={{ opacity: 0, translateY: -20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
                transition={{ type: "timing", duration: 300 }}
                exitTransition={{ type: "timing", duration: 250 }}
              >
                <View style={styles.grid}>
                  <ThemeOption label="System" active={mode === "system"} onPress={() => changeTheme("system")} colors={colors} fontConfig={fontConfig} />
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <ThemeOption 
                      key={key} 
                      label={theme.name} 
                      active={mode === key} 
                      onPress={() => changeTheme(key as any)} 
                      colors={{ ...theme, accent: theme.accent }} 
                      preview={[theme.accent, theme.accent2, theme.subtext]}
                      fontConfig={fontConfig}
                    />
                  ))}
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        {/* Font Family Section */}
        <View style={[styles.section, { marginTop: 20, borderColor: colors.cardBorder }]}>
          <Pressable 
            onPress={() => toggleSection("font")} 
            style={[styles.sectionHeader, { backgroundColor: colors.card }]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <View style={styles.headerLeft}>
              <Ionicons name="text" size={22} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
                Font Family
              </Text>
            </View>
            <Ionicons 
              name={expandedSection === "font" ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={colors.accent} 
            />
          </Pressable>
          
          <AnimatePresence exitBeforeEnter>
            {expandedSection === "font" && (
              <MotiView
                key="font-content"
                from={{ opacity: 0, translateY: -20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
                transition={{ type: "timing", duration: 300 }}
                exitTransition={{ type: "timing", duration: 250 }}
              >
                <View style={styles.grid}>
                  {Object.entries(FONTS).map(([key, f]) => (
                    <FontOption 
                      key={key} 
                      label={f.label} 
                      active={font === key} 
                      onPress={() => changeFont(key as any)} 
                      colors={colors} 
                      sampleFamily={f.bold} 
                      fontConfig={fontConfig}
                    />
                  ))}
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

function ThemeOption({ label, active, onPress, colors, preview = [] as string[], fontConfig }: any) {
  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.card, 
        { 
          backgroundColor: active ? colors.accent + "15" : colors.card,
          borderWidth: active ? 2 : 0,
          borderColor: active ? colors.accent : "transparent",
        }
      ]}
      android_ripple={{ color: colors.accent + "33" }}
    >
      {preview.length > 0 && (
        <View style={{ flexDirection: "row", gap: 5, marginBottom: 10, width: "100%" }}>
          {preview.map((c, i) => (
            <View key={i} style={{ flex: 1, height: 12, backgroundColor: c, borderRadius: 6 }} />
          ))}
        </View>
      )}
      <Text 
        style={{ 
          color: active ? colors.accent : colors.text, 
          fontFamily: fontConfig.bold,
          fontSize: 13,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FontOption({ label, active, onPress, colors, sampleFamily, fontConfig }: any) {
  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.card, 
        { 
          backgroundColor: active ? colors.accent + "15" : colors.card,
          borderWidth: active ? 2 : 0,
          borderColor: active ? colors.accent : "transparent",
        }
      ]}
      android_ripple={{ color: colors.accent + "33" }}
    >
      <Text style={{ 
        fontFamily: sampleFamily, 
        fontSize: 28, 
        marginBottom: 8, 
        color: active ? colors.accent : colors.text 
      }}>
        Aa
      </Text>
      <Text 
        style={{ 
          color: active ? colors.accent : colors.text, 
          fontSize: 11,
          textAlign: "center",
          fontFamily: fontConfig.regular,
        }}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  section: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18 },
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    marginTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  card: { 
    width: "48%", 
    padding: 14, 
    borderRadius: 14, 
    alignItems: "center", 
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 90,
  },
});
