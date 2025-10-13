export const TAB_ANIMATION = {
  // === OPTION 1: Slide from Right (iOS Style) ===
  //   from: { opacity: 0, translateX: 100 },
  //   animate: { opacity: 1, translateX: 0 },
  //   duration: 250,
  //   type: "timing" as const,

  // === OPTION 2: Slide from Left ===
  //   from: { opacity: 0, translateX: -100 },
  //   animate: { opacity: 1, translateX: 0 },
  //   duration: 250,
  //   type: "timing" as const,

  // === OPTION 3: Slide from Bottom ===
  // from: { opacity: 0, translateY: 50 },
  // animate: { opacity: 1, translateY: 0 },
  // duration: 300,
  // type: "timing" as const,

  // === OPTION 4: Scale + Fade (Zoom In) ===
  // from: { opacity: 0, scale: 0.9 },
  // animate: { opacity: 1, scale: 1 },
  // duration: 200,
  // type: "timing" as const,

  // === OPTION 5: Scale + Fade (Zoom Out) ===
  // from: { opacity: 0, scale: 1.1 },
  // animate: { opacity: 1, scale: 1 },
  // duration: 250,
  // type: "timing" as const,

  // === OPTION 6: Fade Only (Simple & Clean) ===
  // from: { opacity: 0 },
  // animate: { opacity: 1 },
  // duration: 200,
  // type: "timing" as const,

  // === OPTION 7: Slide + Scale (Dynamic) ===
  // from: { opacity: 0, translateX: 80, scale: 0.95 },
  // animate: { opacity: 1, translateX: 0, scale: 1 },
  // duration: 280,
  // type: "timing" as const,

  // === OPTION 8: Rotate + Slide (Unique) ===
  // from: { opacity: 0, translateX: 50, rotate: "-5deg" },
  // animate: { opacity: 1, translateX: 0, rotate: "0deg" },
  // duration: 300,
  // type: "timing" as const,

  // === OPTION 9: 3D Flip Horizontal ===
  // from: { opacity: 0, rotateY: "45deg" },
  // animate: { opacity: 1, rotateY: "0deg" },
  // duration: 350,
  // type: "timing" as const,

  // === OPTION 10: Bounce (Spring Effect) ===
  // from: { opacity: 0, translateY: 40, scale: 0.95 },
  // animate: { opacity: 1, translateY: 0, scale: 1 },
  // duration: 300,
  // type: "spring" as const,
  // damping: 15,
  // stiffness: 100,

  // === OPTION 11: Elastic Zoom ===
  from: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  duration: 400,
  type: "spring" as const,
  damping: 12,
  stiffness: 150,

  // === OPTION 12: Slide + Rotate + Scale (Complex) ===
  // from: { opacity: 0, translateX: 60, rotate: "-8deg", scale: 0.9 },
  // animate: { opacity: 1, translateX: 0, rotate: "0deg", scale: 1 },
  // duration: 320,
  // type: "timing" as const,

  // === OPTION 13: Vertical Slide + Scale ===
//   from: { opacity: 0, translateY: -40, scale: 0.92 },
//   animate: { opacity: 1, translateY: 0, scale: 1 },
//   duration: 260,
//   type: "timing" as const,

  // === OPTION 14: Soft Bounce ===
//   from: { opacity: 0, translateY: 30 },
//   animate: { opacity: 1, translateY: 0 },
//   duration: 300,
//   type: "spring" as const,
//   damping: 20,
//   stiffness: 120,

  // === OPTION 15: Professional Fade-Scale ===
  // from: { opacity: 0, scale: 0.97 },
  // animate: { opacity: 1, scale: 1 },
  // duration: 180,
  // type: "timing" as const,
};

export const PAGE_ANIMATION = {
  from: { opacity: 0, translateX: 100 },
  animate: { opacity: 1, translateX: 0 },
  duration: 250,
  type: "timing" as const,
};

export const CARD_ANIMATION = {
  from: { opacity: 0, translateY: 30, scale: 0.95 },
  animate: { opacity: 1, translateY: 0, scale: 1 },
  duration: 300,
  staggerDelay: 80, 
  type: "timing" as const,
};