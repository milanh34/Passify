// src/themes/hooks/useThemedStyles.ts

import { useMemo } from "react";
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { useGlobalTheme } from "../../context/GlobalThemeContext";
import { CompleteTheme } from "../types";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };
type StyleFactory<T> = (theme: CompleteTheme) => T;

export function useThemedStyles<T extends NamedStyles<T>>(factory: StyleFactory<T>): T {
  const { theme } = useGlobalTheme();

  return useMemo(() => {
    const styles = factory(theme);
    return StyleSheet.create(styles) as T;
  }, [theme, factory]);
}

export function createThemedStyles<T extends NamedStyles<T>>(factory: StyleFactory<T>): () => T {
  return () => useThemedStyles(factory);
}
