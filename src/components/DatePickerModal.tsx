// src/components/DatePickerModal.tsx

import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../themes/hooks/useAppTheme";
import { DateFormatOption } from "../utils/dateFormat";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate?: string;
  format?: DateFormatOption;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(month: number, year: number): number {
  if (month === 1 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[month];
}

function parseDate(
  dateStr: string,
  format: DateFormatOption
): { day: number; month: number; year: number } | null {
  try {
    let day: number, month: number, year: number;
    const separator = dateStr.includes("/") ? "/" : "-";
    const parts = dateStr.split(separator);

    if (parts.length !== 3) return null;

    if (format.startsWith("DD")) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    } else if (format.startsWith("MM")) {
      month = parseInt(parts[0], 10) - 1;
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return { day, month, year };
    }
  } catch (e) {}
  return null;
}

function formatDate(day: number, month: number, year: number, format: DateFormatOption): string {
  const dayStr = day.toString().padStart(2, "0");
  const monthStr = (month + 1).toString().padStart(2, "0");
  const yearStr = year.toString();

  switch (format) {
    case "DD/MM/YYYY":
      return `${dayStr}/${monthStr}/${yearStr}`;
    case "MM/DD/YYYY":
      return `${monthStr}/${dayStr}/${yearStr}`;
    case "YYYY-MM-DD":
      return `${yearStr}-${monthStr}-${dayStr}`;
    case "DD-MM-YYYY":
      return `${dayStr}-${monthStr}-${yearStr}`;
    case "MM-DD-YYYY":
      return `${monthStr}-${dayStr}-${yearStr}`;
    case "YYYY/MM/DD":
      return `${yearStr}/${monthStr}/${dayStr}`;
    default:
      return `${dayStr}/${monthStr}/${yearStr}`;
  }
}

export default function DatePickerModal({
  visible,
  onClose,
  onSelect,
  initialDate = "",
  format = "DD/MM/YYYY",
}: DatePickerModalProps) {
  const theme = useAppTheme();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(currentYear - 20);
  const [activeColumn, setActiveColumn] = useState<"day" | "month" | "year">("day");

  useEffect(() => {
    if (visible && initialDate) {
      const parsed = parseDate(initialDate, format);
      if (parsed) {
        setSelectedDay(parsed.day);
        setSelectedMonth(parsed.month);
        setSelectedYear(parsed.year);
      }
    }
  }, [visible, initialDate, format]);

  const daysInCurrentMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (selectedDay > daysInCurrentMonth) {
      setSelectedDay(daysInCurrentMonth);
    }
  }, [selectedMonth, selectedYear, daysInCurrentMonth]);

  const handleConfirm = () => {
    const formattedDate = formatDate(selectedDay, selectedMonth, selectedYear, format);
    onSelect(formattedDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 50 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: theme.animations.durationNormal }}
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderRadius: theme.components.modal.radius,
              ...theme.shadows.lg,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Ionicons name="calendar" size={24} color={theme.colors.accent} />
            <Text
              style={[
                styles.title,
                { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
              ]}
            >
              Select Date
            </Text>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
            >
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={[styles.previewContainer, { backgroundColor: theme.colors.accentMuted }]}>
            <Text
              style={[
                styles.previewText,
                { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
              ]}
            >
              {selectedDay} {MONTHS[selectedMonth]} {selectedYear}
            </Text>
          </View>

          <View style={styles.columnsContainer}>
            {[
              {
                label: "Day",
                data: days,
                value: selectedDay,
                setValue: setSelectedDay,
                key: "day",
              },
              {
                label: "Month",
                data: MONTHS.map((_, i) => i),
                value: selectedMonth,
                setValue: setSelectedMonth,
                key: "month",
                flex: 1.5,
              },
              {
                label: "Year",
                data: years,
                value: selectedYear,
                setValue: setSelectedYear,
                key: "year",
              },
            ].map((col) => (
              <View
                key={col.key}
                style={[styles.columnWrapper, col.flex ? { flex: col.flex } : {}]}
              >
                <Text
                  style={[
                    styles.columnLabel,
                    { color: theme.colors.textMuted, fontFamily: theme.typography.fontBold },
                  ]}
                >
                  {col.label}
                </Text>
                <ScrollView
                  style={[
                    styles.column,
                    {
                      borderColor:
                        activeColumn === col.key ? theme.colors.accent : theme.colors.surfaceBorder,
                      borderRadius: theme.shapes.radiusMd,
                    },
                  ]}
                  contentContainerStyle={styles.columnContent}
                  showsVerticalScrollIndicator={false}
                  onTouchStart={() => setActiveColumn(col.key as any)}
                >
                  {col.data.map((item) => {
                    const displayValue = col.key === "month" ? MONTHS[item as number] : item;
                    const isSelected = item === col.value;
                    return (
                      <Pressable
                        key={`${col.key}-${item}`}
                        onPress={() => col.setValue(item as number)}
                        style={[
                          styles.columnItem,
                          isSelected && { backgroundColor: theme.colors.accentMuted },
                          { borderRadius: theme.shapes.radiusSm },
                        ]}
                      >
                        <Text
                          style={[
                            styles.columnItemText,
                            {
                              color: isSelected ? theme.colors.accent : theme.colors.textPrimary,
                              fontFamily: isSelected
                                ? theme.typography.fontBold
                                : theme.typography.fontRegular,
                            },
                          ]}
                        >
                          {displayValue}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.components.button.radius,
                },
              ]}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                ]}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={[
                styles.actionButton,
                styles.confirmButton,
                {
                  backgroundColor: theme.colors.accent,
                  borderRadius: theme.components.button.radius,
                },
              ]}
            >
              <Ionicons name="checkmark" size={18} color={theme.colors.textInverse} />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.textInverse, fontFamily: theme.typography.fontBold },
                ]}
              >
                Confirm
              </Text>
            </Pressable>
          </View>
        </MotiView>
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
    maxWidth: 380,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    flex: 1,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
  },
  previewContainer: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  previewText: {
    fontSize: 18,
  },
  columnsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    height: 220,
  },
  columnWrapper: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  column: {
    flex: 1,
    borderWidth: 1,
  },
  columnContent: {
    paddingVertical: 4,
  },
  columnItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  columnItemText: {
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderWidth: 1,
  },
  confirmButton: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 15,
  },
});
