// src/themes/hooks/useAppTheme.ts

import { useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useGlobalTheme } from "../../context/GlobalThemeContext";

export interface AppThemeValues {
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
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
  };

  typography: {
    fontRegular: string;
    fontBold: string;
    sizeXs: number;
    sizeSm: number;
    sizeMd: number;
    sizeLg: number;
    sizeXl: number;
    sizeXxl: number;
    sizeHero: number;
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    screenPadding: number;
    cardPadding: number;
  };

  shapes: {
    radiusSm: number;
    radiusMd: number;
    radiusLg: number;
    radiusXl: number;
    cardRadius: number;
    buttonRadius: number;
    inputRadius: number;
    modalRadius: number;
    borderThin: number;
    borderThick: number;
  };

  components: {
    card: { radius: number; padding: number };
    button: { height: number; radius: number; fontSize: number };
    input: { height: number; radius: number; fontSize: number };
    modal: { radius: number; padding: number };
    header: { height: number; titleSize: number; backButtonSize: number; backButtonRadius: number };
    tabBar: { height: number; iconSize: number; labelSize: number };
    fab: { size: number; radius: number; iconSize: number };
    toast: { radius: number; padding: number; position: "top" | "bottom"; offset: number };
  };

  animations: {
    durationFast: number;
    durationNormal: number;
    durationSlow: number;
    springDamping: number;
    springStiffness: number;
    listItemStagger: number;
    buttonPressScale: number;
    fabPressScale: number;
  };

  shadows: {
    sm: object;
    md: object;
    lg: object;
  };

  isOriginalTheme: boolean;
  globalThemeName: string;
  isDark: boolean;
}

export function useAppTheme(): AppThemeValues {
  const themeContext = useTheme();
  const globalThemeContext = useGlobalTheme();

  const { colors: legacyColors, fontConfig, mode } = themeContext;
  const { currentTheme, theme: globalTheme } = globalThemeContext;

  const themeKey = `${currentTheme}-${mode}-${legacyColors.name}-${(globalTheme as any)._version || 0}`;

  return useMemo(() => {
    const isOriginal = currentTheme === "original";

    if (isOriginal) {
      return {
        colors: {
          background: legacyColors.bg[0],
          backgroundSecondary: legacyColors.bg[1] || legacyColors.bg[0],
          surface: legacyColors.card,
          surfaceBorder: legacyColors.cardBorder,
          textPrimary: legacyColors.text,
          textSecondary: legacyColors.subtext,
          textMuted: legacyColors.muted,
          textInverse: legacyColors.isDark ? "#000000" : "#ffffff",
          accent: legacyColors.accent,
          accentSecondary: legacyColors.accent2,
          accentMuted: legacyColors.accent + "15",
          success: legacyColors.accent2,
          warning: "#fbbf24",
          error: legacyColors.danger,
          info: legacyColors.accent,
          buttonPrimary: legacyColors.accent,
          buttonSecondary: legacyColors.card,
          buttonDanger: legacyColors.danger,
          overlay: legacyColors.modalBackdrop,
        },
        typography: {
          fontRegular: fontConfig.regular,
          fontBold: fontConfig.bold,
          sizeXs: 10,
          sizeSm: 12,
          sizeMd: 14,
          sizeLg: 16,
          sizeXl: 18,
          sizeXxl: 24,
          sizeHero: 32,
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          screenPadding: 18,
          cardPadding: 16,
        },
        shapes: {
          radiusSm: 6,
          radiusMd: 10,
          radiusLg: 12,
          radiusXl: 16,
          cardRadius: 16,
          buttonRadius: 12,
          inputRadius: 12,
          modalRadius: 20,
          borderThin: 1,
          borderThick: 2,
        },
        components: {
          card: { radius: 16, padding: 16 },
          button: { height: 52, radius: 12, fontSize: 16 },
          input: { height: 52, radius: 12, fontSize: 15 },
          modal: { radius: 20, padding: 24 },
          header: { height: 60, titleSize: 18, backButtonSize: 40, backButtonRadius: 10 },
          tabBar: { height: 75, iconSize: 22, labelSize: 11 },
          fab: { size: 56, radius: 28, iconSize: 26 },
          toast: { radius: 12, padding: 16, position: "bottom", offset: 30 },
        },
        animations: {
          durationFast: 200,
          durationNormal: 300,
          durationSlow: 400,
          springDamping: 15,
          springStiffness: 150,
          listItemStagger: 50,
          buttonPressScale: 0.95,
          fabPressScale: 0.9,
        },
        shadows: {
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
        },
        isOriginalTheme: true,
        globalThemeName: "original",
        isDark: legacyColors.isDark,
      };
    }

    const gt = globalTheme;
    return {
      colors: {
        background: gt.colors.background,
        backgroundSecondary: gt.colors.backgroundSecondary,
        surface: gt.colors.surface,
        surfaceBorder: gt.colors.surfaceBorder,
        textPrimary: gt.colors.textPrimary,
        textSecondary: gt.colors.textSecondary,
        textMuted: gt.colors.textMuted,
        textInverse: gt.colors.textInverse,
        accent: gt.colors.accent,
        accentSecondary: gt.colors.accentSecondary,
        accentMuted: gt.colors.accentMuted,
        success: gt.colors.success,
        warning: gt.colors.warning,
        error: gt.colors.error,
        info: gt.colors.info,
        buttonPrimary: gt.colors.buttonPrimary,
        buttonSecondary: gt.colors.buttonSecondary,
        buttonDanger: gt.colors.buttonDanger,
        overlay: gt.colors.overlay,
      },
      typography: {
        fontRegular: gt.typography.fontRegular,
        fontBold: gt.typography.fontBold,
        sizeXs: gt.typography.sizeXs,
        sizeSm: gt.typography.sizeSm,
        sizeMd: gt.typography.sizeMd,
        sizeLg: gt.typography.sizeLg,
        sizeXl: gt.typography.sizeXl,
        sizeXxl: gt.typography.sizeXxl,
        sizeHero: gt.typography.sizeHero,
      },
      spacing: {
        xs: gt.spacing.xs,
        sm: gt.spacing.sm,
        md: gt.spacing.md,
        lg: gt.spacing.lg,
        xl: gt.spacing.xl,
        xxl: gt.spacing.xxl,
        screenPadding: gt.spacing.screenPadding,
        cardPadding: gt.spacing.cardPadding,
      },
      shapes: {
        radiusSm: gt.shapes.radiusSm,
        radiusMd: gt.shapes.radiusMd,
        radiusLg: gt.shapes.radiusLg,
        radiusXl: gt.shapes.radiusXl,
        cardRadius: gt.shapes.cardRadius,
        buttonRadius: gt.shapes.buttonRadius,
        inputRadius: gt.shapes.inputRadius,
        modalRadius: gt.shapes.modalRadius,
        borderThin: gt.shapes.borderThin,
        borderThick: gt.shapes.borderThick,
      },
      components: {
        card: { radius: gt.components.card.radius, padding: gt.components.card.padding },
        button: {
          height: gt.components.button.height,
          radius: gt.components.button.radius,
          fontSize: gt.components.button.fontSize,
        },
        input: {
          height: gt.components.input.height,
          radius: gt.components.input.radius,
          fontSize: gt.components.input.fontSize,
        },
        modal: { radius: gt.components.modal.radius, padding: gt.components.modal.padding },
        header: {
          height: gt.components.header.height,
          titleSize: gt.components.header.titleSize,
          backButtonSize: gt.components.header.backButtonSize,
          backButtonRadius: gt.components.header.backButtonRadius,
        },
        tabBar: {
          height: gt.components.tabBar.height,
          iconSize: gt.components.tabBar.iconSize,
          labelSize: gt.components.tabBar.labelSize,
        },
        fab: {
          size: gt.components.fab.size,
          radius: gt.components.fab.radius,
          iconSize: gt.components.fab.iconSize,
        },
        toast: {
          radius: gt.components.toast.radius,
          padding: gt.components.toast.padding,
          position: gt.components.toast.position,
          offset: gt.components.toast.offset,
        },
      },
      animations: {
        durationFast: gt.animations.durationFast,
        durationNormal: gt.animations.durationNormal,
        durationSlow: gt.animations.durationSlow,
        springDamping: gt.animations.springDefault.damping,
        springStiffness: gt.animations.springDefault.stiffness,
        listItemStagger: gt.animations.listItemStagger,
        buttonPressScale: gt.animations.buttonPress.scale,
        fabPressScale: gt.animations.fabPress.scale,
      },
      shadows: {
        sm: gt.shadows.sm,
        md: gt.shadows.md,
        lg: gt.shadows.lg,
      },
      isOriginalTheme: false,
      globalThemeName: currentTheme,
      isDark: gt.isDark,
    };
  }, [themeKey, currentTheme, globalTheme, legacyColors, fontConfig, mode]);
}
