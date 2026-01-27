// src/themes/valorant/index.ts

import { CompleteTheme } from "../types";

export const valorantTheme: CompleteTheme = {
  name: "valorant",
  displayName: "Valorant",
  description: "Tactical, sharp, competitive",
  isDark: true,

  colors: {
    background: "#0F1923",
    backgroundSecondary: "#1A242D",
    backgroundTertiary: "#252F38",

    surface: "#1A242D",
    surfaceElevated: "#252F38",
    surfaceBorder: "#FF4655",

    textPrimary: "#ECE8E1",
    textSecondary: "#A8A097",
    textMuted: "#768079",
    textInverse: "#0F1923",

    accent: "#FF4655",
    accentSecondary: "#BD3944",
    accentMuted: "rgba(255, 70, 85, 0.2)",

    success: "#52FFB8",
    warning: "#FFC857",
    error: "#FF4655",
    info: "#00C8FF",

    buttonPrimary: "#FF4655",
    buttonSecondary: "#252F38",
    buttonDanger: "#FF4655",

    overlay: "rgba(15, 25, 35, 0.9)",
    overlayHeavy: "rgba(15, 25, 35, 0.95)",
  },

  typography: {
    fontRegular: "SpaceGrotesk_400Regular",
    fontBold: "SpaceGrotesk_700Bold",
    fontMono: "JetBrainsMono_400Regular",

    sizeXs: 10,
    sizeSm: 11,
    sizeMd: 13,
    sizeLg: 15,
    sizeXl: 18,
    sizeXxl: 24,
    sizeHero: 36,

    letterSpacingTight: 0,
    letterSpacingNormal: 0.5,
    letterSpacingWide: 2,

    lineHeightTight: 1.1,
    lineHeightNormal: 1.4,
    lineHeightRelaxed: 1.6,

    weightLight: "400",
    weightNormal: "500",
    weightBold: "700",
  },

  spacing: {
    none: 0,
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,

    screenPadding: 16,
    cardPadding: 12,
    buttonPadding: 16,
    inputPadding: 12,
    listItemPadding: 12,
    modalPadding: 20,
    headerHeight: 64,
    tabBarHeight: 64,
  },

  shapes: {
    radiusNone: 0,
    radiusSm: 0,
    radiusMd: 0,
    radiusLg: 0,
    radiusXl: 0,
    radiusFull: 0,

    cardRadius: 0,
    buttonRadius: 0,
    inputRadius: 0,
    modalRadius: 0,
    fabRadius: 0,
    chipRadius: 0,

    borderThin: 1,
    borderMedium: 2,
    borderThick: 3,

    cardStyle: "sharp",
    buttonStyle: "sharp",
  },

  shadows: {
    none: {
      shadowColor: "#FF4655",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#FF4655",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 0,
      elevation: 2,
    },
    md: {
      shadowColor: "#FF4655",
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 0,
      elevation: 4,
    },
    lg: {
      shadowColor: "#FF4655",
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 0,
      elevation: 6,
    },
    xl: {
      shadowColor: "#FF4655",
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 0,
      elevation: 8,
    },
  },

  animations: {
    durationInstant: 50,
    durationFast: 100,
    durationNormal: 150,
    durationSlow: 200,
    durationSlowest: 300,

    easingStandard: "linear",
    easingAccelerate: "ease-in",
    easingDecelerate: "ease-out",

    springDefault: {
      damping: 30,
      stiffness: 500,
    },
    springBouncy: {
      damping: 25,
      stiffness: 450,
    },
    springStiff: {
      damping: 35,
      stiffness: 600,
    },

    cardExpand: {
      type: "timing",
      duration: 100,
    },
    modalEntry: {
      type: "timing",
      duration: 100,
      from: { opacity: 0, translateY: -20, scale: 1.02 },
      to: { opacity: 1, translateY: 0, scale: 1 },
    },
    buttonPress: {
      scale: 1.02,
      duration: 50,
    },
    pageTransition: {
      type: "timing",
      duration: 100,
      from: { opacity: 0, translateX: -30 },
      to: { opacity: 1, translateX: 0 },
    },
    listItemStagger: 25,
    fabPress: {
      scale: 1.05,
      duration: 50,
    },
  },

  components: {
    card: {
      background: "#1A242D",
      border: "#FF4655",
      borderWidth: 1,
      padding: 12,
      radius: 0,
      shadow: "sm",
    },
    button: {
      height: 52,
      paddingHorizontal: 20,
      radius: 0,
      fontWeight: "700",
      fontSize: 13,
      letterSpacing: 2,
    },
    input: {
      height: 54,
      paddingHorizontal: 12,
      radius: 0,
      borderWidth: 2,
      fontSize: 14,
    },
    modal: {
      radius: 0,
      padding: 20,
      backdropOpacity: 0.9,
      maxWidth: 380,
    },
    fab: {
      size: 52,
      radius: 0,
      iconSize: 24,
    },
    header: {
      height: 64,
      titleSize: 16,
      backButtonSize: 46,
      backButtonRadius: 0,
    },
    tabBar: {
      height: 64,
      iconSize: 20,
      labelSize: 10,
      indicatorStyle: "underline",
    },
    toast: {
      radius: 0,
      padding: 12,
      position: "top",
      offset: 20,
    },
    listItem: {
      minHeight: 48,
      padding: 12,
      separatorStyle: "line",
    },
  },
};
