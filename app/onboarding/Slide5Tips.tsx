// app/onboarding/Slide5Tips.tsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import OnboardingSlide from "../../src/components/OnboardingSlide";
import { Ionicons } from "@expo/vector-icons";


export default function Slide5Tips() {
  const { colors, fontConfig } = useTheme();


  const customizations = [
    {
      icon: "color-palette",
      title: "Themes",
      description: "Choose from various color themes including light, dark, and custom schemes to match your style",
    },
    {
      icon: "text",
      title: "Fonts",
      description: "Select from multiple font families to match your reading preference",
    },
    {
      icon: "swap-horizontal",
      title: "Screen Transitions",
      description: "Customize transition effects between screens for a personalized navigation experience",
    },
    {
      icon: "finger-print",
      title: "Biometric & PIN",
      description: "Enable biometric authentication or PIN lock for additional security and quick access",
    },
  ];


  return (
    <OnboardingSlide slideIndex={4}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  customizationsContainer: {
    gap: 10,
  },
  customCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  customContent: {
    flex: 1,
    gap: 3,
  },
  customTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  customDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 16,
  },
});
