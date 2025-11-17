import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '../context/ThemeContext';


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
  const { colors, fontConfig } = useTheme();


  if (!visible) return null;


  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -10 }}
      transition={{ type: 'timing', duration: 200 }}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          maxHeight,
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
                borderBottomColor: colors.cardBorder,
                borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
              },
            ]}
            android_ripple={{ color: colors.accent + '22' }}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.muted}
            />
            <Text
              style={[
                styles.suggestionText,
                { color: colors.text, fontFamily: fontConfig.regular },
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
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  scrollView: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  suggestionText: {
    fontSize: 15,
    flex: 1,
  },
});
