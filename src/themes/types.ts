// src/themes/types.ts

export type GlobalThemeName =
  | "original"
  | "material"
  | "sharp"
  | "minimal"
  | "minimalDark"
  | "retro"
  | "dusk"
  | "ocean";

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  surface: string;
  surfaceElevated: string;
  surfaceBorder: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  accent: string;
  accentSecondary: string;
  accentMuted: string;

  success: string;
  warning: string;
  error: string;
  info: string;

  buttonPrimary: string;
  buttonSecondary: string;
  buttonDanger: string;

  overlay: string;
  overlayHeavy: string;
}

export interface ThemeTypography {
  fontRegular: string;
  fontBold: string;
  fontMono?: string;

  sizeXs: number;
  sizeSm: number;
  sizeMd: number;
  sizeLg: number;
  sizeXl: number;
  sizeXxl: number;
  sizeHero: number;

  letterSpacingTight: number;
  letterSpacingNormal: number;
  letterSpacingWide: number;

  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;

  weightLight: string;
  weightNormal: string;
  weightBold: string;
}

export interface ThemeSpacing {
  none: number;
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;

  screenPadding: number;
  cardPadding: number;
  buttonPadding: number;
  inputPadding: number;
  listItemPadding: number;
  modalPadding: number;
  headerHeight: number;
  tabBarHeight: number;
}

export interface ThemeShapes {
  radiusNone: number;
  radiusSm: number;
  radiusMd: number;
  radiusLg: number;
  radiusXl: number;
  radiusFull: number;

  cardRadius: number;
  buttonRadius: number;
  inputRadius: number;
  modalRadius: number;
  fabRadius: number;
  chipRadius: number;

  borderThin: number;
  borderMedium: number;
  borderThick: number;

  cardStyle: "rounded" | "sharp" | "cut" | "mixed";
  buttonStyle: "rounded" | "sharp" | "pill" | "cut";
}

export interface ThemeShadows {
  none: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  xl: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass?: number;
}

export interface AnimationConfig {
  type: "timing" | "spring";
  duration?: number;
  damping?: number;
  stiffness?: number;
}

export interface ThemeAnimations {
  durationInstant: number;
  durationFast: number;
  durationNormal: number;
  durationSlow: number;
  durationSlowest: number;

  easingStandard: string;
  easingAccelerate: string;
  easingDecelerate: string;

  springDefault: SpringConfig;
  springBouncy: SpringConfig;
  springStiff: SpringConfig;

  cardExpand: AnimationConfig;
  modalEntry: AnimationConfig & { from: object; to: object };
  buttonPress: { scale: number; duration: number };
  pageTransition: AnimationConfig & { from: object; to: object };
  listItemStagger: number;
  fabPress: { scale: number; duration: number };
}

export interface ThemeComponents {
  card: {
    background: string;
    border: string;
    borderWidth: number;
    padding: number;
    radius: number;
    shadow: keyof ThemeShadows;
  };

  button: {
    height: number;
    paddingHorizontal: number;
    radius: number;
    fontWeight: string;
    fontSize: number;
    letterSpacing: number;
  };

  input: {
    height: number;
    paddingHorizontal: number;
    radius: number;
    borderWidth: number;
    fontSize: number;
  };

  modal: {
    radius: number;
    padding: number;
    backdropOpacity: number;
    maxWidth: number;
  };

  fab: {
    size: number;
    radius: number;
    iconSize: number;
  };

  header: {
    height: number;
    titleSize: number;
    backButtonSize: number;
    backButtonRadius: number;
  };

  tabBar: {
    height: number;
    iconSize: number;
    labelSize: number;
    indicatorStyle: "underline" | "background" | "dot" | "none";
  };

  toast: {
    radius: number;
    padding: number;
    position: "top" | "bottom";
    offset: number;
  };

  listItem: {
    minHeight: number;
    padding: number;
    separatorStyle: "line" | "space" | "none";
  };
}

export interface CompleteTheme {
  name: GlobalThemeName;
  displayName: string;
  description: string;
  isDark: boolean;

  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shapes: ThemeShapes;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
  components: ThemeComponents;
}

export interface GlobalThemeContextValue {
  currentTheme: GlobalThemeName;
  theme: CompleteTheme;
  setTheme: (theme: GlobalThemeName) => void;
  availableThemes: GlobalThemeName[];
}
