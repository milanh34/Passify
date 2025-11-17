import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { useTheme } from "../context/ThemeContext";


interface OnboardingSlideProps {
  children: React.ReactNode;
  slideIndex: number;
}


export default function OnboardingSlide({
  children,
  slideIndex,
}: OnboardingSlideProps) {
  const { colors } = useTheme();


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
        duration: 300,
      }}
      style={[styles.container, { backgroundColor: colors.bg[0] }]}
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
