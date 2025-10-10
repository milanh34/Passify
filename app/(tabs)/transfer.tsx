import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TransferScreen() {
  const { colors, fontConfig } = useTheme();
  const insets = useSafeAreaInsets();

  // ========================================
  // 🎨 CHANGE ANIMATION HERE:
  // ========================================
  const CUSTOM_ANIMATION = {
    from: { opacity: 0, translateX: -100 }, // Slide from left
    animate: { opacity: 1, translateX: 0 },
    duration: 250,
    type: "timing" as const,
  };
  // ========================================

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      <LinearGradient colors={colors.bg} style={{ flex: 1 }}>
        <MotiView
          from={CUSTOM_ANIMATION.from}
          animate={CUSTOM_ANIMATION.animate}
          transition={{
            type: CUSTOM_ANIMATION.type,
            duration: CUSTOM_ANIMATION.duration,
          }}
          style={[styles.root, { paddingTop: insets.top + 20 }]}
        >
          <Text style={{ color: colors.text, fontFamily: fontConfig.bold, fontSize: 24 }}>
            Transfer Screen
          </Text>
          <Text style={{ color: colors.subtext, fontFamily: fontConfig.regular, marginTop: 8 }}>
            Coming soon
          </Text>
        </MotiView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
});
