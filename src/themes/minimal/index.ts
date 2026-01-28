// src/themes/minimal/index.ts

import { CompleteTheme } from "../types";

export const minimalTheme: CompleteTheme = {
  name: "minimal",
  displayName: "Minimal",
  description: "Clean monochrome elegance",
  isDark: false,

  colors: {
    background: "#FAFAFA",
    backgroundSecondary: "#F5F5F5",
    backgroundTertiary: "#EEEEEE",

    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    surfaceBorder: "#E0E0E0",

    textPrimary: "#212121",
    textSecondary: "#616161",
    textMuted: "#9E9E9E",
    textInverse: "#FFFFFF",

    accent: "#212121",
    accentSecondary: "#424242",
    accentMuted: "rgba(33, 33, 33, 0.08)",

    success: "#2E7D32",
    warning: "#F57C00",
    error: "#C62828",
    info: "#1565C0",

    buttonPrimary: "#212121",
    buttonSecondary: "#F5F5F5",
    buttonDanger: "#C62828",

    overlay: "rgba(0, 0, 0, 0.5)",
    overlayHeavy: "rgba(0, 0, 0, 0.7)",
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
    tabBarHeight: 86,
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
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
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
      background: "#FFFFFF",
      border: "#E0E0E0",
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
      backdropOpacity: 0.5,
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
      height: 86,
      iconSize: 22,
      labelSize: 11,
      indicatorStyle: "none",
    },
    toast: {
      radius: 8,
      padding: 16,
      position: "bottom",
      offset: 100,
    },
    listItem: {
      minHeight: 56,
      padding: 16,
      separatorStyle: "line",
    },
  },
};
