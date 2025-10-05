import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";

export default function Decoder() {
  const { colors, fontConfig } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg[0] }]}>
      <Text style={{ color: colors.text, fontFamily: fontConfig.bold }}>Decoder Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
});
