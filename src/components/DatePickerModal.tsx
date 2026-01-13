// src/components/DatePickerModal.tsx

import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTheme } from "../context/ThemeContext";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate?: string;
  format?: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
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

export default function DatePickerModal({
  visible,
  onClose,
  onSelect,
  initialDate = "",
  format = "DD/MM/YYYY",
}: DatePickerModalProps) {
  const { colors, fontConfig } = useTheme();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(currentYear - 20);
  const [activeColumn, setActiveColumn] = useState<"day" | "month" | "year">("day");

  useEffect(() => {
    if (visible && initialDate) {
      try {
        let day: number, month: number, year: number;

        if (format === "DD/MM/YYYY") {
          const parts = initialDate.split("/");
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          year = parseInt(parts[2], 10);
        } else if (format === "MM/DD/YYYY") {
          const parts = initialDate.split("/");
          month = parseInt(parts[0], 10) - 1;
          day = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
        } else {
          const parts = initialDate.split("-");
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          day = parseInt(parts[2], 10);
        }

        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          setSelectedDay(day);
          setSelectedMonth(month);
          setSelectedYear(year);
        }
      } catch (e) {}
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
    const dayStr = selectedDay.toString().padStart(2, "0");
    const monthStr = (selectedMonth + 1).toString().padStart(2, "0");
    const yearStr = selectedYear.toString();

    let formattedDate: string;
    if (format === "DD/MM/YYYY") {
      formattedDate = `${dayStr}/${monthStr}/${yearStr}`;
    } else if (format === "MM/DD/YYYY") {
      formattedDate = `${monthStr}/${dayStr}/${yearStr}`;
    } else {
      formattedDate = `${yearStr}-${monthStr}-${dayStr}`;
    }

    onSelect(formattedDate);
    onClose();
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setActiveColumn("day");
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setActiveColumn("month");
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setActiveColumn("year");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 50 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 250 }}
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Ionicons name="calendar" size={24} color={colors.accent} />
            <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
              Select Date
            </Text>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.bg[0] }]}
            >
              <Ionicons name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>

          <View style={[styles.previewContainer, { backgroundColor: colors.accent + "15" }]}>
            <Text
              style={[styles.previewText, { color: colors.accent, fontFamily: fontConfig.bold }]}
            >
              {selectedDay} {MONTHS[selectedMonth]} {selectedYear}
            </Text>
          </View>

          <View style={styles.columnsContainer}>
            <View style={styles.columnWrapper}>
              <Text
                style={[styles.columnLabel, { color: colors.muted, fontFamily: fontConfig.bold }]}
              >
                Day
              </Text>
              <ScrollView
                style={[
                  styles.column,
                  { borderColor: activeColumn === "day" ? colors.accent : colors.cardBorder },
                ]}
                contentContainerStyle={styles.columnContent}
                showsVerticalScrollIndicator={false}
                onTouchStart={() => setActiveColumn("day")}
              >
                {days.map((day) => {
                  const isSelected = day === selectedDay;
                  return (
                    <Pressable
                      key={`day-${day}`}
                      onPress={() => handleDaySelect(day)}
                      style={[
                        styles.columnItem,
                        isSelected && { backgroundColor: colors.accent + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.columnItemText,
                          {
                            color: isSelected ? colors.accent : colors.text,
                            fontFamily: isSelected ? fontConfig.bold : fontConfig.regular,
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={[styles.columnWrapper, { flex: 1.5 }]}>
              <Text
                style={[styles.columnLabel, { color: colors.muted, fontFamily: fontConfig.bold }]}
              >
                Month
              </Text>
              <ScrollView
                style={[
                  styles.column,
                  { borderColor: activeColumn === "month" ? colors.accent : colors.cardBorder },
                ]}
                contentContainerStyle={styles.columnContent}
                showsVerticalScrollIndicator={false}
                onTouchStart={() => setActiveColumn("month")}
              >
                {MONTHS.map((month, index) => {
                  const isSelected = index === selectedMonth;
                  return (
                    <Pressable
                      key={`month-${index}`}
                      onPress={() => handleMonthSelect(index)}
                      style={[
                        styles.columnItem,
                        isSelected && { backgroundColor: colors.accent + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.columnItemText,
                          {
                            color: isSelected ? colors.accent : colors.text,
                            fontFamily: isSelected ? fontConfig.bold : fontConfig.regular,
                          },
                        ]}
                      >
                        {month}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.columnWrapper}>
              <Text
                style={[styles.columnLabel, { color: colors.muted, fontFamily: fontConfig.bold }]}
              >
                Year
              </Text>
              <ScrollView
                style={[
                  styles.column,
                  { borderColor: activeColumn === "year" ? colors.accent : colors.cardBorder },
                ]}
                contentContainerStyle={styles.columnContent}
                showsVerticalScrollIndicator={false}
                onTouchStart={() => setActiveColumn("year")}
              >
                {years.map((year) => {
                  const isSelected = year === selectedYear;
                  return (
                    <Pressable
                      key={`year-${year}`}
                      onPress={() => handleYearSelect(year)}
                      style={[
                        styles.columnItem,
                        isSelected && { backgroundColor: colors.accent + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.columnItemText,
                          {
                            color: isSelected ? colors.accent : colors.text,
                            fontFamily: isSelected ? fontConfig.bold : fontConfig.regular,
                          },
                        ]}
                      >
                        {year}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={[
                styles.actionButton,
                { backgroundColor: colors.bg[0], borderColor: colors.cardBorder },
              ]}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: colors.text, fontFamily: fontConfig.bold },
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
                { backgroundColor: colors.accent },
              ]}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text
                style={[styles.actionButtonText, { color: "#fff", fontFamily: fontConfig.bold }]}
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
    borderRadius: 20,
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
    borderRadius: 12,
    borderWidth: 1,
  },
  columnContent: {
    paddingVertical: 4,
  },
  columnItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
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
    borderRadius: 12,
    borderWidth: 1,
  },
  confirmButton: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 15,
  },
});
