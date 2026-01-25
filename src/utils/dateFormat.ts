// src/utils/dateFormat.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "./logger";

const DATE_FORMAT_KEY = "@PM:date_format";

export type DateFormatOption =
  | "DD/MM/YYYY"
  | "DD-MM-YYYY"
  | "MM/DD/YYYY"
  | "MM-DD-YYYY"
  | "YYYY/MM/DD"
  | "YYYY-MM-DD"
  | "YYYY/DD/MM"
  | "YYYY-DD-MM"
  | "D MMM YYYY"
  | "Do MMM YYYY"
  | "MMM D, YYYY"
  | "MMMM D, YYYY"
  | "D MMMM YYYY"
  | "DD MMM YYYY"
  | "MMM DD, YYYY";

export const DATE_FORMAT_OPTIONS: { id: DateFormatOption; label: string; example: string }[] = [
  { id: "DD/MM/YYYY", label: "Day/Month/Year (slash)", example: "25/12/2024" },
  { id: "DD-MM-YYYY", label: "Day-Month-Year (dash)", example: "25-12-2024" },
  { id: "MM/DD/YYYY", label: "Month/Day/Year (slash)", example: "12/25/2024" },
  { id: "MM-DD-YYYY", label: "Month-Day-Year (dash)", example: "12-25-2024" },
  { id: "YYYY/MM/DD", label: "Year/Month/Day (slash)", example: "2024/12/25" },
  { id: "YYYY-MM-DD", label: "Year-Month-Day (ISO)", example: "2024-12-25" },
  { id: "YYYY/DD/MM", label: "Year/Day/Month (slash)", example: "2024/25/12" },
  { id: "YYYY-DD-MM", label: "Year-Day-Month (dash)", example: "2024-25-12" },
  { id: "D MMM YYYY", label: "Day Month Year (short)", example: "25 Dec 2024" },
  { id: "Do MMM YYYY", label: "Day Month Year (ordinal)", example: "25th Dec 2024" },
  { id: "MMM D, YYYY", label: "Month Day, Year (short)", example: "Dec 25, 2024" },
  { id: "MMMM D, YYYY", label: "Month Day, Year (full)", example: "December 25, 2024" },
  { id: "D MMMM YYYY", label: "Day Month Year (full)", example: "25 December 2024" },
  { id: "DD MMM YYYY", label: "Day Month Year (padded)", example: "25 Dec 2024" },
  { id: "MMM DD, YYYY", label: "Month Day, Year (padded)", example: "Dec 25, 2024" },
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTHS_FULL = [
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

export async function getDateFormat(): Promise<DateFormatOption> {
  try {
    const stored = await AsyncStorage.getItem(DATE_FORMAT_KEY);
    if (stored && DATE_FORMAT_OPTIONS.some((o) => o.id === stored)) {
      return stored as DateFormatOption;
    }
    return "DD/MM/YYYY";
  } catch (error) {
    log.error("Failed to get date format:", error);
    return "DD/MM/YYYY";
  }
}

export async function setDateFormat(format: DateFormatOption): Promise<void> {
  try {
    await AsyncStorage.setItem(DATE_FORMAT_KEY, format);
  } catch (error) {
    log.error("Failed to set date format:", error);
  }
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function parseInputDate(dateString: string): { day: number; month: number; year: number } | null {
  if (!dateString || dateString.trim() === "") return null;

  const trimmed = dateString.trim();
  let day: number, month: number, year: number;

  const ordinalMatch = trimmed.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})$/i);
  if (ordinalMatch) {
    day = parseInt(ordinalMatch[1], 10);
    const monthName = ordinalMatch[2].toLowerCase();
    year = parseInt(ordinalMatch[3], 10);

    const monthIndex = MONTHS_SHORT.findIndex((m) => m.toLowerCase() === monthName.substring(0, 3));
    if (monthIndex !== -1) {
      month = monthIndex + 1;
      return { day, month, year };
    }
  }

  const monthFirstMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (monthFirstMatch) {
    const monthName = monthFirstMatch[1].toLowerCase();
    day = parseInt(monthFirstMatch[2], 10);
    year = parseInt(monthFirstMatch[3], 10);

    let monthIndex = MONTHS_SHORT.findIndex((m) => m.toLowerCase() === monthName.substring(0, 3));
    if (monthIndex === -1) {
      monthIndex = MONTHS_FULL.findIndex((m) => m.toLowerCase() === monthName);
    }
    if (monthIndex !== -1) {
      month = monthIndex + 1;
      return { day, month, year };
    }
  }

  const dayFirstMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/i);
  if (dayFirstMatch) {
    day = parseInt(dayFirstMatch[1], 10);
    const monthName = dayFirstMatch[2].toLowerCase();
    year = parseInt(dayFirstMatch[3], 10);

    let monthIndex = MONTHS_SHORT.findIndex((m) => m.toLowerCase() === monthName.substring(0, 3));
    if (monthIndex === -1) {
      monthIndex = MONTHS_FULL.findIndex((m) => m.toLowerCase() === monthName);
    }
    if (monthIndex !== -1) {
      month = monthIndex + 1;
      return { day, month, year };
    }
  }

  if (trimmed.includes("/") || trimmed.includes("-")) {
    const separator = trimmed.includes("/") ? "/" : "-";
    const parts = trimmed.split(separator);

    if (parts.length === 3) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);
      const p3 = parseInt(parts[2], 10);

      if (parts[0].length === 4) {
        year = p1;
        if (p2 > 12 && p3 <= 12) {
          day = p2;
          month = p3;
        } else {
          month = p2;
          day = p3;
        }
        return { day, month, year };
      }

      if (parts[2].length === 4) {
        year = p3;
        if (p1 > 12) {
          day = p1;
          month = p2;
        } else if (p2 > 12) {
          month = p1;
          day = p2;
        } else {
          day = p1;
          month = p2;
        }
        return { day, month, year };
      }
    }
  }

  return null;
}

export function formatDate(dateString: string, format: DateFormatOption): string {
  const parsed = parseInputDate(dateString);
  if (!parsed) return dateString;

  const { day, month, year } = parsed;

  if (
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1
  ) {
    return dateString;
  }

  const dayStr = day.toString().padStart(2, "0");
  const monthStr = month.toString().padStart(2, "0");
  const yearStr = year.toString();
  const monthShort = MONTHS_SHORT[month - 1];
  const monthFull = MONTHS_FULL[month - 1];
  const ordinal = getOrdinalSuffix(day);

  switch (format) {
    case "DD/MM/YYYY":
      return `${dayStr}/${monthStr}/${yearStr}`;
    case "DD-MM-YYYY":
      return `${dayStr}-${monthStr}-${yearStr}`;
    case "MM/DD/YYYY":
      return `${monthStr}/${dayStr}/${yearStr}`;
    case "MM-DD-YYYY":
      return `${monthStr}-${dayStr}-${yearStr}`;
    case "YYYY/MM/DD":
      return `${yearStr}/${monthStr}/${dayStr}`;
    case "YYYY-MM-DD":
      return `${yearStr}-${monthStr}-${dayStr}`;
    case "YYYY/DD/MM":
      return `${yearStr}/${dayStr}/${monthStr}`;
    case "YYYY-DD-MM":
      return `${yearStr}-${dayStr}-${monthStr}`;
    case "D MMM YYYY":
      return `${day} ${monthShort} ${yearStr}`;
    case "Do MMM YYYY":
      return `${day}${ordinal} ${monthShort} ${yearStr}`;
    case "MMM D, YYYY":
      return `${monthShort} ${day}, ${yearStr}`;
    case "MMMM D, YYYY":
      return `${monthFull} ${day}, ${yearStr}`;
    case "D MMMM YYYY":
      return `${day} ${monthFull} ${yearStr}`;
    case "DD MMM YYYY":
      return `${dayStr} ${monthShort} ${yearStr}`;
    case "MMM DD, YYYY":
      return `${monthShort} ${dayStr}, ${yearStr}`;
    default:
      return dateString;
  }
}

export function getDateFormatLabel(format: DateFormatOption): string {
  const option = DATE_FORMAT_OPTIONS.find((o) => o.id === format);
  return option?.label || format;
}

export function getDatePickerFormat(
  format: DateFormatOption
): "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" {
  if (format.startsWith("MM/") || format.startsWith("MM-") || format.startsWith("MMM")) {
    return "MM/DD/YYYY";
  }
  if (format.startsWith("YYYY")) {
    return "YYYY-MM-DD";
  }
  return "DD/MM/YYYY";
}
