// src/themes/minimalDark/index.ts

import { CompleteTheme } from "../types";

export const minimalDarkTheme: CompleteTheme = {
  name: "minimalDark",
  displayName: "Minimal Dark",
  description: "Clean monochrome dark elegance",
  isDark: true,

  colors: {
    background: "#121212",
    backgroundSecondary: "#1A1A1A",
    backgroundTertiary: "#222222",

    surface: "#1E1E1E",
    surfaceElevated: "#262626",
    surfaceBorder: "#333333",

    textPrimary: "#FAFAFA",
    textSecondary: "#B3B3B3",
    textMuted: "#737373",
    textInverse: "#121212",

    accent: "#FAFAFA",
    accentSecondary: "#E0E0E0",
    accentMuted: "rgba(250, 250, 250, 0.1)",

    success: "#4ADE80",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",

    buttonPrimary: "#FAFAFA",
    buttonSecondary: "#262626",
    buttonDanger: "#F87171",

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
    sizeXl: 20,
    sizeXxl: 28,
    sizeHero: 36,

    letterSpacingTight: -0.2,
    letterSpacingNormal: 0,
    letterSpacingWide: 0.3,

    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.7,

    weightLight: "300",
    weightNormal: "400",
    weightBold: "700",
  },

  spacing: {
    none: 0,
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,

    screenPadding: 20,
    cardPadding: 20,
    buttonPadding: 16,
    inputPadding: 16,
    listItemPadding: 16,
    modalPadding: 28,
    headerHeight: 64,
    tabBarHeight: 72,
  },

  shapes: {
    radiusNone: 0,
    radiusSm: 4,
    radiusMd: 8,
    radiusLg: 12,
    radiusXl: 16,
    radiusFull: 9999,

    cardRadius: 12,
    buttonRadius: 8,
    inputRadius: 8,
    modalRadius: 16,
    fabRadius: 16,
    chipRadius: 6,

    borderThin: 1,
    borderMedium: 1,
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
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 28,
      elevation: 14,
    },
  },

  animations: {
    durationInstant: 50,
    durationFast: 150,
    durationNormal: 250,
    durationSlow: 350,
    durationSlowest: 500,

    easingStandard: "ease-out",
    easingAccelerate: "ease-in",
    easingDecelerate: "ease-out",

    springDefault: { damping: 20, stiffness: 300 },
    springBouncy: { damping: 15, stiffness: 250 },
    springStiff: { damping: 25, stiffness: 400 },

    cardExpand: { type: "timing", duration: 200 },
    modalEntry: {
      type: "timing",
      duration: 200,
      from: { opacity: 0, scale: 0.95 },
      to: { opacity: 1, scale: 1 },
    },
    buttonPress: { scale: 0.98, duration: 100 },
    pageTransition: {
      type: "timing",
      duration: 200,
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    listItemStagger: 30,
    fabPress: { scale: 0.95, duration: 100 },
  },

  components: {
    card: {
      background: "#1E1E1E",
      border: "#333333",
      borderWidth: 1,
      padding: 20,
      radius: 12,
      shadow: "sm",
    },
    button: {
      height: 52,
      paddingHorizontal: 24,
      radius: 8,
      fontWeight: "600",
      fontSize: 14,
      letterSpacing: 0,
    },
    input: {
      height: 54,
      paddingHorizontal: 16,
      radius: 8,
      borderWidth: 1,
      fontSize: 14,
    },
    modal: {
      radius: 16,
      padding: 28,
      backdropOpacity: 0.6,
      maxWidth: 400,
    },
    fab: {
      size: 56,
      radius: 16,
      iconSize: 24,
    },
    header: {
      height: 64,
      titleSize: 18,
      backButtonSize: 46,
      backButtonRadius: 10,
    },
    tabBar: {
      height: 72,
      iconSize: 22,
      labelSize: 11,
      indicatorStyle: "none",
    },
    toast: {
      radius: 8,
      padding: 16,
      position: "bottom",
      offset: 32,
    },
    listItem: {
      minHeight: 56,
      padding: 16,
      separatorStyle: "line",
    },
  },
};
