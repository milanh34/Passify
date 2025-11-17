import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ProgressPhase } from '../types/progress';



interface ProgressBarProps {
  percent: number;
  phase: ProgressPhase;
  processedBytes?: number;
  totalBytes?: number;
  visible: boolean;
}



const PHASE_LABELS: Record<ProgressPhase, string> = {
  stringify: 'Serializing data',
  encrypt: 'Encrypting',
  pack: 'Packing into pixels',
  encodePNG: 'Encoding PNG image',
  writeFile: 'Writing file',
  readFile: 'Reading file',
  decodePNG: 'Decoding PNG image',
  unpack: 'Extracting pixel data',
  decrypt: 'Decrypting',
  parseJSON: 'Parsing data',
  done: 'Complete ✓',
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
  const { colors, fontConfig } = useTheme();
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
    outputRange: ['0%', '100%'],
  });
  
  const phaseLabel = PHASE_LABELS[phase] || 'Processing';
  const showBytes = processedBytes !== undefined && totalBytes !== undefined && totalBytes > 0;
  
  return (
    <View
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
      accessibilityLabel={`${phaseLabel}: ${Math.round(percent)}%`}
    >
      <View style={styles.header}>
        <Text style={[styles.phase, { color: colors.text, fontFamily: fontConfig.regular }]}>
          {phaseLabel}
        </Text>
        <Text style={[styles.percentage, { color: colors.accent, fontFamily: fontConfig.bold }]}>
          {Math.round(percent)}%
        </Text>
      </View>
      
      <View style={[styles.progressTrack, { backgroundColor: colors.bg[0] }]}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: colors.accent, width: progressWidth },
          ]}
        />
      </View>
      
      {showBytes && (
        <Text style={[styles.bytes, { color: colors.muted, fontFamily: fontConfig.regular }]}>
          {formatBytes(processedBytes!)} / {formatBytes(totalBytes!)}
        </Text>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phase: {
    fontSize: 14,
    flex: 1,
  },
  percentage: {
    fontSize: 16,
    marginLeft: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bytes: {
    fontSize: 12,
    textAlign: 'right',
  },
});
