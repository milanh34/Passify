import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { useFonts as useInter, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { useFonts as useLexend, Lexend_400Regular, Lexend_700Bold } from "@expo-google-fonts/lexend";
import { useFonts as useOpenSans, OpenSans_400Regular, OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import { useFonts as useRobotoMono, RobotoMono_400Regular, RobotoMono_700Bold } from "@expo-google-fonts/roboto-mono";
import { useFonts as usePlayfair, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { useFonts as usePoppins, Poppins_400Regular, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { useFonts as useLato, Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { useFonts as useSourceSerif, SourceSerif4_400Regular, SourceSerif4_700Bold } from "@expo-google-fonts/source-serif-4";
import { useFonts as useIbmPlex, IBMPlexSans_400Regular, IBMPlexSans_700Bold } from "@expo-google-fonts/ibm-plex-sans";
import { useFonts as useJetBrains, JetBrainsMono_400Regular, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { useFonts as useSpaceGrotesk, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";

const THEMES = {
  light: { name: "Default Light", bg: ["#f8f9fa", "#e9ecef"], card: "rgba(255,255,255,0.9)", cardBorder: "#dee2e6", text: "#212529", subtext: "#495057", muted: "#868e96", accent: "#4d7cff", accent2: "#4ade80", danger: "#e03131", info: "#0ea5e9", warn: "#f59e0b", fab: "#4d7cff", shadow: "#4d7cff" },
  dark: { name: "Default Dark", bg: ["#0b1020", "#0c1224"], card: "rgba(255,255,255,0.06)", cardBorder: "rgba(255,255,255,0.15)", text: "#e9ecef", subtext: "#b8c0cc", muted: "#8b94a5", accent: "#22d3ee", accent2: "#34d399", danger: "#ff6b6b", info: "#38bdf8", warn: "#fbbf24", fab: "#7c3aed", shadow: "#000" },
  nord: { name: "Nord", bg: ["#2E3440", "#3B4252"], card: "rgba(76, 86, 106, 0.4)", cardBorder: "#4C566A", text: "#ECEFF4", subtext: "#D8DEE9", muted: "#A3B3C9", accent: "#88C0D0", accent2: "#A3BE8C", danger: "#BF616A", info: "#81A1C1", warn: "#EBCB8B", fab: "#5E81AC", shadow: "#000" },
  cyberpunk: { name: "Cyberpunk", bg: ["#0c0c1e", "#2a0c3e"], card: "rgba(255, 225, 53, 0.08)", cardBorder: "rgba(255, 225, 53, 0.4)", text: "#f9f871", subtext: "#ffd34d", muted: "#f400a1", accent: "#00f0ff", accent2: "#f400a1", danger: "#ff003c", info: "#00f0ff", warn: "#ff9f1c", fab: "#f400a1", shadow: "#000" },
  aqua: { name: "Aqua", bg: ["#e0f7fa", "#b2ebf2"], card: "rgba(255,255,255,0.8)", cardBorder: "#80deea", text: "#004d56", subtext: "#006f7a", muted: "#4dd0e1", accent: "#00bcd4", accent2: "#14b8a6", danger: "#ef5350", info: "#06b6d4", warn: "#fb923c", fab: "#00acc1", shadow: "#00bcd4" },
  retro: { name: "Retro", bg: ["#fdf6e3", "#f2e5bc"], card: "rgba(251, 241, 199, 0.85)", cardBorder: "#d5c4a1", text: "#3c3836", subtext: "#504945", muted: "#665c54", accent: "#458588", accent2: "#98971a", danger: "#cc241d", info: "#076678", warn: "#d79921", fab: "#b16286", shadow: "#b16286" },
  forest: { name: "Forest", bg: ["#2d3a32", "#1e2a22"], card: "rgba(202, 210, 197, 0.12)", cardBorder: "#cAD2c5", text: "#e9f5db", subtext: "#cAD2c5", muted: "#84a98c", accent: "#52796f", accent2: "#84cc16", danger: "#d00000", info: "#22c55e", warn: "#fde047", fab: "#2f4f4f", shadow: "#000" },
  "rose-gold": { name: "Rose Gold", bg: ["#f7d7d3", "#f5c4bf"], card: "rgba(255,255,255,0.75)", cardBorder: "#e4b2ab", text: "#7d4f50", subtext: "#a37b73", muted: "#bfa09a", accent: "#d4a39d", accent2: "#ec4899", danger: "#c05a5a", info: "#a78bfa", warn: "#f59e0b", fab: "#c08484", shadow: "#d4a39d" },
  cheerful: { name: "Cheerful", bg: ["#FFF5E1", "#FFE6B3"], card: "rgba(255,255,255,0.9)", cardBorder: "#FFDDC1", text: "#FF6B6B", subtext: "#FF8C69", muted: "#FFA07A", accent: "#FFD700", accent2: "#6EE7B7", danger: "#FF4500", info: "#60A5FA", warn: "#F59E0B", fab: "#4682B4", shadow: "#FF6B6B" },
  colorful: { name: "Colorful", bg: ["#1A1A2E", "#16213E"], card: "rgba(22,33,62,0.7)", cardBorder: "#0F3460", text: "#E94560", subtext: "#C3DAFE", muted: "#9CA3AF", accent: "#533483", accent2: "#10B981", danger: "#F87171", info: "#60A5FA", warn: "#F59E0B", fab: "#E94560", shadow: "#000" },
} as const;

const FONTS = {
  Inter: { regular: "Inter_400Regular", bold: "Inter_700Bold", label: "Inter" },
  Lexend: { regular: "Lexend_400Regular", bold: "Lexend_700Bold", label: "Lexend" },
  OpenSans: { regular: "OpenSans_400Regular", bold: "OpenSans_700Bold", label: "Open Sans" },
  RobotoMono: { regular: "RobotoMono_400Regular", bold: "RobotoMono_700Bold", label: "Roboto Mono" },
  Playfair: { regular: "PlayfairDisplay_400Regular", bold: "PlayfairDisplay_700Bold", label: "Playfair Display" },
  Poppins: { regular: "Poppins_400Regular", bold: "Poppins_700Bold", label: "Poppins" },
  Lato: { regular: "Lato_400Regular", bold: "Lato_700Bold", label: "Lato" },
  SourceSerif4: { regular: "SourceSerif4_400Regular", bold: "SourceSerif4_700Bold", label: "Source Serif 4" },
  IBMPlexSans: { regular: "IBMPlexSans_400Regular", bold: "IBMPlexSans_700Bold", label: "IBM Plex Sans" },
  JetBrainsMono: { regular: "JetBrainsMono_400Regular", bold: "JetBrainsMono_700Bold", label: "JetBrains Mono" },
  SpaceGrotesk: { regular: "SpaceGrotesk_400Regular", bold: "SpaceGrotesk_700Bold", label: "Space Grotesk" },
} as const;

type ThemeName = keyof typeof THEMES;
type FontName = keyof typeof FONTS;
type ThemeMode = ThemeName | "system";
const THEME_KEY = "@PM:themeV2";
const FONT_KEY = "@PM:fontV2";

const ThemeCtx = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");
  const [font, setFont] = useState<FontName>("Inter");

  const [interLoaded] = useInter({ Inter_400Regular, Inter_700Bold });
  const [lexendLoaded] = useLexend({ Lexend_400Regular, Lexend_700Bold });
  const [openLoaded] = useOpenSans({ OpenSans_400Regular, OpenSans_700Bold });
  const [monoLoaded] = useRobotoMono({ RobotoMono_400Regular, RobotoMono_700Bold });
  const [playfairLoaded] = usePlayfair({ PlayfairDisplay_400Regular, PlayfairDisplay_700Bold });
  const [poppinsLoaded] = usePoppins({ Poppins_400Regular, Poppins_700Bold });
  const [latoLoaded] = useLato({ Lato_400Regular, Lato_700Bold });
  const [serifLoaded] = useSourceSerif({ SourceSerif4_400Regular, SourceSerif4_700Bold });
  const [plexLoaded] = useIbmPlex({ IBMPlexSans_400Regular, IBMPlexSans_700Bold });
  const [jetLoaded] = useJetBrains({ JetBrainsMono_400Regular, JetBrainsMono_700Bold });
  const [spaceLoaded] = useSpaceGrotesk({ SpaceGrotesk_400Regular, SpaceGrotesk_700Bold });

  const fontsLoaded =
    interLoaded &&
    lexendLoaded &&
    openLoaded &&
    monoLoaded &&
    playfairLoaded &&
    poppinsLoaded &&
    latoLoaded &&
    serifLoaded &&
    plexLoaded &&
    jetLoaded &&
    spaceLoaded;

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(THEME_KEY), AsyncStorage.getItem(FONT_KEY)]).then(
      ([t, f]) => {
        if (t && (t === "system" || Object.keys(THEMES).includes(t))) setMode(t as ThemeMode);
        if (f && Object.keys(FONTS).includes(f)) setFont(f as FontName);
      }
    );
  }, []);

  const changeTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem(THEME_KEY, newMode);
  };
  const changeFont = (newFont: FontName) => {
    setFont(newFont);
    AsyncStorage.setItem(FONT_KEY, newFont);
  };

  const currentThemeName: ThemeName = mode === "system" ? (system || "light") : mode;
  const colors = THEMES[currentThemeName];
  const fontConfig = FONTS[font];

  const value = useMemo(
    () => ({ mode, font, changeTheme, changeFont, colors, fontConfig, THEMES, FONTS, fontsLoaded }),
    [mode, font, colors, fontConfig, fontsLoaded]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
