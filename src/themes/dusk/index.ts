// src/themes/dusk/index.ts

import { CompleteTheme } from "../types";

export const duskTheme: CompleteTheme = {
  name: "dusk",
  displayName: "Dusk",
  description: "Warm purple twilight ambiance",
  isDark: true,

  colors: {
    background: "#312C51",
    backgroundSecondary: "#3A3560",
    backgroundTertiary: "#48426D",

    surface: "#48426D",
    surfaceElevated: "#544D7A",
    surfaceBorder: "#5F5888",

    textPrimary: "#F0C38E",
    textSecondary: "#E8B87A",
    textMuted: "#9A8BB0",
    textInverse: "#312C51",

    accent: "#F0C38E",
    accentSecondary: "#F1AA9B",
    accentMuted: "rgba(240, 195, 142, 0.2)",

    success: "#7ED7A0",
    warning: "#F0C38E",
    error: "#F1AA9B",
    info: "#9AC1D9",

    buttonPrimary: "#F0C38E",
    buttonSecondary: "#48426D",
    buttonDanger: "#F1AA9B",

    overlay: "rgba(49, 44, 81, 0.85)",
    overlayHeavy: "rgba(49, 44, 81, 0.95)",
  },

  typography: {
    fontRegular: "Poppins_400Regular",
    fontBold: "Poppins_700Bold",
    fontMono: "RobotoMono_400Regular",

    sizeXs: 11,
    sizeSm: 12,
    sizeMd: 14,
    sizeLg: 16,
    sizeXl: 20,
    sizeXxl: 26,
    sizeHero: 34,

    letterSpacingTight: -0.2,
    letterSpacingNormal: 0,
    letterSpacingWide: 0.3,

    lineHeightTight: 1.3,
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
    xxl: 40,
    xxxl: 48,

    screenPadding: 16,
    cardPadding: 16,
    buttonPadding: 24,
    inputPadding: 16,
    listItemPadding: 16,
    modalPadding: 24,
    headerHeight: 64,
    tabBarHeight: 86,
  },

  shapes: {
    radiusNone: 0,
    radiusSm: 10,
    radiusMd: 15,
    radiusLg: 18,
    radiusXl: 28,
    radiusFull: 9999,

    cardRadius: 16,
    buttonRadius: 12,
    inputRadius: 12,
    modalRadius: 20,
    fabRadius: 16,
    chipRadius: 8,

    borderThin: 1,
    borderMedium: 2,
    borderThick: 2,

    cardStyle: "rounded",
    buttonStyle: "rounded",
  },

  shadows: {
    none: {
      shadowColor: "#F0C38E",
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
      shadowColor: "#F0C38E",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: "#F0C38E",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  animations: {
    durationInstant: 50,
    durationFast: 150,
    durationNormal: 250,
    durationSlow: 350,
    durationSlowest: 500,

    easingStandard: "cubic-bezier(0.4, 0, 0.2, 1)",
    easingAccelerate: "cubic-bezier(0.4, 0, 1, 1)",
    easingDecelerate: "cubic-bezier(0, 0, 0.2, 1)",

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
      from: { opacity: 0, translateY: 50, scale: 0.95 },
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
      from: { opacity: 0, translateY: 30 },
      to: { opacity: 1, translateY: 0 },
    },
    listItemStagger: 35,
    fabPress: {
      scale: 0.92,
      duration: 100,
    },
  },

  components: {
    card: {
      background: "#48426D",
      border: "#5F5888",
      borderWidth: 1,
      padding: 16,
      radius: 28,
      shadow: "sm",
    },
    button: {
      height: 52,
      paddingHorizontal: 24,
      radius: 28,
      fontWeight: "600",
      fontSize: 14,
      letterSpacing: 0.1,
    },
    input: {
      height: 52,
      paddingHorizontal: 16,
      radius: 32,
      borderWidth: 1,
      fontSize: 15,
    },
    modal: {
      radius: 20,
      padding: 24,
      backdropOpacity: 0.85,
      maxWidth: 420,
    },
    fab: {
      size: 56,
      radius: 16,
      iconSize: 24,
    },
    header: {
      height: 60,
      titleSize: 18,
      backButtonSize: 44,
      backButtonRadius: 10,
    },
    tabBar: {
      height: 86,
      iconSize: 22,
      labelSize: 11,
      indicatorStyle: "background",
    },
    toast: {
      radius: 12,
      padding: 14,
      position: "bottom",
      offset: 100,
    },
    listItem: {
      minHeight: 56,
      padding: 16,
      separatorStyle: "space",
    },
  },
};
