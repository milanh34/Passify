import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export default function FAB({
  onPress,
  icon = "add",
  style,
  color = "#6366f1",
}: {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  color?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: color }, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Ionicons name={icon as any} size={26} color="#fff" />
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
});
