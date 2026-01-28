// src/themes/retro/index.ts

import { CompleteTheme } from "../types";

export const retroTheme: CompleteTheme = {
  name: "retro",
  displayName: "Retro",
  description: "Vintage computing nostalgia",
  isDark: true,

  colors: {
    background: "#1A1410",
    backgroundSecondary: "#231C16",
    backgroundTertiary: "#2D251D",

    surface: "#2A221A",
    surfaceElevated: "#352B22",
    surfaceBorder: "#5C4A38",

    textPrimary: "#FFB000",
    textSecondary: "#CC8C00",
    textMuted: "#8B6914",
    textInverse: "#1A1410",

    accent: "#FFB000",
    accentSecondary: "#FF6B00",
    accentMuted: "rgba(255, 176, 0, 0.2)",

    success: "#33FF00",
    warning: "#FFB000",
    error: "#FF3300",
    info: "#00BFFF",

    buttonPrimary: "#FFB000",
    buttonSecondary: "#352B22",
    buttonDanger: "#FF3300",

    overlay: "rgba(26, 20, 16, 0.85)",
    overlayHeavy: "rgba(26, 20, 16, 0.95)",
  },

  typography: {
    fontRegular: "JetBrainsMono_400Regular",
    fontBold: "JetBrainsMono_700Bold",
    fontMono: "JetBrainsMono_400Regular",

    sizeXs: 10,
    sizeSm: 12,
    sizeMd: 14,
    sizeLg: 16,
    sizeXl: 18,
    sizeXxl: 24,
    sizeHero: 32,

    letterSpacingTight: 0,
    letterSpacingNormal: 0.5,
    letterSpacingWide: 1,

    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.7,

    weightLight: "400",
    weightNormal: "400",
    weightBold: "700",
  },

  spacing: {
    none: 0,
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
    xxxl: 48,

    screenPadding: 16,
    cardPadding: 16,
    buttonPadding: 18,
    inputPadding: 14,
    listItemPadding: 14,
    modalPadding: 24,
    headerHeight: 64,
    tabBarHeight: 86,
  },

  shapes: {
    radiusNone: 0,
    radiusSm: 2,
    radiusMd: 4,
    radiusLg: 6,
    radiusXl: 8,
    radiusFull: 9999,

    cardRadius: 4,
    buttonRadius: 4,
    inputRadius: 4,
    modalRadius: 6,
    fabRadius: 4,
    chipRadius: 2,

    borderThin: 1,
    borderMedium: 2,
    borderThick: 3,

    cardStyle: "sharp",
    buttonStyle: "sharp",
  },

  shadows: {
    none: {
      shadowColor: "#FFB000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#FFB000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#FFB000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#FFB000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: "#FFB000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  animations: {
    durationInstant: 50,
    durationFast: 100,
    durationNormal: 180,
    durationSlow: 260,
    durationSlowest: 400,

    easingStandard: "linear",
    easingAccelerate: "ease-in",
    easingDecelerate: "ease-out",

    springDefault: {
      damping: 25,
      stiffness: 350,
    },
    springBouncy: {
      damping: 18,
      stiffness: 280,
    },
    springStiff: {
      damping: 30,
      stiffness: 450,
    },

    cardExpand: {
      type: "timing",
      duration: 150,
    },
    modalEntry: {
      type: "timing",
      duration: 150,
      from: { opacity: 0, scale: 0.98 },
      to: { opacity: 1, scale: 1 },
    },
    buttonPress: {
      scale: 0.96,
      duration: 80,
    },
    pageTransition: {
      type: "timing",
      duration: 180,
      from: { opacity: 0, translateY: 20 },
      to: { opacity: 1, translateY: 0 },
    },
    listItemStagger: 40,
    fabPress: {
      scale: 0.92,
      duration: 80,
    },
  },

  components: {
    card: {
      background: "#2A221A",
      border: "#5C4A38",
      borderWidth: 2,
      padding: 16,
      radius: 4,
      shadow: "sm",
    },
    button: {
      height: 52,
      paddingHorizontal: 22,
      radius: 4,
      fontWeight: "700",
      fontSize: 14,
      letterSpacing: 0.5,
    },
    input: {
      height: 54,
      paddingHorizontal: 14,
      radius: 4,
      borderWidth: 2,
      fontSize: 14,
    },
    modal: {
      radius: 6,
      padding: 24,
      backdropOpacity: 0.85,
      maxWidth: 400,
    },
    fab: {
      size: 56,
      radius: 4,
      iconSize: 26,
    },
    header: {
      height: 64,
      titleSize: 18,
      backButtonSize: 46,
      backButtonRadius: 4,
    },
    tabBar: {
      height: 86,
      iconSize: 22,
      labelSize: 11,
      indicatorStyle: "underline",
    },
    toast: {
      radius: 4,
      padding: 14,
      position: "bottom",
      offset: 100,
    },
    listItem: {
      minHeight: 54,
      padding: 14,
      separatorStyle: "line",
    },
  },
};
