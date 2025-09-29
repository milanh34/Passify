import * as React from "react";
import { View, Text, StyleSheet, Platform, useColorScheme } from "react-native";

export default function DecoderScreen() {
  const scheme = useColorScheme();
  const bg = scheme === "dark" ? "#0f172a" : "#f8fafc";
  const text = scheme === "dark" ? "#e5e7eb" : "#0f172a";
  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <Text style={[styles.txt, { color: text }]}>Decoder Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: Platform.select({ ios: 64, android: 48, default: 48 }) },
  txt: { fontSize: 18, fontWeight: "800" },
});
