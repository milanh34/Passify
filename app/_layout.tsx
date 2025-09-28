import React, { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Platform,
} from "react-native";

export default function Index() {
  const scheme = useColorScheme();

  const theme = useMemo(
    () => ({
      bgTop: scheme === "dark" ? "#0f172a" : "#f8fafc",
      bgBottom: scheme === "dark" ? "#111827" : "#eef2ff",
      card: scheme === "dark" ? "#111827" : "#ffffff",
      border: scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
      text: scheme === "dark" ? "#e5e7eb" : "#0f172a",
      subtext: scheme === "dark" ? "rgba(229,231,235,0.75)" : "rgba(15,23,42,0.65)",
      accent: scheme === "dark" ? "#22d3ee" : "#4f46e5",
      accentDim: scheme === "dark" ? "rgba(34,211,238,0.15)" : "rgba(79,70,229,0.12)",
      buttonFrom: scheme === "dark" ? "#14b8a6" : "#6366f1",
      buttonTo: scheme === "dark" ? "#06b6d4" : "#7c3aed",
    }),
    [scheme]
  );

  return (
    <View style={[styles.root]}>
      {/* Soft split background without gradient lib */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bgTop }]} />
      <View
        style={[
          styles.bgBottom,
          { backgroundColor: theme.bgBottom },
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.pill, { backgroundColor: theme.accentDim }]}>
          <Text style={[styles.pillText, { color: theme.accent }]}>Expo Starter</Text>
        </View>
        <Text style={[styles.brand, { color: theme.accent }]}>◎</Text>
      </View>

      {/* Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: scheme === "dark" ? "#000" : "#6366f1",
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Welcome 👋
        </Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Edit app/index.tsx to customize this screen and start building your app UI.
        </Text>

        <Pressable
          onPress={() => {}}
          android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.buttonFrom,
              opacity: pressed ? 0.9 : 1,
              transform: [{ translateY: pressed ? 1 : 0 }],
            },
          ]}
        >
          <View
            style={[
              styles.buttonOverlay,
              { backgroundColor: theme.buttonTo },
            ]}
          />
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>

        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: theme.subtext }]}>Android · iOS · Web</Text>
          <Text style={[styles.dot, { color: theme.subtext }]}>•</Text>
          <Text style={[styles.meta, { color: theme.subtext }]}>Light/Dark auto</Text>
        </View>
      </View>

      {/* Footer hint */}
      <Text style={[styles.hint, { color: theme.subtext }]}>
        Tip: shake device or press Ctrl+M to open dev menu
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: Platform.select({ ios: 64, android: 48, default: 48 }),
    paddingHorizontal: 20,
    gap: 20,
  },
  bgBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  brand: {
    fontSize: 24,
    fontWeight: "900",
  },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  buttonOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
    borderRadius: 14,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meta: {
    fontSize: 12,
  },
  dot: {
    fontSize: 12,
    includeFontPadding: false,
  },
  hint: {
    textAlign: "center",
    fontSize: 12,
  },
});
