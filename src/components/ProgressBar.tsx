// src/components/ProgressBar.tsx

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useAppTheme } from "../themes/hooks/useAppTheme";
import { ProgressPhase } from "../types/progress";

interface ProgressBarProps {
  percent: number;
  phase: ProgressPhase;
  processedBytes?: number;
  totalBytes?: number;
  visible: boolean;
}

const PHASE_LABELS: Record<ProgressPhase, string> = {
  stringify: "Serializing data",
  encrypt: "Encrypting",
  pack: "Packing into pixels",
  encodePNG: "Encoding PNG image",
  writeFile: "Writing file",
  readFile: "Reading file",
  decodePNG: "Decoding PNG image",
  unpack: "Extracting pixel data",
  decrypt: "Decrypting",
  parseJSON: "Parsing data",
  done: "Complete ✓",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ProgressBar({
  percent,
  phase,
  processedBytes,
  totalBytes,
  visible,
}: ProgressBarProps) {
  const theme = useAppTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percent,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  if (!visible) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const phaseLabel = PHASE_LABELS[phase] || "Processing";
  const showBytes = processedBytes !== undefined && totalBytes !== undefined && totalBytes > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.surfaceBorder,
          borderWidth: theme.shapes.borderThin,
          borderRadius: theme.components.card.radius,
          padding: theme.spacing.lg,
        },
      ]}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
      accessibilityLabel={`${phaseLabel}: ${Math.round(percent)}%`}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.phase,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeMd,
            },
          ]}
        >
          {phaseLabel}
        </Text>
        <Text
          style={[
            styles.percentage,
            {
              color: theme.colors.accent,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.typography.sizeLg,
            },
          ]}
        >
          {Math.round(percent)}%
        </Text>
      </View>

      <View
        style={[
          styles.progressTrack,
          {
            backgroundColor: theme.colors.background,
            borderRadius: theme.shapes.radiusSm,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.colors.accent,
              width: progressWidth,
              borderRadius: theme.shapes.radiusSm,
            },
          ]}
        />
      </View>

      {showBytes && (
        <Text
          style={[
            styles.bytes,
            {
              color: theme.colors.textMuted,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeSm,
            },
          ]}
        >
          {formatBytes(processedBytes!)} / {formatBytes(totalBytes!)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phase: {
    flex: 1,
  },
  percentage: {
    marginLeft: 8,
  },
  progressTrack: {
    height: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  bytes: {
    textAlign: "right",
  },
});
