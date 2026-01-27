// src/components/PasswordStrengthIndicator.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useAppTheme } from "../themes/hooks/useAppTheme";
import { evaluatePasswordStrength, PasswordStrength } from "../utils/passwordGenerator";

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  showSuggestions = false,
}: PasswordStrengthIndicatorProps) {
  const theme = useAppTheme();
  const [strength, setStrength] = useState<PasswordStrength | null>(null);

  useEffect(() => {
    if (password && password.length > 0) {
      const result = evaluatePasswordStrength(password);
      setStrength(result);
    } else {
      setStrength(null);
    }
  }, [password]);

  if (!strength || !password) {
    return null;
  }

  const filledBars = strength.score + 1;

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.barBackground,
              {
                backgroundColor: theme.colors.surfaceBorder,
                borderRadius: theme.shapes.radiusSm,
              },
            ]}
          >
            <AnimatedBar
              filled={index < filledBars}
              color={strength.color}
              borderRadius={theme.shapes.radiusSm}
              duration={theme.animations.durationNormal}
            />
          </View>
        ))}
      </View>

      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.strengthLabel,
            {
              color: strength.color,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.typography.sizeSm,
            },
          ]}
        >
          {strength.label}
        </Text>
      </View>

      {showSuggestions && strength.suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {strength.suggestions.map((suggestion, index) => (
            <Text
              key={index}
              style={[
                styles.suggestion,
                {
                  color: theme.colors.textMuted,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeXs,
                },
              ]}
            >
              • {suggestion}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function AnimatedBar({
  filled,
  color,
  borderRadius,
  duration,
}: {
  filled: boolean;
  color: string;
  borderRadius: number;
  duration: number;
}) {
  const widthValue = useSharedValue(0);

  useEffect(() => {
    widthValue.value = withTiming(filled ? 100 : 0, { duration });
  }, [filled, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthValue.value}%` as any,
    backgroundColor: filled ? color : "transparent",
    height: "100%",
    borderRadius,
  }));

  return <Animated.View style={animatedStyle} />;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 6,
  },
  barsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  barBackground: {
    flex: 1,
    height: 4,
    overflow: "hidden",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  strengthLabel: {},
  suggestionsContainer: {
    marginTop: 4,
  },
  suggestion: {
    lineHeight: 16,
  },
});
