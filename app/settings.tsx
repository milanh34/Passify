import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function Settings() {
  const { mode, font, changeTheme, changeFont, colors, THEMES, FONTS, fontConfig, fontsLoaded } = useTheme();

  if (!fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: colors.bg[0] }]} />;
  }

  return (
    <LinearGradient colors={colors.bg} style={styles.root}>
      <Stack.Screen options={{ title: "Appearance", headerStyle: { backgroundColor: colors.bg[0] }, headerTitleStyle: { color: colors.text, fontFamily: fontConfig.bold } }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>Color Theme</Text>
        <View style={styles.grid}>
          <ThemeOption label="System" active={mode === "system"} onPress={() => changeTheme("system")} colors={colors} fontConfig={fontConfig} />
          {Object.entries(THEMES).map(([key, theme]) => (
            <ThemeOption key={key} label={theme.name} active={mode === key} onPress={() => changeTheme(key as any)} colors={{ ...theme, accent: theme.accent }} fontConfig={fontConfig} />
          ))}
        </View>
        
        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold, marginTop: 28 }]}>Font Family</Text>
        <View style={styles.grid}>
          {Object.entries(FONTS).map(([key, f]) => (
            <FontOption key={key} label={f.label} active={font === key} onPress={() => changeFont(key as any)} colors={colors} fontConfig={f} />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function ThemeOption({ label, active, onPress, colors, fontConfig }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.gridItem, { borderColor: active ? colors.accent : 'transparent' }]}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
        <View style={{ flex: 1, height: 10, backgroundColor: colors.accent, borderRadius: 5 }} />
        <View style={{ flex: 1, height: 10, backgroundColor: colors.accent2, borderRadius: 5 }} />
        <View style={{ flex: 1, height: 10, backgroundColor: colors.subtext, borderRadius: 5 }} />
      </View>
      <Text style={{ color: active ? colors.accent : colors.subtext, fontFamily: fontConfig.bold }}>{label}</Text>
    </TouchableOpacity>
  );
}

function FontOption({ label, active, onPress, colors, fontConfig }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.gridItem, { borderColor: active ? colors.accent : 'transparent' }]}>
      <Text style={{ fontFamily: fontConfig.bold, color: active ? colors.accent : colors.subtext, fontSize: 18 }}>Aa</Text>
      <Text style={{ color: active ? colors.accent : colors.subtext, fontFamily: fontConfig.regular }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 18 },
  title: { fontSize: 24, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 2, backgroundColor: "rgba(128,128,128,0.1)", alignItems: 'center' },
});
