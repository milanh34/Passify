// src/themes/components/ThemedInput.tsx

import React, { useState } from "react";
import { View, TextInput, TextInputProps, Pressable, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme } from "../../context/GlobalThemeContext";

interface ThemedInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: boolean;
  containerStyle?: ViewStyle;
}

export function ThemedInput({
  icon,
  rightIcon,
  onRightIconPress,
  error = false,
  style,
  containerStyle,
  ...props
}: ThemedInputProps) {
  const { theme } = useGlobalTheme();
  const [isFocused, setIsFocused] = useState(false);
  const { components, colors, typography } = theme;

  const borderColor = error ? colors.error : isFocused ? colors.accent : colors.surfaceBorder;

  return (
    <View
      style={[
        styles.container,
        {
          height: components.input.height,
          backgroundColor: colors.surface,
          borderRadius: components.input.radius,
          borderWidth: components.input.borderWidth,
          borderColor,
          paddingHorizontal: components.input.paddingHorizontal,
        },
        containerStyle,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? colors.accent : colors.textMuted}
          style={styles.leftIcon}
        />
      )}
      <TextInput
        style={[
          styles.input,
          {
            fontSize: components.input.fontSize,
            fontFamily: typography.fontRegular,
            color: colors.textPrimary,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {rightIcon && (
        <Pressable onPress={onRightIconPress} style={styles.rightIconButton}>
          <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
  },
  rightIconButton: {
    padding: 8,
  },
});
