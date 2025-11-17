// src/components/PlatformIcon.tsx

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  AntDesign,
  Entypo,
  Feather,
} from "@expo/vector-icons";
import { getPlatformIcon, getPlatformInitials, getContrastColor } from "../utils/iconLibrary";
import { useTheme } from "../context/ThemeContext";

interface PlatformIconProps {
  platformName: string;
  iconKey?: string | null;
  iconColor?: string | null;
  size?: number;
  showFallback?: boolean;
  style?: ViewStyle;
}

export default function PlatformIcon({
  platformName,
  iconKey,
  iconColor,
  size = 48,
  showFallback = true,
  style,
}: PlatformIconProps) {
  const { colors, fontConfig } = useTheme();

  const iconMapping = iconKey ? getPlatformIcon(iconKey) : null;

  const displayColor = iconColor || iconMapping?.defaultColor || colors.accent;

  const iconSize = Math.floor(size * 0.6);

  const renderLibraryIcon = () => {
    if (!iconMapping) return null;

    const iconProps = {
      name: iconMapping.iconName as any,
      size: iconSize,
      color: displayColor,
    };

    switch (iconMapping.library) {
      case "MaterialIcons":
        return <MaterialIcons {...iconProps} />;
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons {...iconProps} />;
      case "FontAwesome":
        return <FontAwesome {...iconProps} />;
      case "FontAwesome5":
        return <FontAwesome5 {...iconProps} />;
      case "Ionicons":
        return <Ionicons {...iconProps} />;
      case "AntDesign":
        return <AntDesign {...iconProps} />;
      case "Entypo":
        return <Entypo {...iconProps} />;
      case "Feather":
        return <Feather {...iconProps} />;
      default:
        return null;
    }
  };

  const renderFallback = () => {
    if (!showFallback) return null;

    const initials = getPlatformInitials(platformName);
    const textColor = getContrastColor(displayColor);
    const fontSize = Math.floor(size * 0.35);

    return (
      <View
        style={[
          styles.fallbackContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: displayColor,
          },
        ]}
      >
        <Text
          style={[
            styles.fallbackText,
            {
              color: textColor,
              fontSize,
              fontFamily: fontConfig.bold,
            },
          ]}
        >
          {initials}
        </Text>
      </View>
    );
  };

  const icon = renderLibraryIcon();

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {icon ? (
        <View
          style={[
            styles.iconContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: displayColor + "20",
            },
          ]}
        >
          {icon}
        </View>
      ) : (
        renderFallback()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    textAlign: "center",
  },
});
