import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

const THEMES = {
  light: { name: "Default Light", bg: "#f6f7fb", card: "#ffffff", cardBorder: "rgba(15,23,42,0.08)", text: "#0f172a", subtext: "#475569", active: "#4f46e5", danger: "#e11d48", fab: "#6366f1", headerBg: "#ffffff", barBg: "#ffffff", shadow: "#7c3aed" },
  dark: { name: "Default Dark", bg: "#0b1020", card: "rgba(255,255,255,0.06)", cardBorder: "rgba(255,255,255,0.1)", text: "#e6edff", subtext: "#adc6ff", active: "#22d3ee", danger: "#ff5d73", fab: "#7c3aed", headerBg: "#0b1020", barBg: "#0b1020", shadow: "#000" },
  nord: { name: "Nord", bg: "#2E3440", card: "#3B4252", cardBorder: "#4C566A", text: "#ECEFF4", subtext: "#D8DEE9", active: "#88C0D0", danger: "#BF616A", fab: "#5E81AC", headerBg: "#2E3440", barBg: "#3B4252", shadow: "#000" },
  cyberpunk: { name: "Cyberpunk", bg: "#0c0c1e", card: "rgba(255, 225, 53, 0.08)", cardBorder: "rgba(255, 225, 53, 0.3)", text: "#f9f871", subtext: "#ffc700", active: "#f400a1", danger: "#ff003c", fab: "#00f0ff", headerBg: "#0c0c1e", barBg: "#080814", shadow: "#000" },
  aqua: { name: "Aqua", bg: "#F0F8FF", card: "#E0FFFF", cardBorder: "#AFEEEE", text: "#008B8B", subtext: "#20B2AA", active: "#00CED1", danger: "#FF6347", fab: "#40E0D0", headerBg: "#F0F8FF", barBg: "#E0FFFF", shadow: "#00CED1" },
  retro: { name: "Retro", bg: "#fdf6e3", card: "#fbf1c7", cardBorder: "#d5c4a1", text: "#3c3836", subtext: "#504945", active: "#458588", danger: "#cc241d", fab: "#b16286", headerBg: "#fdf6e3", barBg: "#fbf1c7", shadow: "#b16286" },
  cheerful: { name: "Cheerful", bg: "#FFF5E1", card: "#FFFFFF", cardBorder: "#FFDDC1", text: "#FF6B6B", subtext: "#FFA07A", active: "#FFD700", danger: "#FF4500", fab: "#4682B4", headerBg: "#FFF5E1", barBg: "#FFFFFF", shadow: "#FF6B6B" },
  colorful: { name: "Colorful", bg: "#1A1A2E", card: "#16213E", cardBorder: "#0F3460", text: "#E94560", subtext: "#FFFFFF", active: "#533483", danger: "#E94560", fab: "#E94560", headerBg: "#1A1A2E", barBg: "#16213E", shadow: "#000" },
};

type ThemeName = keyof typeof THEMES;
type ThemeMode = ThemeName | "system";
const THEME_KEY = "@PM:themeV2";
const ThemeCtx = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v && (v === "system" || Object.keys(THEMES).includes(v))) setMode(v as ThemeMode);
    });
  }, []);

  const changeTheme = (m: ThemeMode) => {
    setMode(m);
    AsyncStorage.setItem(THEME_KEY, m);
  };

  const currentThemeName: ThemeName = mode === "system" ? (system || "light") : mode;
  const colors = THEMES[currentThemeName];

  const value = useMemo(() => ({ mode, changeTheme, colors, THEMES }), [mode, colors]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
