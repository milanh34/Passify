// src/components/SearchBar.tsx

import React, { useState, useMemo, useRef } from "react";
import { View, TextInput, Pressable, StyleSheet, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../themes/hooks/useAppTheme";
import SearchSuggestionsDropdown from "./SearchSuggestionsDropdown";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  suggestions?: string[];
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search...",
  suggestions = [],
}: SearchBarProps) {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const filteredSuggestions = useMemo(() => {
    if (!value || value.trim().length === 0) {
      return suggestions.slice(0, 10);
    }

    const lowerQuery = value.toLowerCase().trim();
    return suggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(lowerQuery))
      .slice(0, 10);
  }, [value, suggestions]);

  const toggleSuggestions = () => {
    if (showSuggestions) {
      setShowSuggestions(false);
      Keyboard.dismiss();
    } else {
      setShowSuggestions(true);
      inputRef.current?.focus();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 150);
  };

  const handleSelectSuggestion = (query: string) => {
    onChangeText(query);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    onClear();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isFocused ? theme.colors.accent : theme.colors.surfaceBorder,
            borderWidth: isFocused ? theme.shapes.borderThick : theme.shapes.borderThin,
            borderRadius: theme.components.input.radius,
            height: theme.components.input.height,
          },
        ]}
      >
        <Pressable
          onPress={toggleSuggestions}
          style={styles.searchIconButton}
          android_ripple={{ color: theme.colors.accentMuted }}
        >
          <Ionicons
            name={showSuggestions ? "chevron-down" : "search"}
            size={20}
            color={isFocused ? theme.colors.accent : theme.colors.textMuted}
          />
        </Pressable>

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.components.input.fontSize,
            },
          ]}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            android_ripple={{ color: theme.colors.accentMuted }}
          >
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </Pressable>
        )}
      </View>

      <SearchSuggestionsDropdown
        visible={showSuggestions && filteredSuggestions.length > 0}
        suggestions={filteredSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 100,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIconButton: {
    padding: 4,
    marginRight: 8,
    borderRadius: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});
