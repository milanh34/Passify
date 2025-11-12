// app/onboarding/Slide5Tips.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import OnboardingSlide from "../../src/components/OnboardingSlide";
import { Ionicons } from "@expo/vector-icons";

export default function Slide5Tips() {
  const { colors, fontConfig } = useTheme();

  const customizations = [
    {
      icon: "color-palette",
      title: "Themes",
      description: "Switch between light and dark modes or choose custom color schemes",
    },
    {
      icon: "text",
      title: "Fonts",
      description: "Select from multiple font families to match your reading preference",
    },
    {
      icon: "flash",
      title: "Animations",
      description: "Control animation speed and effects for a personalized experience",
    },
    {
      icon: "options",
      title: "Layout Options",
      description: "Customize card layouts, sorting preferences, and display settings",
    },
  ];

  return (
    <OnboardingSlide slideIndex={4}>
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            { color: colors.text, fontFamily: fontConfig.bold },
          ]}
        >
          Personalize Your Experience
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.subtext, fontFamily: fontConfig.regular },
          ]}
        >
          Customize the app to suit your style and preferences:
        </Text>

        <View style={styles.customizationsContainer}>
          {customizations.map((item, index) => (
            <CustomizationCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              colors={colors}
              fontConfig={fontConfig}
            />
          ))}
        </View>

        <Text
          style={[
            styles.note,
            { color: colors.subtext, fontFamily: fontConfig.regular },
          ]}
        >
          Access all customization options from the Customize tab anytime.
        </Text>
      </View>
    </OnboardingSlide>
  );
}

function CustomizationCard({
  icon,
  title,
  description,
  colors,
  fontConfig,
}: {
  icon: string;
  title: string;
  description: string;
  colors: any;
  fontConfig: any;
}) {
  return (
    <View style={styles.customCard}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${colors.accent}15` },
        ]}
      >
        <Ionicons name={icon as any} size={20} color={colors.accent} />
      </View>
      <View style={styles.customContent}>
        <Text
          style={[
            styles.customTitle,
            { color: colors.text, fontFamily: fontConfig.bold },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.customDescription,
            { color: colors.subtext, fontFamily: fontConfig.regular },
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  customizationsContainer: {
    gap: 12,
  },
  customCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  customContent: {
    flex: 1,
    gap: 4,
  },
  customTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  customDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
});
