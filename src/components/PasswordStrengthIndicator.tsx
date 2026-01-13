// src/components/PasswordStrengthIndicator.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { useTheme } from "../context/ThemeContext";
import { evaluatePasswordStrength, PasswordStrength } from "../utils/passwordGenerator";

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  showSuggestions = false,
}: PasswordStrengthIndicatorProps) {
  const { colors, fontConfig } = useTheme();
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

  const getBarWidth = (index: number): string => {
    const filledBars = strength.score + 1; // score is 0-4, so add 1 for display
    return index < filledBars ? "100%" : "0%";
  };

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.barBackground,
              { backgroundColor: colors.cardBorder },
            ]}
          >
            <MotiView
              animate={{
                width: getBarWidth(index),
                backgroundColor: index <= strength.score ? strength.color : colors.cardBorder,
              }}
              transition={{ type: "timing", duration: 200 }}
              style={styles.barFill}
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
              fontFamily: fontConfig.bold,
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
                  color: colors.muted,
                  fontFamily: fontConfig.regular,
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
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  strengthLabel: {
    fontSize: 12,
  },
  suggestionsContainer: {
    marginTop: 4,
  },
  suggestion: {
    fontSize: 11,
    lineHeight: 16,
  },
});