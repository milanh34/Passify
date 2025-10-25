import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0-100
  stage: string;
  visible: boolean;
}

export default function ProgressBar({ progress, stage, visible }: ProgressBarProps) {
  const { colors, fontConfig } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress]);
  
  if (!visible) return null;
  
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.stage, { color: colors.text, fontFamily: fontConfig.regular }]}>
        {stage}
      </Text>
      
      <View style={[styles.progressTrack, { backgroundColor: colors.background }]}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: colors.accent, width: progressWidth },
          ]}
        />
      </View>
      
      <Text style={[styles.percentage, { color: colors.muted, fontFamily: fontConfig.bold }]}>
        {Math.round(progress)}%
      </Text>
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
  stage: {
    fontSize: 14,
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
  percentage: {
    fontSize: 12,
    textAlign: 'right',
  },
});
