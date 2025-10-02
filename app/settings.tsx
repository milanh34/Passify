import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { Stack } from "expo-router";

export default function Settings() {
  const { mode, changeTheme, colors, THEMES } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ title: "Appearance", headerStyle: { backgroundColor: colors.headerBg }, headerTitleStyle: { color: colors.text } }} />
      <ScrollView>
        <Text style={[styles.title, { color: colors.text }]}>Select a Theme</Text>
        <ThemeOption label="System Default" active={mode === "system"} onPress={() => changeTheme("system")} borderColor={colors.active} />
        {Object.entries(THEMES).map(([key, theme]) => (
          <ThemeOption key={key} label={theme.name} active={mode === key} onPress={() => changeTheme(key as any)} borderColor={theme.active} />
        ))}
      </ScrollView>
    </View>
  );
}

function ThemeOption({ label, active, onPress, borderColor }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.option, { borderColor: active ? borderColor : "transparent", borderWidth: 2 }]}>
      <Text style={{ fontWeight: "800", color: active ? borderColor : "#888" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 18 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  option: { padding: 16, borderRadius: 14, marginBottom: 10, backgroundColor: "rgba(128,128,128,0.1)" },
});
