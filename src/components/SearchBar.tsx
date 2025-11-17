// src/components/SearchBar.tsx

import React, { useState, useMemo, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
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
  const { colors, fontConfig } = useTheme();
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
            backgroundColor: colors.card,
            borderColor: isFocused ? colors.accent : colors.cardBorder,
          },
        ]}
      >
        <Pressable
          onPress={toggleSuggestions}
          style={styles.searchIconButton}
          android_ripple={{ color: colors.accent + "33" }}
        >
          <Ionicons
            name={showSuggestions ? "chevron-down" : "search"}
            size={20}
            color={isFocused ? colors.accent : colors.muted}
          />
        </Pressable>

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, fontFamily: fontConfig.regular }]}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            android_ripple={{ color: colors.accent + "33" }}
          >
            <Ionicons name="close-circle" size={20} color={colors.muted} />
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
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  searchIconButton: {
    padding: 4,
    marginRight: 8,
    borderRadius: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});
