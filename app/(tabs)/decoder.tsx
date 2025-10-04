import { View, Text } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";

export default function Decoder() {
  const { colors, fontConfig } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg?.[0] ?? "#fff" }}>
      <Text style={{ color: colors.text, fontFamily: fontConfig.bold }}>Decoder Screen</Text>
    </View>
  );
}
