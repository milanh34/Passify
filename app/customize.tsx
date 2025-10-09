import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

export default function Customize() {
  const { mode, font, changeTheme, changeFont, colors, THEMES, FONTS, fontConfig, fontsLoaded } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render when theme or font changes
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [colors, fontConfig]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!fontsLoaded) {
    return <LinearGradient colors={colors.bg} style={[styles.root, { paddingTop: insets.top }]} />;
  }

  return (
    <LinearGradient colors={colors.bg} style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View key={`header-${renderKey}`} style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.cardBorder }]}>
        <Pressable 
          onPress={() => router.back()} 
          style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          android_ripple={{ color: colors.accent + "22" }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
          Customize
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}>
        
        {/* Color Theme Section */}
        <View style={styles.section} key={`color-section-${renderKey}`}>
          <Pressable 
            onPress={() => toggleSection("theme")} 
            style={[styles.sectionHeader, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
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
          
          {expandedSection === "theme" && (
            <MotiView
              key={`theme-${renderKey}`}
              from={{ opacity: 0, translateY: -20, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 300 }}
            >
              <View style={styles.grid}>
                <ThemeOption 
                  label="System" 
                  active={mode === "system"} 
                  onPress={() => changeTheme("system")} 
                  colors={colors} 
                  fontConfig={fontConfig} 
                />
                {Object.entries(THEMES).map(([key, theme]) => (
                  <ThemeOption 
                    key={key} 
                    label={theme.name} 
                    active={mode === key} 
                    onPress={() => changeTheme(key as any)} 
                    colors={colors}
                    preview={[theme.accent, theme.accent2, theme.subtext]}
                    fontConfig={fontConfig}
                  />
                ))}
              </View>
            </MotiView>
          )}
        </View>

        {/* Font Family Section */}
        <View style={[styles.section, { marginTop: 20 }]} key={`font-section-${renderKey}`}>
          <Pressable 
            onPress={() => toggleSection("font")} 
            style={[styles.sectionHeader, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
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
          
          {expandedSection === "font" && (
            <MotiView
              key={`font-${renderKey}`}
              from={{ opacity: 0, translateY: -20, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 300 }}
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
          {preview.map((c: string, i: number) => (
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
  root: { flex: 1 },
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
    borderRadius: 12,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    flex: 1,
    textAlign: "center",
  },
  section: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
  },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
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
