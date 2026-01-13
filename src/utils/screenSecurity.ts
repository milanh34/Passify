// src/utils/screenSecurity.ts

import * as ScreenCapture from "expo-screen-capture";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREENSHOT_ALLOWED_KEY = "@PM:screenshot_allowed";

let isPreventingCapture = false;

export async function getScreenshotAllowed(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(SCREENSHOT_ALLOWED_KEY);
    return stored === "true";
  } catch (error) {
    console.error("Failed to get screenshot setting:", error);
    return false;
  }
}

export async function setScreenshotAllowed(allowed: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SCREENSHOT_ALLOWED_KEY, allowed.toString());
    if (allowed) {
      await allowScreenCapture();
    } else {
      await preventScreenCapture();
    }
  } catch (error) {
    console.error("Failed to set screenshot setting:", error);
  }
}

export async function preventScreenCapture(): Promise<void> {
  if (isPreventingCapture) return;

  try {
    await ScreenCapture.preventScreenCaptureAsync();
    isPreventingCapture = true;
    console.log("🔒 Screen capture prevention enabled");
  } catch (error) {
    console.error("Failed to prevent screen capture:", error);
  }
}

export async function allowScreenCapture(): Promise<void> {
  if (!isPreventingCapture) return;

  try {
    await ScreenCapture.allowScreenCaptureAsync();
    isPreventingCapture = false;
    console.log("📷 Screen capture allowed");
  } catch (error) {
    console.error("Failed to allow screen capture:", error);
  }
}

export async function initializeScreenSecurity(): Promise<void> {
  const allowed = await getScreenshotAllowed();
  if (!allowed) {
    await preventScreenCapture();
  }
}

export function usePreventScreenCapture(shouldPrevent: boolean = true): void {}
