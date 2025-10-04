import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { Stack } from "expo-router";

export default function Settings() {
  const { mode, font, changeTheme, changeFont, colors, THEMES, FONTS, fontConfig, fontsLoaded } =
    useTheme();

  if (!fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: colors.bg?.[0] ?? "#fff" }]} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg?.[0] ?? "#fff" }]}>
      <Stack.Screen
        options={{
          title: "Appearance",
          headerStyle: { backgroundColor: colors.bg?.[0] ?? "#fff" },
          headerTitleStyle: { color: colors.text, fontFamily: fontConfig.bold },
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>Color Theme</Text>
        <Option
          label="System Default"
          active={mode === "system"}
          onPress={() => changeTheme("system")}
          colors={colors}
          fontFamily={fontConfig.bold}
        />
        {Object.entries(THEMES).map(([key, theme]) => (
          <Option
            key={key}
            label={theme.name}
            active={mode === key}
            onPress={() => changeTheme(key as any)}
            colors={{ ...colors, accent: theme.accent }}
            fontFamily={fontConfig.bold}
          />
        ))}

        <Text
          style={[
            styles.title,
            { color: colors.text, fontFamily: fontConfig.bold, marginTop: 28 },
          ]}
        >
          Font Family
        </Text>
        {Object.entries(FONTS).map(([key, f]) => (
          <Option
            key={key}
            label={f.label}
            active={font === key}
            onPress={() => changeFont(key as any)}
            colors={colors}
            fontFamily={f.bold}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Option({
  label,
  active,
  onPress,
  colors,
  fontFamily,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: any;
  fontFamily: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.option,
        {
          borderColor: active ? colors.accent : "transparent",
          borderWidth: 2,
          backgroundColor: "rgba(128,128,128,0.12)",
        },
      ]}
    >
      <Text style={{ color: active ? colors.accent : colors.subtext, fontFamily }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 18 },
  title: { fontSize: 22, marginBottom: 12 },
  option: { padding: 16, borderRadius: 14, marginBottom: 10 },
});
