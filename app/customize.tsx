import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

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
        <Pressable 
          onPress={() => toggleSection("theme")} 
          style={[styles.sectionHeader, { borderColor: colors.cardBorder }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
            Color Theme
          </Text>
          <Ionicons 
            name={expandedSection === "theme" ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={colors.accent} 
          />
        </Pressable>
        
        {expandedSection === "theme" && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -10 }}
            transition={{ type: "timing", duration: 200 }}
          >
            <View style={styles.grid}>
              <ThemeOption label="System" active={mode === "system"} onPress={() => changeTheme("system")} colors={colors} />
              {Object.entries(THEMES).map(([key, theme]) => (
                <ThemeOption 
                  key={key} 
                  label={theme.name} 
                  active={mode === key} 
                  onPress={() => changeTheme(key as any)} 
                  colors={{ ...theme, accent: theme.accent }} 
                  preview={[theme.accent, theme.accent2, theme.subtext]}
                />
              ))}
            </View>
          </MotiView>
        )}

        {/* Font Family Section */}
        <Pressable 
          onPress={() => toggleSection("font")} 
          style={[styles.sectionHeader, { marginTop: 20, borderColor: colors.cardBorder }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
            Font Family
          </Text>
          <Ionicons 
            name={expandedSection === "font" ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={colors.accent} 
          />
        </Pressable>
        
        {expandedSection === "font" && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -10 }}
            transition={{ type: "timing", duration: 200 }}
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
                />
              ))}
            </View>
          </MotiView>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

function ThemeOption({ label, active, onPress, colors, preview = [] as string[] }) {
  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.card, 
        { 
          borderColor: active ? colors.accent : colors.cardBorder,
          backgroundColor: colors.card,
        }
      ]}
    >
      {preview.length > 0 && (
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 8, width: "100%" }}>
          {preview.map((c, i) => (
            <View key={i} style={{ flex: 1, height: 10, backgroundColor: c, borderRadius: 6 }} />
          ))}
        </View>
      )}
      <Text style={{ color: active ? colors.accent : colors.subtext, fontWeight: active ? "bold" : "normal" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function FontOption({ label, active, onPress, colors, sampleFamily }: any) {
  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.card, 
        { 
          borderColor: active ? colors.accent : colors.cardBorder,
          backgroundColor: colors.card,
        }
      ]}
    >
      <Text style={{ 
        fontFamily: sampleFamily, 
        fontSize: 18, 
        marginBottom: 6, 
        color: active ? colors.accent : colors.subtext 
      }}>
        Aa
      </Text>
      <Text style={{ color: active ? colors.accent : colors.subtext, fontWeight: active ? "bold" : "normal" }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18 },
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    marginTop: 8,
    marginBottom: 16,
  },
  card: { 
    width: "48%", 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 2,
    alignItems: "center", 
    marginBottom: 10 
  },
});
