import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";

export default function TransferScreen() {
  const { colors, fontConfig } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg[0] }]}>
      <Text style={{ color: colors.text, fontFamily: fontConfig.bold, fontSize: 18 }}>
        Transfer Screen
      </Text>
      <Text style={{ color: colors.subtext, fontFamily: fontConfig.regular, marginTop: 8 }}>
        Coming soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
});
