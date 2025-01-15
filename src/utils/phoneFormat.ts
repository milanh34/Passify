// src/utils/phoneFormat.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const PHONE_FORMAT_KEY = "@PM:phone_format";

export type PhoneFormatOption =
  | "PLAIN"
  | "SPACED"
  | "DASHED"
  | "DOTTED"
  | "PARENTHESES"
  | "INTERNATIONAL"
  | "INTL_DASHED"
  | "INTL_COMPACT"
  | "LOCAL_DASHED"
  | "GROUPED_4"
  | "GROUPED_3_4"
  | "INDIAN";

export const PHONE_FORMAT_OPTIONS: { id: PhoneFormatOption; label: string; example: string }[] = [
  { id: "PLAIN", label: "Plain (no formatting)", example: "1234567890" },
  { id: "SPACED", label: "Spaced (5-5)", example: "12345 67890" },
  { id: "DASHED", label: "Dashed (3-3-4)", example: "123-456-7890" },
  { id: "DOTTED", label: "Dotted (3-3-4)", example: "123.456.7890" },
  { id: "PARENTHESES", label: "Parentheses", example: "(123) 456-7890" },
  { id: "INTERNATIONAL", label: "International spaced", example: "+1 123 456 7890" },
  { id: "INTL_DASHED", label: "International dashed", example: "+1-123-456-7890" },
  { id: "INTL_COMPACT", label: "International compact", example: "+11234567890" },
  { id: "LOCAL_DASHED", label: "Local dashed (5-5)", example: "01234-567890" },
  { id: "GROUPED_4", label: "Grouped by 4", example: "1234 5678 90" },
  { id: "GROUPED_3_4", label: "Grouped 3-4-3", example: "123 4567 890" },
  { id: "INDIAN", label: "Indian format", example: "+91 12345 67890" },
];

export async function getPhoneFormat(): Promise<PhoneFormatOption> {
  try {
    const stored = await AsyncStorage.getItem(PHONE_FORMAT_KEY);
    if (stored && PHONE_FORMAT_OPTIONS.some((o) => o.id === stored)) {
      return stored as PhoneFormatOption;
    }
    return "PLAIN";
  } catch (error) {
    console.error("Failed to get phone format:", error);
    return "PLAIN";
  }
}

export async function setPhoneFormat(format: PhoneFormatOption): Promise<void> {
  try {
    await AsyncStorage.setItem(PHONE_FORMAT_KEY, format);
  } catch (error) {
    console.error("Failed to set phone format:", error);
  }
}

function parsePhone(phone: string): { countryCode: string; digits: string } {
  const trimmed = phone.trim();
  let countryCode = "";
  let digits = "";

  if (trimmed.startsWith("+")) {
    const match = trimmed.match(/^\+(\d{1,4})/);
    if (match) {
      countryCode = match[1];
    }
  }

  digits = trimmed.replace(/\D/g, "");

  if (countryCode && digits.startsWith(countryCode)) {
    digits = digits.substring(countryCode.length);
  }

  return { countryCode, digits };
}

export function formatPhone(phone: string, format: PhoneFormatOption): string {
  if (!phone || phone.trim() === "") return "";

  const { countryCode, digits } = parsePhone(phone);

  if (digits.length < 7) {
    return phone;
  }

  const len = digits.length;

  switch (format) {
    case "PLAIN":
      return countryCode ? `+${countryCode}${digits}` : digits;

    case "SPACED":
      if (len === 10) {
        return countryCode
          ? `+${countryCode} ${digits.slice(0, 5)} ${digits.slice(5)}`
          : `${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
      const mid = Math.ceil(len / 2);
      return countryCode
        ? `+${countryCode} ${digits.slice(0, mid)} ${digits.slice(mid)}`
        : `${digits.slice(0, mid)} ${digits.slice(mid)}`;

    case "DASHED":
      if (len === 10) {
        return countryCode
          ? `+${countryCode}-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
          : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      if (len === 7) {
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      }
      return countryCode ? `+${countryCode}-${digits}` : digits;

    case "DOTTED":
      if (len === 10) {
        return countryCode
          ? `+${countryCode}.${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
          : `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      }
      return countryCode ? `+${countryCode}.${digits}` : digits;

    case "PARENTHESES":
      if (len === 10) {
        return countryCode
          ? `+${countryCode} (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
          : `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      if (len >= 7) {
        const areaCode = digits.slice(0, 3);
        const rest = digits.slice(3);
        return countryCode ? `+${countryCode} (${areaCode}) ${rest}` : `(${areaCode}) ${rest}`;
      }
      return phone;

    case "INTERNATIONAL":
      if (len === 10) {
        const cc = countryCode || "1";
        return `+${cc} ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      }
      return countryCode ? `+${countryCode} ${digits}` : `+1 ${digits}`;

    case "INTL_DASHED":
      if (len === 10) {
        const cc = countryCode || "1";
        return `+${cc}-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      return countryCode ? `+${countryCode}-${digits}` : `+1-${digits}`;

    case "INTL_COMPACT":
      return countryCode ? `+${countryCode}${digits}` : `+1${digits}`;

    case "LOCAL_DASHED":
      if (len === 10) {
        return `${digits.slice(0, 5)}-${digits.slice(5)}`;
      }
      if (len === 11 && digits.startsWith("0")) {
        return `${digits.slice(0, 5)}-${digits.slice(5)}`;
      }
      return digits;

    case "GROUPED_4":
      let result = "";
      for (let i = 0; i < digits.length; i += 4) {
        if (result) result += " ";
        result += digits.slice(i, i + 4);
      }
      return countryCode ? `+${countryCode} ${result}` : result;

    case "GROUPED_3_4":
      if (len === 10) {
        return countryCode
          ? `+${countryCode} ${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
          : `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
      }
      return countryCode ? `+${countryCode} ${digits}` : digits;

    case "INDIAN":
      if (len === 10) {
        const cc = countryCode || "91";
        return `+${cc} ${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
      return countryCode ? `+${countryCode} ${digits}` : `+91 ${digits}`;

    default:
      return phone;
  }
}

export function getPhoneFormatLabel(format: PhoneFormatOption): string {
  const option = PHONE_FORMAT_OPTIONS.find((o) => o.id === format);
  return option?.label || format;
}

export function isValidPhoneInput(phone: string): boolean {
  if (!phone || phone.trim() === "") return true;

  const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, "");

  if (!/^\d+$/.test(cleaned)) return false;

  return cleaned.length >= 7 && cleaned.length <= 15;
}
