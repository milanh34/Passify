// src/constants/iconMapping.ts

import {
  getAllPlatformIcons as _getAllPlatformIcons,
  getPlatformIconByKey,
  getIconsByCategory as _getIconsByCategory,
  getPlatformCount as _getPlatformCount,
} from "./icons";

import type { IconMapping, IconCategory } from "./icons/types";

export type { IconMapping };

const buildPlatformIcons = (): Record<string, IconMapping> => {
  const icons: Record<string, IconMapping> = {};
  for (const icon of _getAllPlatformIcons()) {
    icons[icon.platform] = icon;
  }
  return icons;
};

let _platformIcons: Record<string, IconMapping> | null = null;

export const PLATFORM_ICONS: Record<string, IconMapping> = new Proxy(
  {} as Record<string, IconMapping>,
  {
    get(_, prop: string) {
      if (!_platformIcons) {
        _platformIcons = buildPlatformIcons();
      }
      return _platformIcons[prop];
    },
    has(_, prop: string) {
      if (!_platformIcons) {
        _platformIcons = buildPlatformIcons();
      }
      return prop in _platformIcons;
    },
    ownKeys() {
      if (!_platformIcons) {
        _platformIcons = buildPlatformIcons();
      }
      return Object.keys(_platformIcons);
    },
    getOwnPropertyDescriptor(_, prop: string) {
      if (!_platformIcons) {
        _platformIcons = buildPlatformIcons();
      }
      if (prop in _platformIcons) {
        return {
          enumerable: true,
          configurable: true,
          value: _platformIcons[prop],
        };
      }
      return undefined;
    },
  }
);

export const ICON_CATEGORIES = [
  { id: "social", label: "Social Media", icon: "people" },
  { id: "communication", label: "Communication", icon: "chatbubbles" },
  { id: "ai", label: "AI & Chatbots", icon: "hardware-chip" },
  { id: "developer", label: "Developer Tools", icon: "code" },
  { id: "productivity", label: "Productivity", icon: "briefcase" },
  { id: "storage", label: "Cloud Storage", icon: "cloud" },
  { id: "media", label: "Media & Entertainment", icon: "play" },
  { id: "gaming", label: "Gaming", icon: "game-controller" },
  { id: "finance", label: "Finance & Trading", icon: "trending-up" },
  { id: "crypto", label: "Cryptocurrency", icon: "logo-bitcoin" },
  { id: "banking", label: "Banking", icon: "business" },
  { id: "identity", label: "Identity & Documents", icon: "card" },
  { id: "education", label: "Education", icon: "school" },
  { id: "shopping", label: "Shopping & Food", icon: "cart" },
  { id: "travel", label: "Travel", icon: "airplane" },
  { id: "other", label: "Other", icon: "apps" },
] as const;

export const ICON_COLOR_PALETTE = [
  { name: "Red", value: "#F44336" },
  { name: "Pink", value: "#E91E63" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Deep Purple", value: "#673AB7" },
  { name: "Indigo", value: "#3F51B5" },
  { name: "Blue", value: "#2196F3" },
  { name: "Light Blue", value: "#03A9F4" },
  { name: "Cyan", value: "#00BCD4" },
  { name: "Teal", value: "#009688" },
  { name: "Green", value: "#4CAF50" },
  { name: "Light Green", value: "#8BC34A" },
  { name: "Lime", value: "#CDDC39" },
  { name: "Yellow", value: "#FFEB3B" },
  { name: "Amber", value: "#FFC107" },
  { name: "Orange", value: "#FF9800" },
  { name: "Deep Orange", value: "#FF5722" },
  { name: "Brown", value: "#795548" },
  { name: "Grey", value: "#9E9E9E" },
  { name: "Blue Grey", value: "#607D8B" },
  { name: "Black", value: "#000000" },
];

export const getAllPlatformIcons = _getAllPlatformIcons;
export const getIconsByCategory = _getIconsByCategory;
export const getPlatformCount = _getPlatformCount;
