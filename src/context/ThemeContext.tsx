import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type Mode = "light" | "dark" | "system";

const THEME_KEY = "@PM:theme";

const ThemeCtx = createContext<{
  theme: Mode;
  setTheme: (m: Exclude<Mode, "system">) => void;
  useSystem: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [theme, setThemeState] = useState<Mode>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") setThemeState(v);
    });
  }, []);

  const setTheme = (m: Exclude<Mode, "system">) => {
    setThemeState(m);
    AsyncStorage.setItem(THEME_KEY, m);
  };
  const useSystem = () => {
    setThemeState("system");
    AsyncStorage.setItem(THEME_KEY, "system");
  };

  const value = useMemo(() => ({ theme, setTheme, useSystem }), [theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function useThemeColors() {
  const { theme } = useTheme();
  const system = useColorScheme();
  const mode = theme === "system" ? system : theme;

  // Vibrant modern palette
  const base =
    mode === "dark"
      ? {
          bg: "#0b1020",
          card: "rgba(255,255,255,0.06)",
          cardBorder: "rgba(255,255,255,0.1)",
          text: "#e6edff",
          subtext: "#adc6ff",
          muted: "#8aa1c1",
          active: "#22d3ee",
          danger: "#ff5d73",
          fab: "#7c3aed",
          fabSecondary: "#06b6d4",
          barBg: "#0b1020",
          headerBg: "#0b1020",
          headerText: "#e6edff",
          border: "rgba(255,255,255,0.1)",
          shadow: "#000",
          inactive: "#7a8aa6",
        }
      : {
          bg: "#f6f7fb",
          card: "#ffffff",
          cardBorder: "rgba(15,23,42,0.08)",
          text: "#0f172a",
          subtext: "#475569",
          muted: "#64748b",
          active: "#4f46e5",
          danger: "#e11d48",
          fab: "#6366f1",
          fabSecondary: "#06b6d4",
          barBg: "#ffffff",
          headerBg: "#ffffff",
          headerText: "#0f172a",
          border: "rgba(15,23,42,0.08)",
          shadow: "#7c3aed",
          inactive: "#94a3b8",
        };

  return base;
}
