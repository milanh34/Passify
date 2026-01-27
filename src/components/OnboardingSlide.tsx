// src/components/OnboardingSlide.tsx

import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { useAppTheme } from "../themes/hooks/useAppTheme";

interface OnboardingSlideProps {
  children: React.ReactNode;
  slideIndex: number;
}

export default function OnboardingSlide({ children, slideIndex }: OnboardingSlideProps) {
  const theme = useAppTheme();

  return (
    <MotiView
      key={`slide-${slideIndex}`}
      from={{
        opacity: 1,
        translateX: 0,
      }}
      animate={{
        opacity: 1,
        translateX: 0,
      }}
      transition={{
        type: "timing",
        duration: theme.animations.durationNormal,
      }}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {children}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
});
