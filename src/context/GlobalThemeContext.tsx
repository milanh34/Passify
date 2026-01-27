// src/context/GlobalThemeContext.tsx

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CompleteTheme, GlobalThemeName, GlobalThemeContextValue } from "../themes/types";
import { themes, getTheme, getThemeNames } from "../themes";
import { log } from "../utils/logger";

const GLOBAL_THEME_KEY = "@Passify:globalTheme";

const GlobalThemeContext = createContext<GlobalThemeContextValue | undefined>(undefined);

export function GlobalThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<GlobalThemeName>("original");
  const [isLoaded, setIsLoaded] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(GLOBAL_THEME_KEY);
      if (saved && saved in themes) {
        setCurrentTheme(saved as GlobalThemeName);
      }
    } catch (error) {
      log.error("Failed to load global theme:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setTheme = useCallback(async (themeName: GlobalThemeName) => {
    try {
      await AsyncStorage.setItem(GLOBAL_THEME_KEY, themeName);
      setCurrentTheme(themeName);
      setThemeVersion((v) => v + 1);
      log.info(`Global theme changed to: ${themeName}`);
    } catch (error) {
      log.error("Failed to save global theme:", error);
    }
  }, []);

  const theme = useMemo(() => {
    const baseTheme = getTheme(currentTheme);
    return {
      ...baseTheme,
      colors: { ...baseTheme.colors },
      typography: { ...baseTheme.typography },
      spacing: { ...baseTheme.spacing },
      shapes: { ...baseTheme.shapes },
      shadows: { ...baseTheme.shadows },
      animations: { ...baseTheme.animations },
      components: {
        ...baseTheme.components,
        card: { ...baseTheme.components.card },
        button: { ...baseTheme.components.button },
        input: { ...baseTheme.components.input },
        modal: { ...baseTheme.components.modal },
        fab: { ...baseTheme.components.fab },
        header: { ...baseTheme.components.header },
        tabBar: { ...baseTheme.components.tabBar },
        toast: { ...baseTheme.components.toast },
        listItem: { ...baseTheme.components.listItem },
      },
      _version: themeVersion,
    };
  }, [currentTheme, themeVersion]);

  const availableThemes = useMemo(() => getThemeNames(), []);

  const value: GlobalThemeContextValue = useMemo(
    () => ({
      currentTheme,
      theme,
      setTheme,
      availableThemes,
    }),
    [currentTheme, theme, setTheme, availableThemes]
  );

  if (!isLoaded) {
    return null;
  }

  return <GlobalThemeContext.Provider value={value}>{children}</GlobalThemeContext.Provider>;
}

export function useGlobalTheme(): GlobalThemeContextValue {
  const context = useContext(GlobalThemeContext);
  if (!context) {
    throw new Error("useGlobalTheme must be used within GlobalThemeProvider");
  }
  return context;
}

export { GlobalThemeContext };