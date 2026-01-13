// src/utils/dateFormat.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const DATE_FORMAT_KEY = "@PM:date_format";

export type DateFormatOption = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" | "MMM D, YYYY";

export const DATE_FORMAT_OPTIONS: { id: DateFormatOption; label: string; example: string }[] = [
  { id: "DD/MM/YYYY", label: "Day/Month/Year", example: "25/12/2024" },
  { id: "MM/DD/YYYY", label: "Month/Day/Year", example: "12/25/2024" },
  { id: "YYYY-MM-DD", label: "Year-Month-Day (ISO)", example: "2024-12-25" },
  { id: "MMM D, YYYY", label: "Month Name", example: "Dec 25, 2024" },
];

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getDateFormat(): Promise<DateFormatOption> {
  try {
    const stored = await AsyncStorage.getItem(DATE_FORMAT_KEY);
    if (stored && DATE_FORMAT_OPTIONS.some((o) => o.id === stored)) {
      return stored as DateFormatOption;
    }
    return "DD/MM/YYYY"; // Default
  } catch (error) {
    console.error("Failed to get date format:", error);
    return "DD/MM/YYYY";
  }
}

export async function setDateFormat(format: DateFormatOption): Promise<void> {
  try {
    await AsyncStorage.setItem(DATE_FORMAT_KEY, format);
  } catch (error) {
    console.error("Failed to set date format:", error);
  }
}

export function formatDate(dateString: string, format: DateFormatOption): string {
  if (!dateString || dateString.trim() === "") return "";

  let day: number, month: number, year: number;

  // Try to parse the input date (could be in various formats)
  try {
    if (dateString.includes("/")) {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        // Detect if it's DD/MM/YYYY or MM/DD/YYYY based on values
        const first = parseInt(parts[0], 10);
        const second = parseInt(parts[1], 10);
        const third = parseInt(parts[2], 10);

        if (first > 12) {
          // Must be DD/MM/YYYY
          day = first;
          month = second;
          year = third;
        } else if (second > 12) {
          // Must be MM/DD/YYYY
          month = first;
          day = second;
          year = third;
        } else {
          // Ambiguous, assume DD/MM/YYYY
          day = first;
          month = second;
          year = third;
        }
      } else {
        return dateString;
      }
    } else if (dateString.includes("-")) {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          // DD-MM-YYYY
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
        }
      } else {
        return dateString;
      }
    } else {
      return dateString;
    }

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return dateString;
    }

    // Format output
    const dayStr = day.toString().padStart(2, "0");
    const monthStr = month.toString().padStart(2, "0");
    const yearStr = year.toString();

    switch (format) {
      case "DD/MM/YYYY":
        return `${dayStr}/${monthStr}/${yearStr}`;
      case "MM/DD/YYYY":
        return `${monthStr}/${dayStr}/${yearStr}`;
      case "YYYY-MM-DD":
        return `${yearStr}-${monthStr}-${dayStr}`;
      case "MMM D, YYYY":
        return `${MONTHS_SHORT[month - 1]} ${day}, ${yearStr}`;
      default:
        return dateString;
    }
  } catch {
    return dateString;
  }
}

export function getDateFormatLabel(format: DateFormatOption): string {
  const option = DATE_FORMAT_OPTIONS.find((o) => o.id === format);
  return option?.label || format;
}