import { StyleSheet } from "react-native";

export const COLORS = {
  dark: {
    background: ["#10002b", "#240046"],
    card: "rgba(255, 255, 255, 0.07)",
    text: "#e0aaff",
    subtext: "#c77dff",
    accent: "#9d4edd",
    primary: "#5a189a",
    danger: "#e5383b",
    shine: "rgba(255, 255, 255, 0.1)",
  },
  light: {
    background: ["#f2e9f9", "#e9d8f3"],
    card: "rgba(255, 255, 255, 0.6)",
    text: "#240046",
    subtext: "#3c096c",
    accent: "#9d4edd",
    primary: "#7b2cbf",
    danger: "#c9184a",
    shine: "rgba(255, 255, 255, 0.5)",
  },
};

export const globalStyles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: "bold", marginVertical: 20 },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  fabPrimary: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  fabSecondary: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
