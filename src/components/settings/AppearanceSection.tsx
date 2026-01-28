// src/components/settings/AppearanceSection.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";
import { useGlobalTheme } from "../../context/GlobalThemeContext";
import { useAnimation } from "../../context/AnimationContext";
import { themeList } from "../../themes";
import { useAppTheme } from "../../themes/hooks/useAppTheme";
import SettingsSection from "./SettingsSection";

const LIGHT_THEMES = ["light", "pastel", "mint", "lavender", "peach", "sky"];
const DARK_THEMES = [
  "dark",
  "nord",
  "dracula",
  "gruvbox",
  "cyberpunk",
  "monokai",
  "tokyo-night",
  "night-owl",
  "vaporwave",
  "solarized",
];

export default function AppearanceSection() {
  const theme = useAppTheme();
  const { mode, font, changeTheme, changeFont, THEMES, FONTS } = useTheme();
  const { currentTheme, setTheme: setGlobalTheme } = useGlobalTheme();
  const { currentAnimation, changeAnimation, ANIMATION_PRESETS } = useAnimation();

  const isOriginalTheme = currentTheme === "original";

  const [showColorThemes, setShowColorThemes] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);

  return (
    <SettingsSection title="Appearance" icon="color-palette">
      <SubsectionLabel text="App Theme Style" theme={theme} />
      <View style={styles.themeGrid}>
        {themeList.map((item) => (
          <ThemePreviewCard
            key={item.id}
            themeData={item.theme}
            active={currentTheme === item.id}
            onPress={() => setGlobalTheme(item.id)}
          />
        ))}
      </View>

      {isOriginalTheme && (
        <CollapsibleSection
          title="Color Theme"
          icon="color-fill"
          expanded={showColorThemes}
          onToggle={() => setShowColorThemes(!showColorThemes)}
          theme={theme}
        >
          <Text
            style={[
              styles.themeGroupLabel,
              { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
            ]}
          >
            Light Themes
          </Text>
          <View style={styles.colorGrid}>
            <ColorThemeCard
              label="System"
              active={mode === "system"}
              onPress={() => changeTheme("system")}
              colors={["#4d7cff", "#4ade80", "#f8f9fa", "#212529"]}
              theme={theme}
            />
            {Object.entries(THEMES)
              .filter(([key]) => LIGHT_THEMES.includes(key))
              .map(([key, themeItem]) => (
                <ColorThemeCard
                  key={key}
                  label={themeItem.name}
                  active={mode === key}
                  onPress={() => changeTheme(key as any)}
                  colors={[themeItem.accent, themeItem.accent2, themeItem.bg[0], themeItem.text]}
                  theme={theme}
                />
              ))}
          </View>

          <Text
            style={[
              styles.themeGroupLabel,
              {
                color: theme.colors.textMuted,
                fontFamily: theme.typography.fontRegular,
                marginTop: 16,
              },
            ]}
          >
            Dark Themes
          </Text>
          <View style={styles.colorGrid}>
            {Object.entries(THEMES)
              .filter(([key]) => DARK_THEMES.includes(key))
              .map(([key, themeItem]) => (
                <ColorThemeCard
                  key={key}
                  label={themeItem.name}
                  active={mode === key}
                  onPress={() => changeTheme(key as any)}
                  colors={[themeItem.accent, themeItem.accent2, themeItem.bg[0], themeItem.text]}
                  theme={theme}
                />
              ))}
          </View>
        </CollapsibleSection>
      )}

      {isOriginalTheme && (
        <CollapsibleSection
          title="Font Family"
          icon="text"
          expanded={showFonts}
          onToggle={() => setShowFonts(!showFonts)}
          theme={theme}
        >
          <View style={styles.fontGrid}>
            {Object.entries(FONTS).map(([key, f]) => (
              <FontCard
                key={key}
                label={f.label}
                fontFamily={f.bold}
                active={font === key}
                onPress={() => changeFont(key as any)}
                theme={theme}
              />
            ))}
          </View>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title="Animation Style"
        icon="flash"
        expanded={showAnimations}
        onToggle={() => setShowAnimations(!showAnimations)}
        theme={theme}
      >
        <View style={styles.animationGrid}>
          {ANIMATION_PRESETS.map((preset) => (
            <AnimationPreviewCard
              key={preset.id}
              preset={preset}
              active={currentAnimation === preset.id}
              onPress={() => changeAnimation(preset.id)}
              theme={theme}
            />
          ))}
        </View>
      </CollapsibleSection>
    </SettingsSection>
  );
}

function SubsectionLabel({ text, theme }: { text: string; theme: ReturnType<typeof useAppTheme> }) {
  return (
    <Text
      style={[
        styles.subsectionLabel,
        { color: theme.colors.textSecondary, fontFamily: theme.typography.fontBold },
      ]}
    >
      {text}
    </Text>
  );
}

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  theme,
  children,
}: {
  title: string;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  theme: ReturnType<typeof useAppTheme>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.collapsibleContainer}>
      <Pressable
        onPress={onToggle}
        style={[
          styles.collapsibleHeader,
          {
            backgroundColor: theme.colors.surface,
            borderColor: expanded ? theme.colors.accent : theme.colors.surfaceBorder,
            borderRadius: theme.shapes.radiusMd,
          },
        ]}
        android_ripple={{ color: theme.colors.accentMuted }}
      >
        <View style={styles.collapsibleLeft}>
          <Ionicons name={icon as any} size={18} color={theme.colors.accent} />
          <Text
            style={[
              styles.collapsibleTitle,
              { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
            ]}
          >
            {title}
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.colors.accent}
        />
      </Pressable>

      <AnimatePresence>
        {expanded && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal }}
            style={styles.collapsibleContent}
          >
            {children}
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

function ThemePreviewCard({
  themeData,
  active,
  onPress,
}: {
  themeData: any;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.themeCard,
        {
          backgroundColor: active ? theme.colors.accentMuted : theme.colors.surface,
          borderWidth: active ? 2 : 1,
          borderColor: active ? theme.colors.accent : theme.colors.surfaceBorder,
          borderRadius: theme.shapes.radiusMd,
        },
      ]}
    >
      <View
        style={[
          styles.phoneFrame,
          {
            backgroundColor: themeData.colors.background,
            borderColor: themeData.colors.surfaceBorder,
            borderRadius: Math.max(themeData.shapes.cardRadius / 2, 4),
          },
        ]}
      >
        <View style={[styles.phoneStatusBar, { backgroundColor: themeData.colors.surface }]} />
        <View style={styles.phoneContent}>
          <View
            style={[
              styles.phoneCard,
              {
                backgroundColor: themeData.colors.surface,
                borderRadius: Math.max(themeData.shapes.cardRadius / 3, 2),
              },
            ]}
          />
          <View
            style={[
              styles.phoneCard,
              styles.phoneCardSmall,
              {
                backgroundColor: themeData.colors.surface,
                borderRadius: Math.max(themeData.shapes.cardRadius / 3, 2),
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.phoneFab,
            {
              backgroundColor: themeData.colors.accent,
              borderRadius: Math.max(themeData.shapes.fabRadius / 2, 2),
            },
          ]}
        />
        <View style={[styles.phoneTabBar, { backgroundColor: themeData.colors.surface }]}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.phoneTabDot,
                { backgroundColor: i === 0 ? themeData.colors.accent : themeData.colors.textMuted },
              ]}
            />
          ))}
        </View>
      </View>

      <Text
        style={[
          styles.themeName,
          {
            color: active ? theme.colors.accent : theme.colors.textPrimary,
            fontFamily: theme.typography.fontBold,
          },
        ]}
        numberOfLines={1}
      >
        {themeData.displayName}
      </Text>
      <Text
        style={[
          styles.themeDesc,
          { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
        ]}
        numberOfLines={1}
      >
        {themeData.description}
      </Text>
    </Pressable>
  );
}

function ColorThemeCard({
  label,
  active,
  onPress,
  colors,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: string[];
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.colorCard,
        {
          backgroundColor: active ? theme.colors.accentMuted : theme.colors.surface,
          borderWidth: active ? 2 : 1,
          borderColor: active ? theme.colors.accent : theme.colors.surfaceBorder,
          borderRadius: theme.shapes.radiusMd,
        },
      ]}
    >
      <View style={styles.colorDots}>
        {colors.slice(0, 4).map((c, i) => (
          <View key={i} style={[styles.colorDot, { backgroundColor: c }]} />
        ))}
      </View>
      <Text
        style={[
          styles.colorLabel,
          {
            color: active ? theme.colors.accent : theme.colors.textPrimary,
            fontFamily: active ? theme.typography.fontBold : theme.typography.fontRegular,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FontCard({
  label,
  fontFamily,
  active,
  onPress,
  theme,
}: {
  label: string;
  fontFamily: string;
  active: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.fontCard,
        {
          backgroundColor: active ? theme.colors.accentMuted : theme.colors.surface,
          borderWidth: active ? 2 : 1,
          borderColor: active ? theme.colors.accent : theme.colors.surfaceBorder,
          borderRadius: theme.shapes.radiusMd,
        },
      ]}
    >
      <Text
        style={{
          fontFamily,
          fontSize: 28,
          color: active ? theme.colors.accent : theme.colors.textPrimary,
          marginBottom: 6,
        }}
      >
        Aa
      </Text>
      <Text
        style={[
          styles.fontLabel,
          {
            color: active ? theme.colors.accent : theme.colors.textPrimary,
            fontFamily: theme.typography.fontRegular,
          },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function AnimationPreviewCard({
  preset,
  active,
  onPress,
  theme,
}: {
  preset: { id: string; name: string; animation: any };
  active: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useAppTheme>;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    opacity.value = 1;
    rotate.value = 0;

    const runAnimation = () => {
      switch (preset.id) {
        case "slide_right":
          translateX.value = withRepeat(
            withSequence(
              withTiming(-12, { duration: 0 }),
              withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
              withDelay(800, withTiming(-12, { duration: 0 }))
            ),
            -1,
            false
          );
          break;

        case "slide_left":
          translateX.value = withRepeat(
            withSequence(
              withTiming(12, { duration: 0 }),
              withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
              withDelay(800, withTiming(12, { duration: 0 }))
            ),
            -1,
            false
          );
          break;

        case "slide_bottom":
          translateY.value = withRepeat(
            withSequence(
              withTiming(12, { duration: 0 }),
              withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
              withDelay(800, withTiming(12, { duration: 0 }))
            ),
            -1,
            false
          );
          break;

        case "fade":
          opacity.value = withRepeat(
            withSequence(
              withTiming(0, { duration: 0 }),
              withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
              withDelay(600, withTiming(0, { duration: 300 }))
            ),
            -1,
            false
          );
          break;

        case "scale_fade":
          scale.value = withRepeat(
            withSequence(
              withTiming(0.5, { duration: 0 }),
              withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
              withDelay(600, withTiming(0.5, { duration: 300 }))
            ),
            -1,
            false
          );
          opacity.value = withRepeat(
            withSequence(
              withTiming(0, { duration: 0 }),
              withTiming(1, { duration: 400 }),
              withDelay(600, withTiming(0, { duration: 300 }))
            ),
            -1,
            false
          );
          break;

        case "scale_fade_out":
          scale.value = withRepeat(
            withSequence(
              withTiming(1.3, { duration: 0 }),
              withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
              withDelay(600, withTiming(1.3, { duration: 300 }))
            ),
            -1,
            false
          );
          opacity.value = withRepeat(
            withSequence(
              withTiming(0, { duration: 0 }),
              withTiming(1, { duration: 400 }),
              withDelay(600, withTiming(0, { duration: 300 }))
            ),
            -1,
            false
          );
          break;

        case "bounce":
          translateY.value = withRepeat(
            withSequence(
              withTiming(-15, { duration: 0 }),
              withSpring(0, {
                damping: 4,
                stiffness: 280,
                mass: 0.6,
              }),
              withDelay(700, withTiming(-15, { duration: 0 }))
            ),
            -1,
            false
          );
          break;

        case "elastic":
          scale.value = withRepeat(
            withSequence(
              withTiming(0.3, { duration: 0 }),
              withSpring(1, {
                damping: 3,
                stiffness: 180,
                mass: 0.5,
              }),
              withDelay(800, withTiming(0.3, { duration: 0 }))
            ),
            -1,
            false
          );
          break;

        case "rotate_slide":
          translateX.value = withRepeat(
            withSequence(
              withTiming(-10, { duration: 0 }),
              withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
              withDelay(800, withTiming(-10, { duration: 0 }))
            ),
            -1,
            false
          );
          rotate.value = withRepeat(
            withSequence(
              withTiming(-15, { duration: 0 }),
              withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
              withDelay(800, withTiming(-15, { duration: 0 }))
            ),
            -1,
            false
          );
          break;

        case "slide_scale":
          translateX.value = withRepeat(
            withSequence(
              withTiming(12, { duration: 0 }),
              withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }),
              withDelay(750, withTiming(12, { duration: 0 }))
            ),
            -1,
            false
          );
          scale.value = withRepeat(
            withSequence(
              withTiming(0.8, { duration: 0 }),
              withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }),
              withDelay(750, withTiming(0.8, { duration: 0 }))
            ),
            -1,
            false
          );
          break;

        case "professional":
          scale.value = withRepeat(
            withSequence(
              withTiming(0.95, { duration: 0 }),
              withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }),
              withDelay(900, withTiming(0.95, { duration: 0 }))
            ),
            -1,
            false
          );
          opacity.value = withRepeat(
            withSequence(
              withTiming(0, { duration: 0 }),
              withTiming(1, { duration: 200 }),
              withDelay(900, withTiming(0, { duration: 150 }))
            ),
            -1,
            false
          );
          break;

        default:
          scale.value = withRepeat(
            withSequence(
              withTiming(0.9, { duration: 0 }),
              withTiming(1, { duration: 300 }),
              withDelay(700, withTiming(0.9, { duration: 200 }))
            ),
            -1,
            false
          );
      }
    };

    runAnimation();

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(opacity);
      cancelAnimation(rotate);
    };
  }, [preset.id]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.animCard,
        {
          backgroundColor: active ? theme.colors.accentMuted : theme.colors.surface,
          borderWidth: active ? 2 : 1,
          borderColor: active ? theme.colors.accent : theme.colors.surfaceBorder,
          borderRadius: theme.shapes.radiusMd,
        },
      ]}
    >
      <View style={styles.animPreview}>
        <Animated.View
          style={[
            styles.animBox,
            { backgroundColor: active ? theme.colors.accent : theme.colors.textMuted },
            animatedStyle,
          ]}
        />
      </View>
      <Text
        style={[
          styles.animLabel,
          {
            color: active ? theme.colors.accent : theme.colors.textPrimary,
            fontFamily: active ? theme.typography.fontBold : theme.typography.fontRegular,
          },
        ]}
        numberOfLines={1}
      >
        {preset.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  subsectionLabel: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  collapsibleContainer: {
    marginTop: 16,
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
  },
  collapsibleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  collapsibleTitle: {
    fontSize: 15,
  },
  collapsibleContent: {
    marginTop: 12,
    overflow: "hidden",
  },
  themeGroupLabel: {
    fontSize: 11,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  themeCard: {
    width: "48%",
    padding: 12,
    alignItems: "center",
    marginBottom: 4,
  },
  phoneFrame: {
    width: 56,
    height: 90,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  phoneStatusBar: {
    height: 7,
    width: "100%",
  },
  phoneContent: {
    flex: 1,
    padding: 4,
    gap: 3,
  },
  phoneCard: {
    height: 20,
    width: "100%",
  },
  phoneCardSmall: {
    height: 14,
    width: "65%",
  },
  phoneFab: {
    position: "absolute",
    bottom: 18,
    right: 4,
    width: 12,
    height: 12,
  },
  phoneTabBar: {
    height: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  phoneTabDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  themeName: {
    fontSize: 12,
    textAlign: "center",
  },
  themeDesc: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 2,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  colorCard: {
    width: "48%",
    padding: 12,
    alignItems: "center",
    marginBottom: 4,
  },
  colorDots: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  colorLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  fontGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  fontCard: {
    width: "48%",
    padding: 14,
    alignItems: "center",
    marginBottom: 4,
    minHeight: 90,
  },
  fontLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  animationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  animCard: {
    width: "31%",
    padding: 10,
    alignItems: "center",
    marginBottom: 4,
  },
  animPreview: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  animBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  animLabel: {
    fontSize: 9,
    textAlign: "center",
  },
});
