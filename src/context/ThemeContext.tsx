import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
// Import all the new fonts
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
  light: { name: "Light", bg: ["#f8f9fa", "#e9ecef"], card: "rgba(255,255,255,0.9)", cardBorder: "#dee2e6", text: "#212529", subtext: "#495057", muted: "#868e96", accent: "#4d7cff", accent2: "#4ade80", danger: "#e03131", fab: "#4d7cff" },
  dark: { name: "Dark", bg: ["#0b1020", "#0c1224"], card: "rgba(255,255,255,0.06)", cardBorder: "rgba(255,255,255,0.15)", text: "#e9ecef", subtext: "#b8c0cc", muted: "#8b94a5", accent: "#22d3ee", accent2: "#34d399", danger: "#ff6b6b", fab: "#7c3aed" },
  nord: { name: "Nord", bg: ["#2E3440", "#3B4252"], card: "rgba(76, 86, 106, 0.4)", cardBorder: "#4C566A", text: "#ECEFF4", subtext: "#D8DEE9", muted: "#A3B3C9", accent: "#88C0D0", accent2: "#A3BE8C", danger: "#BF616A", fab: "#5E81AC" },
  synthwave: { name: "Synthwave", bg: ["#2d2a5a", "#25214d"], card: "rgba(45, 42, 90, 0.8)", cardBorder: "#4f4a8b", text: "#f8f8f2", subtext: "#e0e0e0", muted: "#bd93f9", accent: "#ff79c6", accent2: "#50fa7b", danger: "#ff5555", fab: "#ff79c6" },
  cyberpunk: { name: "Cyberpunk", bg: ["#0c0c1e", "#2a0c3e"], card: "rgba(255, 225, 53, 0.08)", cardBorder: "rgba(255, 225, 53, 0.4)", text: "#f9f871", subtext: "#ffc700", muted: "#f400a1", accent: "#00f0ff", accent2: "#f400a1", danger: "#ff003c", fab: "#f400a1" },
  dracula: { name: "Dracula", bg: ["#282a36", "#20222c"], card: "rgba(68, 71, 90, 0.5)", cardBorder: "#44475a", text: "#f8f8f2", subtext: "#bd93f9", muted: "#6272a4", accent: "#ff79c6", accent2: "#50fa7b", danger: "#ff5555", fab: "#bd93f9" },
  "tokyo-night": { name: "Tokyo Night", bg: ["#1a1b26", "#161620"], card: "rgba(25, 26, 38, 0.8)", cardBorder: "#2a2d3e", text: "#a9b1d6", subtext: "#7aa2f7", muted: "#565f89", accent: "#bb9af7", accent2: "#9ece6a", danger: "#f7768e", fab: "#7aa2f7" },
  monokai: { name: "Monokai", bg: ["#272822", "#20211c"], card: "rgba(39, 40, 34, 0.8)", cardBorder: "#49483e", text: "#f8f8f2", subtext: "#a6e22e", muted: "#75715e", accent: "#f92672", accent2: "#66d9ef", danger: "#f92672", fab: "#a6e22e" },
  "night-owl": { name: "Night Owl", bg: ["#011627", "#01111d"], card: "rgba(1, 22, 39, 0.8)", cardBorder: "#012a47", text: "#d6deeb", subtext: "#82aaff", muted: "#5f7e97", accent: "#c792ea", accent2: "#addb67", danger: "#ef5350", fab: "#7fdbca" },
  kanagawa: { name: "Kanagawa", bg: ["#1f1f28", "#16161d"], card: "rgba(31, 31, 40, 0.8)", cardBorder: "#2d2d3a", text: "#dcd7ba", subtext: "#7e9cd8", muted: "#727169", accent: "#957FB8", accent2: "#76946A", danger: "#C34043", fab: "#7e9cd8" },
  vaporwave: { name: "Vaporwave", bg: ["#0d0221", "#0c0119"], card: "rgba(255, 105, 180, 0.1)", cardBorder: "#ff69b4", text: "#f0f0f0", subtext: "#00f0ff", muted: "#ff69b4", accent: "#ff69b4", accent2: "#f9f871", danger: "#ff003c", fab: "#00f0ff" },
  steampunk: { name: "Steampunk", bg: ["#4a442d", "#3d3721"], card: "rgba(139, 114, 71, 0.2)", cardBorder: "#8b7247", text: "#d5c4a1", subtext: "#b58900", muted: "#839496", accent: "#cb4b16", accent2: "#859900", danger: "#dc322f", fab: "#268bd2" },
  solarized: { name: "Solarized", bg: ["#002b36", "#001f27"], card: "rgba(7, 54, 66, 0.8)", cardBorder: "#073642", text: "#839496", subtext: "#93a1a1", muted: "#586e75", accent: "#268bd2", accent2: "#859900", danger: "#dc322f", fab: "#2aa198" },
  gruvbox: { name: "Gruvbox", bg: ["#282828", "#1d2021"], card: "rgba(50, 48, 47, 0.8)", cardBorder: "#504945", text: "#ebdbb2", subtext: "#d5c4a1", muted: "#928374", accent: "#fabd2f", accent2: "#b8bb26", danger: "#fb4934", fab: "#83a598" },
};
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
    SpaceGrotesk: { regular: "SpaceGrotesk_400Regular", bold: "SpaceGrotesk_700Bold", label: "Space Grotesk (Bauhaus)" },
};

type ThemeName = keyof typeof THEMES;
type FontName = keyof typeof FONTS;
type ThemeMode = ThemeName | "system";
const THEME_KEY = "@PM:themeV3";
const FONT_KEY = "@PM:fontV3";

const ThemeCtx = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");
  const [font, setFont] = useState<FontName>("Inter");

  // Load all fonts
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

  const fontsLoaded = interLoaded && lexendLoaded && openLoaded && monoLoaded && playfairLoaded && poppinsLoaded && latoLoaded && serifLoaded && plexLoaded && jetLoaded && spaceLoaded;

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(THEME_KEY), AsyncStorage.getItem(FONT_KEY)]).then(([t, f]) => {
      if (t && (t === "system" || Object.keys(THEMES).includes(t))) setMode(t as ThemeMode);
      if (f && Object.keys(FONTS).includes(f)) setFont(f as FontName);
    });
  }, []);

  const changeTheme = (newMode: ThemeMode) => { setMode(newMode); AsyncStorage.setItem(THEME_KEY, newMode); };
  const changeFont = (newFont: FontName) => { setFont(newFont); AsyncStorage.setItem(FONT_KEY, newFont); };

  const currentThemeName: ThemeName = mode === "system" ? (system || "light") : mode;
  const colors = THEMES[currentThemeName];
  const fontConfig = FONTS[font];

  const value = useMemo(() => ({ mode, font, changeTheme, changeFont, colors, fontConfig, THEMES, FONTS, fontsLoaded }), [mode, font, colors, fontConfig, fontsLoaded]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
