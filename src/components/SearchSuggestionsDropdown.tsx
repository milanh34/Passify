// src/components/SearchSuggestionsDropdown.tsx

import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../themes/hooks/useAppTheme";

interface SearchSuggestionsDropdownProps {
  visible: boolean;
  suggestions: string[];
  onSelectSuggestion: (query: string) => void;
  maxHeight?: number;
}

export default function SearchSuggestionsDropdown({
  visible,
  suggestions,
  onSelectSuggestion,
  maxHeight = 300,
}: SearchSuggestionsDropdownProps) {
  const theme = useAppTheme();

  if (!visible) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -10 }}
      transition={{ type: "timing", duration: theme.animations.durationFast }}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.surfaceBorder,
          borderWidth: theme.shapes.borderThin,
          borderRadius: theme.components.card.radius,
          maxHeight,
          ...theme.shadows.md,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {suggestions.map((suggestion, index) => (
          <Pressable
            key={`suggestion-${index}`}
            onPress={() => onSelectSuggestion(suggestion)}
            style={[
              styles.suggestionItem,
              {
                borderBottomColor: theme.colors.surfaceBorder,
                borderBottomWidth: index < suggestions.length - 1 ? theme.shapes.borderThin : 0,
                padding: theme.spacing.md,
              },
            ]}
            android_ripple={{ color: theme.colors.accentMuted }}
          >
            <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
            <Text
              style={[
                styles.suggestionText,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeMd,
                },
              ]}
              numberOfLines={1}
            >
              {suggestion}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 1000,
    elevation: 8,
  },
  scrollView: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 48,
  },
  suggestionText: {
    flex: 1,
  },
});
