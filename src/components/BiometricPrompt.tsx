// src/components/BiometricPrompt.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '../context/ThemeContext';
import { getBiometricIcon, getBiometricTypeName, BiometricType } from '../utils/biometricAuth';


interface BiometricPromptProps {
  biometricType: BiometricType;
  onPress: () => void;
  isLoading?: boolean;
}


export default function BiometricPrompt({
  biometricType,
  onPress,
  isLoading = false,
}: BiometricPromptProps) {
  const { colors, fontConfig } = useTheme();
  const iconName = getBiometricIcon(biometricType);
  const typeName = getBiometricTypeName(biometricType);


  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
      style={styles.container}
    >
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        style={[
          styles.promptButton,
          {
            backgroundColor: colors.accent + '15',
            borderColor: colors.accent,
          },
        ]}
        android_ripple={{ color: colors.accent + '22' }}
      >
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: isLoading ? 1.1 : 1 }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: isLoading,
          }}
        >
          <Ionicons
            name={iconName as any}
            size={64}
            color={colors.accent}
          />
        </MotiView>


        <Text
          style={[
            styles.promptTitle,
            {
              color: colors.text,
              fontFamily: fontConfig.bold,
            },
          ]}
        >
          {isLoading ? 'Authenticating...' : `Unlock with ${typeName}`}
        </Text>


        <Text
          style={[
            styles.promptSubtitle,
            {
              color: colors.subtext,
              fontFamily: fontConfig.regular,
            },
          ]}
        >
          {isLoading ? 'Please wait' : `Tap to use ${typeName}`}
        </Text>
      </Pressable>
    </MotiView>
  );
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  promptButton: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    gap: 16,
  },
  promptTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
