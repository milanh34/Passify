import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme, useThemeColors } from "../src/context/ThemeContext";
import { Stack } from "expo-router";

export default function Settings() {
  const { theme, setTheme, useSystem } = useTheme();
  const t = useThemeColors();

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <Stack.Screen options={{ title: "Theme", headerStyle: { backgroundColor: t.headerBg }, headerTitleStyle: { color: t.headerText } }} />
      <Text style={[styles.title, { color: t.text }]}>Appearance</Text>
      <View style={styles.row}>
        <Option label="Light" active={theme === "light"} onPress={() => setTheme("light")} />
        <Option label="Dark" active={theme === "dark"} onPress={() => setTheme("dark")} />
        <Option label="System" active={theme === "system"} onPress={useSystem} />
      </View>
    </View>
  );
}

function Option({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.opt, { borderColor: active ? "#22d3ee" : "rgba(127,127,127,0.3)" }]}>
      <Text style={{ fontWeight: "800" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 18 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  opt: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 2 },
});
