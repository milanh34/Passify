// src/components/AccountSortModal.tsx

import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../themes/hooks/useAppTheme";
import { ACCOUNT_SORT_OPTIONS, AccountSortOption } from "../utils/sortAccounts";

interface AccountSortModalProps {
  visible: boolean;
  currentSort: AccountSortOption;
  onSelect: (option: AccountSortOption) => void;
  onClose: () => void;
}

export default function AccountSortModal({
  visible,
  currentSort,
  onSelect,
  onClose,
}: AccountSortModalProps) {
  const theme = useAppTheme();

  const handleSelect = (option: AccountSortOption) => {
    onSelect(option);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.components.modal.radius,
              ...theme.shadows.lg,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Ionicons name="funnel-outline" size={24} color={theme.colors.accent} />
            <Text
              style={[
                styles.title,
                { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
              ]}
            >
              Sort Accounts
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.optionsList}>
            {ACCOUNT_SORT_OPTIONS.map((option) => {
              const isSelected = currentSort === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: isSelected ? theme.colors.accentMuted : "transparent",
                      borderColor: isSelected ? theme.colors.accent : theme.colors.surfaceBorder,
                      borderRadius: theme.shapes.radiusMd,
                    },
                  ]}
                  android_ripple={{ color: theme.colors.accentMuted }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={isSelected ? theme.colors.accent : theme.colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? theme.colors.accent : theme.colors.textPrimary,
                        fontFamily: isSelected
                          ? theme.typography.fontBold
                          : theme.typography.fontRegular,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});
