// src/themes/hooks/useThemedAnimation.ts

import { useMemo } from "react";
import { useGlobalTheme } from "../../context/GlobalThemeContext";
import { AnimationConfig } from "../types";

export interface ThemedAnimationConfig {
  type: "timing" | "spring";
  duration?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
}

export interface MotiAnimationProps {
  from: object;
  animate: object;
  transition: ThemedAnimationConfig;
}

export function useThemedAnimation() {
  const { theme } = useGlobalTheme();

  return useMemo(() => {
    const { animations } = theme;

    const createTransition = (config: AnimationConfig): object => {
      if (config.type === "spring") {
        return {
          type: "spring",
          damping: config.damping ?? animations.springDefault.damping,
          stiffness: config.stiffness ?? animations.springDefault.stiffness,
        };
      }
      return {
        type: "timing",
        duration: config.duration ?? animations.durationNormal,
      };
    };

    return {
      pageTransition: {
        from: animations.pageTransition.from,
        animate: animations.pageTransition.to,
        transition: createTransition(animations.pageTransition),
      },

      modalEntry: {
        from: animations.modalEntry.from,
        animate: animations.modalEntry.to,
        transition: createTransition(animations.modalEntry),
      },

      cardExpand: {
        transition: createTransition(animations.cardExpand),
      },

      listItemStagger: animations.listItemStagger,
      buttonPress: animations.buttonPress,
      fabPress: animations.fabPress,

      durationFast: animations.durationFast,
      durationNormal: animations.durationNormal,
      durationSlow: animations.durationSlow,

      springDefault: animations.springDefault,
      springBouncy: animations.springBouncy,
      springStiff: animations.springStiff,
    };
  }, [theme]);
}
