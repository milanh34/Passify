import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_ANIMATION } from "../../src/config/animations"; // IMPORT ANIMATION

export default function Encoder() {
  const { colors, fontConfig } = useTheme();
  const insets = useSafeAreaInsets();
  const [animationKey, setAnimationKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey(prev => prev + 1);
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      <LinearGradient colors={colors.bg} style={{ flex: 1 }}>
        <MotiView
          key={animationKey}
          from={TAB_ANIMATION.from}
          animate={TAB_ANIMATION.animate}
          transition={{
            type: TAB_ANIMATION.type,
            duration: TAB_ANIMATION.duration,
          }}
          style={[styles.root, { paddingTop: insets.top + 20 }]}
        >
          <Text style={{ color: colors.text, fontFamily: fontConfig.bold, fontSize: 24 }}>
            Encoder Screen
          </Text>
        </MotiView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
});
