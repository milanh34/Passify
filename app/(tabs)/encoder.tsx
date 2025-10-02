import { View, Text } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";

export default function Encoder() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
      <Text style={{ color: colors.text, fontWeight: "800" }}>Encoder Screen</Text>
    </View>
  );
}
