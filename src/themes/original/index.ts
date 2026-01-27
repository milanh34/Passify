// src/themes/original/index.ts

import { CompleteTheme } from "../types";

export const originalTheme: CompleteTheme = {
  name: "original",
  displayName: "Original",
  description: "The classic Passify experience",
  isDark: true,

  colors: {
    background: "#0b1020",
    backgroundSecondary: "#0c1224",
    backgroundTertiary: "#161b2c",

    surface: "#161b2c",
    surfaceElevated: "#1a2035",
    surfaceBorder: "rgba(255,255,255,0.15)",

    textPrimary: "#e9ecef",
    textSecondary: "#b8c0cc",
    textMuted: "#8b94a5",
    textInverse: "#0b1020",

    accent: "#22d3ee",
    accentSecondary: "#34d399",
    accentMuted: "rgba(34, 211, 238, 0.15)",

    success: "#34d399",
    warning: "#fbbf24",
    error: "#ff6b6b",
    info: "#22d3ee",

    buttonPrimary: "#22d3ee",
    buttonSecondary: "#161b2c",
    buttonDanger: "#ff6b6b",

    overlay: "rgba(0, 0, 0, 0.6)",
    overlayHeavy: "rgba(0, 0, 0, 0.85)",
  },

  typography: {
    fontRegular: "Inter_400Regular",
    fontBold: "Inter_700Bold",
    fontMono: "RobotoMono_400Regular",

    sizeXs: 10,
    sizeSm: 12,
    sizeMd: 14,
    sizeLg: 16,
    sizeXl: 18,
    sizeXxl: 24,
    sizeHero: 32,

    letterSpacingTight: -0.5,
    letterSpacingNormal: 0,
    letterSpacingWide: 0.5,

    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,

    weightLight: "300",
    weightNormal: "400",
    weightBold: "700",
  },

  spacing: {
    none: 0,
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,

    screenPadding: 18,
    cardPadding: 16,
    buttonPadding: 16,
    inputPadding: 14,
    listItemPadding: 16,
    modalPadding: 24,
    headerHeight: 60,
    tabBarHeight: 75,
  },

  shapes: {
    radiusNone: 0,
    radiusSm: 6,
    radiusMd: 10,
    radiusLg: 12,
    radiusXl: 16,
    radiusFull: 9999,

    cardRadius: 16,
    buttonRadius: 12,
    inputRadius: 12,
    modalRadius: 20,
    fabRadius: 28,
    chipRadius: 20,

    borderThin: 1,
    borderMedium: 1.5,
    borderThick: 2,

    cardStyle: "rounded",
    buttonStyle: "rounded",
  },

  shadows: {
    none: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  animations: {
    durationInstant: 100,
    durationFast: 200,
    durationNormal: 300,
    durationSlow: 400,
    durationSlowest: 600,

    easingStandard: "ease-in-out",
    easingAccelerate: "ease-in",
    easingDecelerate: "ease-out",

    springDefault: {
      damping: 15,
      stiffness: 150,
    },
    springBouncy: {
      damping: 10,
      stiffness: 180,
    },
    springStiff: {
      damping: 20,
      stiffness: 300,
    },

    cardExpand: {
      type: "timing",
      duration: 200,
    },
    modalEntry: {
      type: "timing",
      duration: 200,
      from: { opacity: 0, scale: 0.9 },
      to: { opacity: 1, scale: 1 },
    },
    buttonPress: {
      scale: 0.95,
      duration: 100,
    },
    pageTransition: {
      type: "timing",
      duration: 300,
      from: { opacity: 0, translateY: 50 },
      to: { opacity: 1, translateY: 0 },
    },
    listItemStagger: 50,
    fabPress: {
      scale: 0.9,
      duration: 100,
    },
  },

  components: {
    card: {
      background: "#161b2c",
      border: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      padding: 16,
      radius: 16,
      shadow: "none",
    },
    button: {
      height: 52,
      paddingHorizontal: 20,
      radius: 12,
      fontWeight: "700",
      fontSize: 16,
      letterSpacing: 0,
    },
    input: {
      height: 52,
      paddingHorizontal: 16,
      radius: 12,
      borderWidth: 1,
      fontSize: 15,
    },
    modal: {
      radius: 20,
      padding: 24,
      backdropOpacity: 0.6,
      maxWidth: 400,
    },
    fab: {
      size: 56,
      radius: 28,
      iconSize: 26,
    },
    header: {
      height: 60,
      titleSize: 18,
      backButtonSize: 44,
      backButtonRadius: 10,
    },
    tabBar: {
      height: 75,
      iconSize: 22,
      labelSize: 11,
      indicatorStyle: "none",
    },
    toast: {
      radius: 12,
      padding: 16,
      position: "bottom",
      offset: 30,
    },
    listItem: {
      minHeight: 56,
      padding: 16,
      separatorStyle: "space",
    },
  },
};
