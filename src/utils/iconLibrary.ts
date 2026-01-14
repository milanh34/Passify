// src/utils/iconLibrary.ts

import {
  getAllPlatformIcons as getAll,
  getPlatformIconByKey,
  searchPlatformIcons,
  findBestMatchingIcon as findBestMatch,
  getPlatformInitials as getInitials,
  getContrastColor as getContrast,
  isValidHexColor as isValidHex,
  getIconsByCategory as getByCat,
  getPlatformCount as getCount,
} from "../constants/icons";

import type { IconMapping, IconCategory } from "../constants/icons/types";

export const searchIcons = searchPlatformIcons;
export const getPlatformIcon = getPlatformIconByKey;
export const getPlatformInitials = getInitials;
export const getContrastColor = getContrast;
export const isValidHexColor = isValidHex;
export const findBestMatchingIcon = findBestMatch;
export const getAllPlatformIcons = getAll;
export const getIconsByCategory = getByCat;
export const getPlatformCount = getCount;

export const normalizePlatformName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
};

export const getRandomColor = (): string => {
  const colors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#FF9800",
    "#FF5722",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getAvailableLibraries = (): string[] => {
  const libraries = new Set<string>();
  getAll().forEach((icon) => libraries.add(icon.library));
  return Array.from(libraries).sort();
};

export const getIconCountByLibrary = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  getAll().forEach((icon) => {
    counts[icon.library] = (counts[icon.library] || 0) + 1;
  });
  return counts;
};

export type { IconMapping, IconCategory };
