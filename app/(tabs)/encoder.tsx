import { View, Text } from "react-native";
import { useThemeColors } from "../../src/context/ThemeContext";

export default function Screen() {
  const t = useThemeColors();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}>
      <Text style={{ color: t.text, fontWeight: "800" }}>Placeholder</Text>
    </View>
  );
}
