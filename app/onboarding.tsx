// app/onboarding.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { saveOnboardingState } from "../src/utils/onboardingState";
import ConfirmModal from "../src/components/ConfirmModal";
import { useAppTheme } from "../src/themes/hooks/useAppTheme";

import Slide1Welcome from "./onboarding/Slide1Welcome";
import Slide2Tabs from "./onboarding/Slide2Tabs";
import Slide3SecurityTools from "./onboarding/Slide3SecurityTools";
import Slide4ManageAccounts from "./onboarding/Slide4ManageAccounts";
import Slide5Tips from "./onboarding/Slide5Tips";
import Slide6GetStarted from "./onboarding/Slide6GetStarted";
import { log } from "@/src/utils/logger";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  Slide1Welcome,
  Slide2Tabs,
  Slide3SecurityTools,
  Slide4ManageAccounts,
  Slide5Tips,
  Slide6GetStarted,
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const translateX = useSharedValue(0);
  const isTransitioning = useSharedValue(false);

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      handleComplete();
    } else {
      animateToSlide(currentSlide + 1, "next");
    }
  };

  const handlePrevious = () => {
    if (!isFirstSlide) {
      animateToSlide(currentSlide - 1, "prev");
    }
  };

  const animateToSlide = (newIndex: number, direction: "next" | "prev") => {
    if (isTransitioning.value) return;

    isTransitioning.value = true;
    const targetX = direction === "next" ? -SCREEN_WIDTH : SCREEN_WIDTH;

    translateX.value = withTiming(
      targetX,
      { duration: theme.animations.durationNormal },
      (finished) => {
        if (finished) {
          runOnJS(setCurrentSlide)(newIndex);
          translateX.value = direction === "next" ? SCREEN_WIDTH : -SCREEN_WIDTH;
          translateX.value = withTiming(0, { duration: theme.animations.durationNormal }, () => {
            isTransitioning.value = false;
          });
        }
      }
    );
  };

  const handleSkipAll = () => {
    setShowSkipModal(true);
  };

  const handleComplete = async () => {
    try {
      await saveOnboardingState({
        onboardingComplete: true,
        onboardingCompletedDate: Date.now(),
        onboardingVersion: 1,
      });
      router.replace("/(tabs)");
    } catch (error) {
      log.error("Failed to save onboarding state:", error);
      router.replace("/(tabs)");
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      if (!isTransitioning.value && Math.abs(event.translationX) > Math.abs(event.translationY)) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (isTransitioning.value) return;

      const SWIPE_THRESHOLD = 50;
      const velocity = event.velocityX;

      if ((event.translationX < -SWIPE_THRESHOLD || velocity < -500) && !isLastSlide) {
        runOnJS(handleNext)();
      } else if ((event.translationX > SWIPE_THRESHOLD || velocity > 500) && !isFirstSlide) {
        runOnJS(handlePrevious)();
      } else {
        translateX.value = withTiming(0, { duration: theme.animations.durationFast });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const CurrentSlideComponent = SLIDES[currentSlide];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + theme.spacing.lg,
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.surfaceBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.slideCounter,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeMd,
            },
          ]}
        >
          {currentSlide + 1} / {SLIDES.length}
        </Text>

        {!isLastSlide && (
          <Pressable
            onPress={handleSkipAll}
            style={({ pressed }) => [
              styles.skipButton,
              {
                backgroundColor: pressed ? theme.colors.accentMuted : theme.colors.accentMuted,
                borderRadius: theme.shapes.radiusXl,
              },
            ]}
          >
            <Text
              style={[
                styles.skipButtonText,
                {
                  color: theme.colors.accent,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeMd,
                },
              ]}
            >
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.slideContainer, animatedStyle]}>
          <CurrentSlideComponent key={`slide-${currentSlide}`} />
        </Animated.View>
      </GestureDetector>

      <View style={[styles.dotContainer, { backgroundColor: theme.colors.background }]}>
        {SLIDES.map((_, index) => (
          <MotiView
            key={index}
            animate={{
              width: index === currentSlide ? 24 : 8,
              backgroundColor:
                index === currentSlide ? theme.colors.accent : theme.colors.accentMuted,
            }}
            transition={{
              type: "timing",
              duration: theme.animations.durationNormal,
            }}
            style={[styles.dot, { borderRadius: theme.shapes.radiusSm }]}
          />
        ))}
      </View>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + theme.spacing.xl,
            backgroundColor: theme.colors.background,
            paddingHorizontal: theme.spacing.xl,
            gap: theme.spacing.md,
          },
        ]}
      >
        <Pressable
          onPress={handlePrevious}
          disabled={isFirstSlide}
          style={({ pressed }) => [
            styles.navButton,
            styles.previousButton,
            {
              backgroundColor: isFirstSlide
                ? theme.colors.surface
                : pressed
                  ? theme.colors.accentMuted
                  : theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderRadius: theme.components.button.radius,
              opacity: isFirstSlide ? 0.5 : 1,
              height: theme.components.button.height,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isFirstSlide ? theme.colors.textMuted : theme.colors.textPrimary}
          />
          <Text
            style={[
              styles.navButtonText,
              {
                color: isFirstSlide ? theme.colors.textMuted : theme.colors.textPrimary,
                fontFamily: theme.typography.fontBold,
                fontSize: theme.typography.sizeLg,
              },
            ]}
            numberOfLines={1}
          >
            Back
          </Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.navButton,
            styles.nextButton,
            {
              backgroundColor: pressed ? theme.colors.accentSecondary : theme.colors.accent,
              borderRadius: theme.components.button.radius,
              height: theme.components.button.height,
            },
          ]}
        >
          <Text
            style={[
              styles.navButtonText,
              {
                color: theme.colors.textInverse,
                fontFamily: theme.typography.fontBold,
                fontSize: theme.typography.sizeLg,
              },
            ]}
            numberOfLines={1}
          >
            {isLastSlide ? "Let's Go!" : "Next"}
          </Text>
          <Ionicons
            name={isLastSlide ? "rocket" : "arrow-forward"}
            size={20}
            color={theme.colors.textInverse}
          />
        </Pressable>
      </View>

      <ConfirmModal
        visible={showSkipModal}
        title="Skip Tutorial?"
        message="You can always replay this from Settings > Tutorial & Help whenever you want!"
        confirmText="Skip"
        cancelText="Continue"
        type="warning"
        onConfirm={() => {
          setShowSkipModal(false);
          handleComplete();
        }}
        onCancel={() => setShowSkipModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  slideCounter: {},
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {},
  slideContainer: {
    flex: 1,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  dot: {
    height: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  previousButton: {
    flex: 1,
    borderWidth: 1,
  },
  nextButton: {
    flex: 2,
  },
  navButtonText: {},
});
