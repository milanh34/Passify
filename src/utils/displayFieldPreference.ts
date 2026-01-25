// src/utils/displayFieldPreference.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "./logger";

const DISPLAY_FIELD_KEY = "@PM:display_field_preferences";

export interface DisplayFieldPreferences {
  [platformKey: string]: string;
}

export async function getDisplayFieldPreferences(): Promise<DisplayFieldPreferences> {
  try {
    const stored = await AsyncStorage.getItem(DISPLAY_FIELD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {};
  } catch (error) {
    log.error("Failed to get display field preferences:", error);
    return {};
  }
}

export async function setDisplayFieldPreference(
  platformKey: string,
  fieldName: string
): Promise<void> {
  try {
    const preferences = await getDisplayFieldPreferences();
    preferences[platformKey] = fieldName;
    await AsyncStorage.setItem(DISPLAY_FIELD_KEY, JSON.stringify(preferences));
  } catch (error) {
    log.error("Failed to set display field preference:", error);
  }
}

export async function getDisplayFieldForPlatform(platformKey: string): Promise<string> {
  try {
    const preferences = await getDisplayFieldPreferences();
    return preferences[platformKey] || "name";
  } catch (error) {
    log.error("Failed to get display field for platform:", error);
    return "name";
  }
}

export async function removeDisplayFieldPreference(platformKey: string): Promise<void> {
  try {
    const preferences = await getDisplayFieldPreferences();
    delete preferences[platformKey];
    await AsyncStorage.setItem(DISPLAY_FIELD_KEY, JSON.stringify(preferences));
  } catch (error) {
    log.error("Failed to remove display field preference:", error);
  }
}

export function getDisplayValue(account: any, displayField: string): string {
  if (!account) return "Unnamed Account";

  if (displayField && account[displayField] && account[displayField].trim()) {
    return account[displayField];
  }

  if (account.name && account.name.trim()) {
    return account.name;
  }

  if (account.email) return account.email;
  if (account.username) return account.username;

  return "Unnamed Account";
}

export function getAvailableDisplayFields(schema: string[]): string[] {
  const excludedFields = ["id", "createdAt", "updatedAt", "password", "secret", "pin"];
  return schema.filter((field) => !excludedFields.includes(field.toLowerCase()));
}
