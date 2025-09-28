import { View, Text, StyleSheet, Pressable, Platform, useColorScheme, StyleSheet as RN } from "react-native";

export default function Home() {
  const scheme = useColorScheme();
  const text = scheme === "dark" ? "#e5e7eb" : "#0f172a";
  const sub = scheme === "dark" ? "rgba(229,231,235,0.75)" : "rgba(15,23,42,0.65)";
  const bgTop = scheme === "dark" ? "#0f172a" : "#f8fafc";
  const bgBottom = scheme === "dark" ? "#0b1220" : "#eef2ff";
  const btn = scheme === "dark" ? "#14b8a6" : "#6366f1";

  return (
    <View style={styles.root}>
      <View style={[RN.absoluteFill, { backgroundColor: bgTop }]} />
      <View style={[styles.bgBottom, { backgroundColor: bgBottom }]} />

      <View style={styles.header}>
        <View style={[styles.pill, { backgroundColor: scheme === "dark" ? "rgba(34,211,238,0.12)" : "rgba(79,70,229,0.12)" }]}>
          <Text style={{ color: scheme === "dark" ? "#22d3ee" : "#4f46e5", fontWeight: "800", fontSize: 12 }}>Welcome</Text>
        </View>
        <Text style={{ color: scheme === "dark" ? "#22d3ee" : "#4f46e5", fontWeight: "900", fontSize: 22 }}>◎</Text>
      </View>

      <View style={[styles.card, { backgroundColor: scheme === "dark" ? "#0b1220" : "#ffffff", borderColor: scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
        <Text style={[styles.title, { color: text }]}>Home</Text>
        <Text style={[styles.subtitle, { color: sub }]}>Start building your app. Edit app/(tabs)/index.tsx.</Text>

        <Pressable
          onPress={() => {}}
          android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: btn,
              opacity: pressed ? 0.9 : 1,
              transform: [{ translateY: pressed ? 1 : 0 }],
            },
          ]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: Platform.select({ ios: 64, android: 48, default: 48 }), paddingHorizontal: 20, gap: 20 },
  bgBottom: {
    position: "absolute",
    left: 0, right: 0, bottom: 0, height: "55%",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
  },
  header: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  card: {
    borderRadius: 20, padding: 20, gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6,
  },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 20 },
  button: { marginTop: 6, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, alignSelf: "flex-start", overflow: "hidden" },
  buttonText: { color: "#fff", fontWeight: "800", letterSpacing: 0.4 },
});
