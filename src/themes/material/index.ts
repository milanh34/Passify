// src/themes/material/index.ts

import { CompleteTheme } from "../types";

export const materialTheme: CompleteTheme = {
  name: "material",
  displayName: "Material",
  description: "Google Material Design 3 inspired",
  isDark: false,

  colors: {
    background: "#FEF7FF",
    backgroundSecondary: "#F3EDF7",
    backgroundTertiary: "#E8DEF8",

    surface: "#FFFFFF",
    surfaceElevated: "#F7F2FA",
    surfaceBorder: "#CAC4D0",

    textPrimary: "#1D1B20",
    textSecondary: "#49454F",
    textMuted: "#79747E",
    textInverse: "#FFFFFF",

    accent: "#6750A4",
    accentSecondary: "#625B71",
    accentMuted: "rgba(103, 80, 164, 0.12)",

    success: "#386A20",
    warning: "#7D5700",
    error: "#B3261E",
    info: "#0061A4",

    buttonPrimary: "#6750A4",
    buttonSecondary: "#E8DEF8",
    buttonDanger: "#B3261E",

    overlay: "rgba(0, 0, 0, 0.32)",
    overlayHeavy: "rgba(0, 0, 0, 0.6)",
  },

  typography: {
    fontRegular: "OpenSans_400Regular",
    fontBold: "OpenSans_700Bold",
    fontMono: "RobotoMono_400Regular",

    sizeXs: 11,
    sizeSm: 12,
    sizeMd: 14,
    sizeLg: 16,
    sizeXl: 22,
    sizeXxl: 28,
    sizeHero: 36,

    letterSpacingTight: 0,
    letterSpacingNormal: 0.15,
    letterSpacingWide: 0.5,

    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,

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
    xxl: 40,
    xxxl: 48,

    screenPadding: 16,
    cardPadding: 16,
    buttonPadding: 24,
    inputPadding: 16,
    listItemPadding: 16,
    modalPadding: 24,
    headerHeight: 64,
    tabBarHeight: 80,
  },

  shapes: {
    radiusNone: 0,
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 28,
    radiusFull: 9999,

    cardRadius: 12,
    buttonRadius: 20,
    inputRadius: 12,
    modalRadius: 28,
    fabRadius: 16,
    chipRadius: 8,

    borderThin: 1,
    borderMedium: 1,
    borderThick: 2,

    cardStyle: "rounded",
    buttonStyle: "pill",
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
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 10,
      elevation: 6,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  animations: {
    durationInstant: 50,
    durationFast: 150,
    durationNormal: 250,
    durationSlow: 350,
    durationSlowest: 500,

    easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
    easingAccelerate: "cubic-bezier(0.3, 0, 0.8, 0.15)",
    easingDecelerate: "cubic-bezier(0.05, 0.7, 0.1, 1)",

    springDefault: {
      damping: 20,
      stiffness: 300,
      mass: 1,
    },
    springBouncy: {
      damping: 12,
      stiffness: 200,
      mass: 0.8,
    },
    springStiff: {
      damping: 25,
      stiffness: 400,
      mass: 1,
    },

    cardExpand: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
    modalEntry: {
      type: "spring",
      damping: 25,
      stiffness: 350,
      from: { opacity: 0, translateY: 100, scale: 0.95 },
      to: { opacity: 1, translateY: 0, scale: 1 },
    },
    buttonPress: {
      scale: 0.98,
      duration: 50,
    },
    pageTransition: {
      type: "spring",
      damping: 22,
      stiffness: 280,
      from: { opacity: 0, translateX: 100 },
      to: { opacity: 1, translateX: 0 },
    },
    listItemStagger: 35,
    fabPress: {
      scale: 0.92,
      duration: 100,
    },
  },

  components: {
    card: {
      background: "#FFFFFF",
      border: "#CAC4D0",
      borderWidth: 0,
      padding: 16,
      radius: 12,
      shadow: "sm",
    },
    button: {
      height: 52,
      paddingHorizontal: 24,
      radius: 20,
      fontWeight: "600",
      fontSize: 14,
      letterSpacing: 0.1,
    },
    input: {
      height: 56,
      paddingHorizontal: 16,
      radius: 12,
      borderWidth: 1,
      fontSize: 16,
    },
    modal: {
      radius: 28,
      padding: 24,
      backdropOpacity: 0.32,
      maxWidth: 560,
    },
    fab: {
      size: 56,
      radius: 16,
      iconSize: 24,
    },
    header: {
      height: 64,
      titleSize: 22,
      backButtonSize: 48,
      backButtonRadius: 12,
    },
    tabBar: {
      height: 80,
      iconSize: 24,
      labelSize: 12,
      indicatorStyle: "background",
    },
    toast: {
      radius: 4,
      padding: 14,
      position: "bottom",
      offset: 24,
    },
    listItem: {
      minHeight: 56,
      padding: 16,
      separatorStyle: "line",
    },
  },
};
