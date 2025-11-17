import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


type AnimationType = {
  from: any;
  animate: any;
  duration: number;
  type: "timing" | "spring";
  damping?: number;
  stiffness?: number;
};


type AnimationPreset = {
  id: string;
  name: string;
  description: string;
  animation: AnimationType;
};


const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: "slide_right",
    name: "Slide Right",
    description: "iOS-style slide from right",
    animation: {
      from: { opacity: 0, translateX: 100 },
      animate: { opacity: 1, translateX: 0 },
      duration: 250,
      type: "timing",
    },
  },
  {
    id: "slide_left",
    name: "Slide Left",
    description: "Slide from left to right",
    animation: {
      from: { opacity: 0, translateX: -100 },
      animate: { opacity: 1, translateX: 0 },
      duration: 250,
      type: "timing",
    },
  },
  {
    id: "slide_bottom",
    name: "Slide Bottom",
    description: "Slide up from bottom",
    animation: {
      from: { opacity: 0, translateY: 50 },
      animate: { opacity: 1, translateY: 0 },
      duration: 300,
      type: "timing",
    },
  },
  {
    id: "fade",
    name: "Fade",
    description: "Simple fade in",
    animation: {
      from: { opacity: 0 },
      animate: { opacity: 1 },
      duration: 200,
      type: "timing",
    },
  },
  {
    id: "scale_fade",
    name: "Scale + Fade",
    description: "Zoom in with fade",
    animation: {
      from: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      duration: 200,
      type: "timing",
    },
  },
  {
    id: "scale_fade_out",
    name: "Scale Out + Fade",
    description: "Zoom out with fade",
    animation: {
      from: { opacity: 0, scale: 1.1 },
      animate: { opacity: 1, scale: 1 },
      duration: 250,
      type: "timing",
    },
  },
  {
    id: "slide_scale",
    name: "Slide + Scale",
    description: "Dynamic slide with scale",
    animation: {
      from: { opacity: 0, translateX: 80, scale: 0.95 },
      animate: { opacity: 1, translateX: 0, scale: 1 },
      duration: 280,
      type: "timing",
    },
  },
  {
    id: "rotate_slide",
    name: "Rotate + Slide",
    description: "Unique rotating slide",
    animation: {
      from: { opacity: 0, translateX: 50, rotate: "-5deg" },
      animate: { opacity: 1, translateX: 0, rotate: "0deg" },
      duration: 300,
      type: "timing",
    },
  },
  {
    id: "bounce",
    name: "Bounce",
    description: "Spring bounce effect",
    animation: {
      from: { opacity: 0, translateY: 40, scale: 0.95 },
      animate: { opacity: 1, translateY: 0, scale: 1 },
      duration: 300,
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
  {
    id: "elastic",
    name: "Elastic Zoom",
    description: "Elastic spring zoom",
    animation: {
      from: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1 },
      duration: 400,
      type: "spring",
      damping: 12,
      stiffness: 150,
    },
  },
  {
    id: "professional",
    name: "Professional",
    description: "Subtle fade-scale",
    animation: {
      from: { opacity: 0, scale: 0.97 },
      animate: { opacity: 1, scale: 1 },
      duration: 180,
      type: "timing",
    },
  },
];


type AnimationContextType = {
  currentAnimation: string;
  changeAnimation: (id: string) => void;
  TAB_ANIMATION: AnimationType;
  PAGE_ANIMATION: AnimationType;
  CARD_ANIMATION: AnimationType & { staggerDelay: number };
  ANIMATION_PRESETS: AnimationPreset[];
};


const AnimationContext = createContext<AnimationContextType | undefined>(undefined);


export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [currentAnimation, setCurrentAnimation] = useState("slide_right");


  useEffect(() => {
    loadAnimation();
  }, []);


  const loadAnimation = async () => {
    try {
      const saved = await AsyncStorage.getItem("@animation_preset");
      if (saved) setCurrentAnimation(saved);
    } catch (error) {
      console.error("Failed to load animation:", error);
    }
  };


  const changeAnimation = async (id: string) => {
    try {
      await AsyncStorage.setItem("@animation_preset", id);
      setCurrentAnimation(id);
    } catch (error) {
      console.error("Failed to save animation:", error);
    }
  };


  const getAnimation = () => {
    const preset = ANIMATION_PRESETS.find((p) => p.id === currentAnimation);
    return preset ? preset.animation : ANIMATION_PRESETS[0].animation;
  };


  const animation = getAnimation();


  const TAB_ANIMATION = animation;
  const PAGE_ANIMATION = animation;
  const CARD_ANIMATION = {
    from: { opacity: 0, translateY: 30, scale: 0.95 },
    animate: { opacity: 1, translateY: 0, scale: 1 },
    duration: 300,
    staggerDelay: 80,
    type: "timing" as const,
  };


  return (
    <AnimationContext.Provider
      value={{
        currentAnimation,
        changeAnimation,
        TAB_ANIMATION,
        PAGE_ANIMATION,
        CARD_ANIMATION,
        ANIMATION_PRESETS,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}


export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) throw new Error("useAnimation must be used within AnimationProvider");
  return context;
}
