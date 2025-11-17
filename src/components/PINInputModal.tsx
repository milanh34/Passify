// src/components/PINInputModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../context/ThemeContext';
import { validatePINFormat } from '../utils/pinCode';


interface PINInputModalProps {
  visible: boolean;
  onSubmit: (pin: string) => Promise<boolean>;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  mode?: 'unlock' | 'setup' | 'change';
  minLength?: number;
  maxLength?: number;
}


export default function PINInputModal({
  visible,
  onSubmit,
  onCancel,
  title = 'Enter PIN',
  subtitle = 'Enter your PIN code',
  mode = 'unlock',
  minLength = 4,
  maxLength = 6,
}: PINInputModalProps) {
  const { colors, fontConfig } = useTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (visible) {
      setPin('');
      setError('');
      setIsLoading(false);
    }
  }, [visible]);


  const handleNumberPress = (num: number) => {
    if (pin.length < maxLength) {
      const newPin = pin + num.toString();
      setPin(newPin);
      setError('');


      if (mode === 'unlock' && newPin.length === maxLength) {
        handleSubmit(newPin);
      }
    }
  };


  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };


  const handleSubmit = async (pinToSubmit?: string) => {
    const currentPin = pinToSubmit || pin;


    if (currentPin.length < minLength) {
      setError(`PIN must be at least ${minLength} digits`);
      Vibration.vibrate(100);
      return;
    }


    const validation = validatePINFormat(currentPin);
    if (!validation.isValid) {
      setError(`PIN must be ${minLength}-${maxLength} digits`);
      Vibration.vibrate(100);
      return;
    }


    setIsLoading(true);
    const success = await onSubmit(currentPin);
    setIsLoading(false);


    if (!success) {
      setError('Incorrect PIN. Try again.');
      setPin('');
      Vibration.vibrate([100, 50, 100]);
    }
  };


  const renderKeypad = () => {
    const keys = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ['', 0, 'backspace'],
    ];


    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={styles.keyButton} />;
              }


              if (key === 'backspace') {
                return (
                  <Pressable
                    key={keyIndex}
                    onPress={handleBackspace}
                    disabled={pin.length === 0 || isLoading}
                    style={[
                      styles.keyButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    android_ripple={{ color: colors.accent + '22' }}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={28}
                      color={pin.length === 0 ? colors.subtext : colors.text}
                    />
                  </Pressable>
                );
              }


              return (
                <Pressable
                  key={keyIndex}
                  onPress={() => handleNumberPress(key as number)}
                  disabled={pin.length >= maxLength || isLoading}
                  style={[
                    styles.keyButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  android_ripple={{ color: colors.accent + '22' }}
                >
                  <Text
                    style={[
                      styles.keyText,
                      {
                        color: colors.text,
                        fontFamily: fontConfig.bold,
                      },
                    ]}
                  >
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    );
  };


  const renderPINDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {Array.from({ length: maxLength }).map((_, index) => (
          <MotiView
            key={index}
            from={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: index < pin.length ? 1 : 0.8,
              opacity: index < pin.length ? 1 : 0.3,
            }}
            transition={{ type: 'timing', duration: 150 }}
            style={[
              styles.pinDot,
              {
                backgroundColor:
                  index < pin.length ? colors.accent : colors.cardBorder,
              },
            ]}
          />
        ))}
      </View>
    );
  };


  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View
        style={[
          styles.modalOverlay,
          { backgroundColor: colors.bg[0] + 'CC' },
        ]}
      >
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.bg[0],
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.header}>
            <Ionicons
              name="lock-closed-outline"
              size={48}
              color={colors.accent}
            />
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontFamily: fontConfig.bold,
                },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.subtext,
                  fontFamily: fontConfig.regular,
                },
              ]}
            >
              {subtitle}
            </Text>
          </View>


          {renderPINDots()}


          <AnimatePresence>
            {error && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                transition={{ type: 'timing', duration: 200 }}
                style={styles.errorContainer}
              >
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text
                  style={[
                    styles.errorText,
                    {
                      color: colors.danger,
                      fontFamily: fontConfig.regular,
                    },
                  ]}
                >
                  {error}
                </Text>
              </MotiView>
            )}
          </AnimatePresence>


          {renderKeypad()}


          <View style={styles.actions}>
            {mode !== 'unlock' && (
              <Pressable
                onPress={() => handleSubmit()}
                disabled={pin.length < minLength || isLoading}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      pin.length >= minLength ? colors.accent : colors.cardBorder,
                  },
                ]}
                android_ripple={{ color: colors.bg[0] }}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    {
                      color: pin.length >= minLength ? '#fff' : colors.subtext,
                      fontFamily: fontConfig.bold,
                    },
                  ]}
                >
                  {isLoading ? 'Verifying...' : 'Submit'}
                </Text>
              </Pressable>
            )}


            {onCancel && (
              <Pressable
                onPress={onCancel}
                disabled={isLoading}
                style={styles.cancelButton}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    {
                      color: colors.subtext,
                      fontFamily: fontConfig.regular,
                    },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
            )}
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
  },
  keypad: {
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 28,
  },
  actions: {
    gap: 12,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
  },
});
