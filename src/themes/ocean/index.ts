// src/themes/ocean/index.ts

import { CompleteTheme } from "../types";

export const oceanTheme: CompleteTheme = {
  name: "ocean",
  displayName: "Ocean",
  description: "Deep navy with coral and teal",
  isDark: true,

  colors: {
    background: "#003D5B",
    backgroundSecondary: "#004A6E",
    backgroundTertiary: "#005780",

    surface: "#004A6E",
    surfaceElevated: "#005780",
    surfaceBorder: "#007090",

    textPrimary: "#FFFFFF",
    textSecondary: "#C8E0EC",
    textMuted: "#88B0C8",
    textInverse: "#003D5B",

    accent: "#D1485B",
    accentSecondary: "#00A0B0",
    accentMuted: "rgba(209, 72, 91, 0.2)",

    success: "#00A0B0",
    warning: "#D1485B",
    error: "#FF6B7A",
    info: "#00C4D4",

    buttonPrimary: "#D1485B",
    buttonSecondary: "#005780",
    buttonDanger: "#FF6B7A",

    overlay: "rgba(0, 61, 91, 0.85)",
    overlayHeavy: "rgba(0, 61, 91, 0.95)",
  },

  typography: {
    fontRegular: "Lexend_400Regular",
    fontBold: "Lexend_700Bold",
    fontMono: "RobotoMono_400Regular",

    sizeXs: 10,
    sizeSm: 12,
    sizeMd: 14,
    sizeLg: 16,
    sizeXl: 20,
    sizeXxl: 28,
    sizeHero: 36,

    letterSpacingTight: -0.2,
    letterSpacingNormal: 0.1,
    letterSpacingWide: 0.5,

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
    xxl: 44,
    xxxl: 58,

    screenPadding: 18,
    cardPadding: 18,
    buttonPadding: 24,
    inputPadding: 18,
    listItemPadding: 18,
    modalPadding: 26,
    headerHeight: 66,
    tabBarHeight: 78,
  },

  shapes: {
    radiusNone: 0,
    radiusSm: 10,
    radiusMd: 14,
    radiusLg: 20,
    radiusXl: 26,
    radiusFull: 9999,

    cardRadius: 18,
    buttonRadius: 14,
    inputRadius: 12,
    modalRadius: 24,
    fabRadius: 18,
    chipRadius: 12,

    borderThin: 1,
    borderMedium: 2,
    borderThick: 3,

    cardStyle: "rounded",
    buttonStyle: "rounded",
  },

  shadows: {
    none: {
      shadowColor: "#00798C",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
    md: {
      shadowColor: "#D1485B",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 14,
      elevation: 8,
    },
    lg: {
      shadowColor: "#D1485B",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 22,
      elevation: 14,
    },
    xl: {
      shadowColor: "#00A0B0",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 32,
      elevation: 20,
    },
  },

  animations: {
    durationInstant: 50,
    durationFast: 170,
    durationNormal: 290,
    durationSlow: 400,
    durationSlowest: 540,

    easingStandard: "cubic-bezier(0.4, 0, 0.2, 1)",
    easingAccelerate: "cubic-bezier(0.4, 0, 1, 1)",
    easingDecelerate: "cubic-bezier(0, 0, 0.2, 1)",

    springDefault: {
      damping: 20,
      stiffness: 260,
    },
    springBouncy: {
      damping: 14,
      stiffness: 200,
    },
    springStiff: {
      damping: 26,
      stiffness: 360,
    },

    cardExpand: {
      type: "spring",
      damping: 22,
      stiffness: 280,
    },
    modalEntry: {
      type: "spring",
      damping: 24,
      stiffness: 300,
      from: { opacity: 0, translateY: 55, scale: 0.94 },
      to: { opacity: 1, translateY: 0, scale: 1 },
    },
    buttonPress: {
      scale: 0.95,
      duration: 100,
    },
    pageTransition: {
      type: "spring",
      damping: 24,
      stiffness: 280,
      from: { opacity: 0, scale: 0.96 },
      to: { opacity: 1, scale: 1 },
    },
    listItemStagger: 50,
    fabPress: {
      scale: 0.9,
      duration: 110,
    },
  },

  components: {
    card: {
      background: "#004A6E",
      border: "#007090",
      borderWidth: 1,
      padding: 18,
      radius: 18,
      shadow: "md",
    },
    button: {
      height: 56,
      paddingHorizontal: 28,
      radius: 14,
      fontWeight: "700",
      fontSize: 15,
      letterSpacing: 0.3,
    },
    input: {
      height: 58,
      paddingHorizontal: 20,
      radius: 12,
      borderWidth: 2,
      fontSize: 15,
    },
    modal: {
      radius: 24,
      padding: 26,
      backdropOpacity: 0.85,
      maxWidth: 430,
    },
    fab: {
      size: 62,
      radius: 18,
      iconSize: 28,
    },
    header: {
      height: 66,
      titleSize: 19,
      backButtonSize: 48,
      backButtonRadius: 14,
    },
    tabBar: {
      height: 78,
      iconSize: 24,
      labelSize: 11,
      indicatorStyle: "dot",
    },
    toast: {
      radius: 14,
      padding: 16,
      position: "bottom",
      offset: 34,
    },
    listItem: {
      minHeight: 62,
      padding: 20,
      separatorStyle: "space",
    },
  },
};
