// src/themes/index.ts

import { CompleteTheme, GlobalThemeName } from "./types";
import { originalTheme } from "./original";
import { materialTheme } from "./material";
import { sharpTheme } from "./sharp";
import { minimalTheme } from "./minimal";
import { minimalDarkTheme } from "./minimalDark";
import { retroTheme } from "./retro";
import { duskTheme } from "./dusk";
import { oceanTheme } from "./ocean";

export * from "./types";
export { originalTheme } from "./original";
export { materialTheme } from "./material";
export { sharpTheme } from "./sharp";
export { minimalTheme } from "./minimal";
export { minimalDarkTheme } from "./minimalDark";
export { retroTheme } from "./retro";
export { duskTheme } from "./dusk";
export { oceanTheme } from "./ocean";

export { useAppTheme } from "./hooks/useAppTheme";
export type { AppThemeValues } from "./hooks/useAppTheme";

export const themes: Record<GlobalThemeName, CompleteTheme> = {
  original: originalTheme,
  material: materialTheme,
  sharp: sharpTheme,
  minimal: minimalTheme,
  minimalDark: minimalDarkTheme,
  retro: retroTheme,
  dusk: duskTheme,
  ocean: oceanTheme,
};

export const themeList: { id: GlobalThemeName; theme: CompleteTheme }[] = [
  { id: "original", theme: originalTheme },
  { id: "material", theme: materialTheme },
  { id: "sharp", theme: sharpTheme },
  { id: "minimal", theme: minimalTheme },
  { id: "minimalDark", theme: minimalDarkTheme },
  { id: "retro", theme: retroTheme },
  { id: "dusk", theme: duskTheme },
  { id: "ocean", theme: oceanTheme },
];

export function getTheme(name: GlobalThemeName): CompleteTheme {
  return themes[name] || originalTheme;
}

export function getThemeNames(): GlobalThemeName[] {
  return Object.keys(themes) as GlobalThemeName[];
}

export function isValidTheme(name: string): name is GlobalThemeName {
  return name in themes;
}
