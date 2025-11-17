// src/context/ThemeContext.tsx

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


type ThemeColors = {
  name: string;
  bg: [string, string];
  card: string;
  cardBorder: string;
  text: string;
  subtext: string;
  muted: string;
  accent: string;
  accent2: string;
  danger: string;
  fab: string;
  modalCard: string;
  modalText: string;
  modalSubtext: string;
  modalBackdrop: string;
  modalBorder: string;
  isDark: boolean;
};


const THEMES: Record<string, ThemeColors> = {
  light: {
    name: "Light",
    bg: ["#f8f9fa", "#e9ecef"],
    card: "#ffffff",
    cardBorder: "#dee2e6",
    text: "#212529",
    subtext: "#495057",
    muted: "#868e96",
    accent: "#4d7cff",
    accent2: "#4ade80",
    danger: "#e03131",
    fab: "#4d7cff",
    modalCard: "#ffffff",
    modalText: "#212529",
    modalSubtext: "#495057",
    modalBackdrop: "rgba(0,0,0,0.75)",
    modalBorder: "#dee2e6",
    isDark: false,
  },
  dark: {
    name: "Dark",
    bg: ["#0b1020", "#0c1224"],
    card: "#161b2c",
    cardBorder: "rgba(255,255,255,0.15)",
    text: "#e9ecef",
    subtext: "#b8c0cc",
    muted: "#8b94a5",
    accent: "#22d3ee",
    accent2: "#34d399",
    danger: "#ff6b6b",
    fab: "#7c3aed",
    modalCard: "#111827",
    modalText: "#e9ecef",
    modalSubtext: "#b8c0cc",
    modalBackdrop: "rgba(0,0,0,0.75)",
    modalBorder: "rgba(255,255,255,0.18)",
    isDark: true,
  },
  nord: {
    name: "Nord",
    bg: ["#2E3440", "#3B4252"],
    card: "#3B4252",
    cardBorder: "#4C566A",
    text: "#ECEFF4",
    subtext: "#D8DEE9",
    muted: "#A3B3C9",
    accent: "#88C0D0",
    accent2: "#A3BE8C",
    danger: "#BF616A",
    fab: "#5E81AC",
    modalCard: "#2E3440",
    modalText: "#ECEFF4",
    modalSubtext: "#D8DEE9",
    modalBackdrop: "rgba(0,0,0,0.75)",
    modalBorder: "#4C566A",
    isDark: true,
  },
  dracula: {
    name: "Dracula",
    bg: ["#282a36", "#20222c"],
    card: "#44475a",
    cardBorder: "#6272a4",
    text: "#f8f8f2",
    subtext: "#bd93f9",
    muted: "#6272a4",
    accent: "#ff79c6",
    accent2: "#50fa7b",
    danger: "#ff5555",
    fab: "#bd93f9",
    modalCard: "#343746",
    modalText: "#f8f8f2",
    modalSubtext: "#bd93f9",
    modalBackdrop: "rgba(0,0,0,0.75)",
    modalBorder: "#6272a4",
    isDark: true,
  },
  gruvbox: {
    name: "Gruvbox",
    bg: ["#282828", "#1d2021"],
    card: "#3c3836",
    cardBorder: "#504945",
    text: "#ebdbb2",
    subtext: "#d5c4a1",
    muted: "#928374",
    accent: "#fabd2f",
    accent2: "#b8bb26",
    danger: "#fb4934",
    fab: "#83a598",
    modalCard: "#32302f",
    modalText: "#ebdbb2",
    modalSubtext: "#d5c4a1",
    modalBackdrop: "rgba(0,0,0,0.75)",
    modalBorder: "#504945",
    isDark: true,
  },
  cyberpunk: {
    name: "Cyberpunk",
    bg: ["#0c0c1e", "#2a0c3e"],
    card: "#151129",
    cardBorder: "#ffe13566",
    text: "#f9f871",
    subtext: "#ffc700",
    muted: "#f400a1",
    accent: "#00f0ff",
    accent2: "#f400a1",
    danger: "#ff003c",
    fab: "#f400a1",
    modalCard: "#131026",
    modalText: "#f9f871",
    modalSubtext: "#ffc700",
    modalBackdrop: "rgba(0,0,0,0.78)",
    modalBorder: "#ffe13566",
    isDark: true,
  },
  monokai: {
    name: "Monokai",
    bg: ["#272822", "#20211c"],
    card: "#2f302a",
    cardBorder: "#49483e",
    text: "#f8f8f2",
    subtext: "#a6e22e",
    muted: "#75715e",
    accent: "#f92672",
    accent2: "#66d9ef",
    danger: "#f92672",
    fab: "#a6e22e",
    modalCard: "#2b2c26",
    modalText: "#f8f8f2",
    modalSubtext: "#a6e22e",
    modalBackdrop: "rgba(0,0,0,0.78)",
    modalBorder: "#49483e",
    isDark: true,
  },
  "tokyo-night": {
    name: "Tokyo Night",
    bg: ["#1a1b26", "#161620"],
    card: "#151621",
    cardBorder: "#2a2d3e",
    text: "#a9b1d6",
    subtext: "#7aa2f7",
    muted: "#565f89",
    accent: "#bb9af7",
    accent2: "#9ece6a",
    danger: "#f7768e",
    fab: "#7aa2f7",
    modalCard: "#131420",
    modalText: "#a9b1d6",
    modalSubtext: "#7aa2f7",
    modalBackdrop: "rgba(0,0,0,0.78)",
    modalBorder: "#2a2d3e",
    isDark: true,
  },
  "night-owl": {
    name: "Night Owl",
    bg: ["#011627", "#01111d"],
    card: "#071c2b",
    cardBorder: "#012a47",
    text: "#d6deeb",
    subtext: "#82aaff",
    muted: "#5f7e97",
    accent: "#c792ea",
    accent2: "#addb67",
    danger: "#ef5350",
    fab: "#7fdbca",
    modalCard: "#051724",
    modalText: "#d6deeb",
    modalSubtext: "#82aaff",
    modalBackdrop: "rgba(0,0,0,0.78)",
    modalBorder: "#012a47",
    isDark: true,
  },
  vaporwave: {
    name: "Vaporwave",
    bg: ["#0d0221", "#0c0119"],
    card: "#160235",
    cardBorder: "#ff69b4",
    text: "#f0f0f0",
    subtext: "#00f0ff",
    muted: "#ff69b4",
    accent: "#ff69b4",
    accent2: "#f9f871",
    danger: "#ff003c",
    fab: "#00f0ff",
    modalCard: "#12012d",
    modalText: "#f0f0f0",
    modalSubtext: "#00f0ff",
    modalBackdrop: "rgba(0,0,0,0.78)",
    modalBorder: "#ff69b4",
    isDark: true,
  },
  solarized: {
    name: "Solarized",
    bg: ["#002b36", "#001f27"],
    card: "#073642",
    cardBorder: "#073642",
    text: "#839496",
    subtext: "#93a1a1",
    muted: "#586e75",
    accent: "#268bd2",
    accent2: "#859900",
    danger: "#dc322f",
    fab: "#2aa198",
    modalCard: "#002b36",
    modalText: "#93a1a1",
    modalSubtext: "#839496",
    modalBackdrop: "rgba(0,0,0,0.78)",
    modalBorder: "#0b3943",
    isDark: true,
  }, pastel: {
    name: "Pastel",
    bg: ["#fef3f8", "#fce8f3"],
    card: "#ffffff",
    cardBorder: "#f8d4e8",
    text: "#5a2a47",
    subtext: "#8d5a7a",
    muted: "#b38aa3",
    accent: "#d946a6",
    accent2: "#ec4899",
    danger: "#dc2626",
    fab: "#d946a6",
    modalCard: "#ffffff",
    modalText: "#5a2a47",
    modalSubtext: "#8d5a7a",
    modalBackdrop: "rgba(0,0,0,0.7)",
    modalBorder: "#f8d4e8",
    isDark: false,
  },
  mint: {
    name: "Mint",
    bg: ["#f0fdf4", "#dcfce7"],
    card: "#ffffff",
    cardBorder: "#bbf7d0",
    text: "#14532d",
    subtext: "#166534",
    muted: "#22c55e",
    accent: "#10b981",
    accent2: "#34d399",
    danger: "#dc2626",
    fab: "#10b981",
    modalCard: "#ffffff",
    modalText: "#14532d",
    modalSubtext: "#166534",
    modalBackdrop: "rgba(0,0,0,0.7)",
    modalBorder: "#bbf7d0",
    isDark: false,
  },
  lavender: {
    name: "Lavender",
    bg: ["#faf5ff", "#f3e8ff"],
    card: "#ffffff",
    cardBorder: "#e9d5ff",
    text: "#581c87",
    subtext: "#7c3aed",
    muted: "#a78bfa",
    accent: "#8b5cf6",
    accent2: "#a855f7",
    danger: "#dc2626",
    fab: "#8b5cf6",
    modalCard: "#ffffff",
    modalText: "#581c87",
    modalSubtext: "#7c3aed",
    modalBackdrop: "rgba(0,0,0,0.7)",
    modalBorder: "#e9d5ff",
    isDark: false,
  },
  peach: {
    name: "Peach",
    bg: ["#fff7ed", "#ffedd5"],
    card: "#ffffff",
    cardBorder: "#fed7aa",
    text: "#7c2d12",
    subtext: "#c2410c",
    muted: "#f97316",
    accent: "#fb923c",
    accent2: "#fdba74",
    danger: "#dc2626",
    fab: "#fb923c",
    modalCard: "#ffffff",
    modalText: "#7c2d12",
    modalSubtext: "#c2410c",
    modalBackdrop: "rgba(0,0,0,0.7)",
    modalBorder: "#fed7aa",
    isDark: false,
  },
  sky: {
    name: "Sky",
    bg: ["#f0f9ff", "#e0f2fe"],
    card: "#ffffff",
    cardBorder: "#bae6fd",
    text: "#0c4a6e",
    subtext: "#0369a1",
    muted: "#0ea5e9",
    accent: "#0284c7",
    accent2: "#38bdf8",
    danger: "#dc2626",
    fab: "#0284c7",
    modalCard: "#ffffff",
    modalText: "#0c4a6e",
    modalSubtext: "#0369a1",
    modalBackdrop: "rgba(0,0,0,0.7)",
    modalBorder: "#bae6fd",
    isDark: false,
  },
};


const FONTS = {
  Inter: { label: "Inter", regular: "Inter_400Regular", bold: "Inter_700Bold" },
  Lexend: { label: "Lexend", regular: "Lexend_400Regular", bold: "Lexend_700Bold" },
  OpenSans: { label: "Open Sans", regular: "OpenSans_400Regular", bold: "OpenSans_700Bold" },
  RobotoMono: { label: "Roboto Mono", regular: "RobotoMono_400Regular", bold: "RobotoMono_700Bold" },
  Playfair: { label: "Playfair Display", regular: "PlayfairDisplay_400Regular", bold: "PlayfairDisplay_700Bold" },
  Poppins: { label: "Poppins", regular: "Poppins_400Regular", bold: "Poppins_700Bold" },
  Lato: { label: "Lato", regular: "Lato_400Regular", bold: "Lato_700Bold" },
  SourceSerif4: { label: "Source Serif 4", regular: "SourceSerif4_400Regular", bold: "SourceSerif4_700Bold" },
  IBMPlexSans: { label: "IBM Plex Sans", regular: "IBMPlexSans_400Regular", bold: "IBMPlexSans_700Bold" },
  JetBrainsMono: { label: "JetBrains Mono", regular: "JetBrainsMono_400Regular", bold: "JetBrainsMono_700Bold" },
  SpaceGrotesk: { label: "Space Grotesk", regular: "SpaceGrotesk_400Regular", bold: "SpaceGrotesk_700Bold" },
};


type ThemeName = keyof typeof THEMES;
type FontName = keyof typeof FONTS;
type ThemeMode = ThemeName | "system";


const THEME_KEY = "@PM:themeV3";
const FONT_KEY = "@PM:fontV3";


type ThemeContextValue = {
  mode: ThemeMode;
  font: FontName;
  changeTheme: (t: ThemeMode) => void;
  changeFont: (f: FontName) => void;
  colors: ThemeColors;
  THEMES: typeof THEMES;
  FONTS: typeof FONTS;
  fontConfig: { regular: string; bold: string };
  fontsLoaded: boolean;
};


const ThemeCtx = createContext<ThemeContextValue | null>(null);


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


  const currentThemeName: ThemeName =
    mode === "system" ? ((system || "light") as ThemeName) : (mode as ThemeName);
  const colors = THEMES[currentThemeName];
  const fontConfig = FONTS[font];


  const value = useMemo(
    () => ({
      mode,
      font,
      changeTheme,
      changeFont,
      colors,
      THEMES,
      FONTS,
      fontConfig,
      fontsLoaded,
    }),
    [mode, font, colors, fontConfig, fontsLoaded]
  );


  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}


export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
