// src/constants/icons/index.ts

import {
  IconMapping,
  IconDefinition,
  IconLibrary,
  IconCategory,
  LIBRARY_MAP,
  CompactIconDef,
} from "./types";
import { COMPACT_PLATFORM_ICONS, ICON_CATEGORIES_LIST } from "./platformIcons";

let expandedCache: Record<string, IconMapping> | null = null;

function expandIconDef(platform: string, compact: CompactIconDef): IconMapping {
  const [libShort, iconName, color, category, keywords] = compact;
  const library = LIBRARY_MAP[libShort] || (libShort as IconLibrary);

  const displayName = platform
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();

  return {
    platform,
    displayName,
    library,
    iconName,
    defaultColor: color,
    category,
    keywords,
  };
}

export function getAllPlatformIcons(): IconMapping[] {
  if (!expandedCache) {
    expandedCache = {};
    for (const [platform, compact] of Object.entries(COMPACT_PLATFORM_ICONS)) {
      expandedCache[platform] = expandIconDef(platform, compact);
    }
  }
  return Object.values(expandedCache);
}

export function getPlatformIconByKey(key: string): IconMapping | null {
  const normalizedKey = key.toLowerCase().replace(/[\s\-_.]/g, "");

  if (expandedCache?.[normalizedKey]) {
    return expandedCache[normalizedKey];
  }

  const compact = COMPACT_PLATFORM_ICONS[normalizedKey];
  if (compact) {
    const expanded = expandIconDef(normalizedKey, compact);
    if (!expandedCache) expandedCache = {};
    expandedCache[normalizedKey] = expanded;
    return expanded;
  }

  return null;
}

export function searchPlatformIcons(query: string): IconMapping[] {
  if (!query || query.trim() === "") {
    return getAllPlatformIcons();
  }

  const lowerQuery = query.toLowerCase().trim();
  const results: IconMapping[] = [];

  for (const [platform, compact] of Object.entries(COMPACT_PLATFORM_ICONS)) {
    const [, , , , keywords] = compact;

    if (platform.includes(lowerQuery)) {
      results.push(getPlatformIconByKey(platform)!);
      continue;
    }

    if (keywords.some((kw) => kw.includes(lowerQuery))) {
      results.push(getPlatformIconByKey(platform)!);
    }
  }

  return results;
}

export function getIconsByCategory(category: IconCategory): IconMapping[] {
  const results: IconMapping[] = [];

  for (const [platform, compact] of Object.entries(COMPACT_PLATFORM_ICONS)) {
    if (compact[3] === category) {
      results.push(getPlatformIconByKey(platform)!);
    }
  }

  return results;
}

export function findBestMatchingIcon(platformName: string): IconMapping | null {
  const normalized = platformName.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (COMPACT_PLATFORM_ICONS[normalized]) {
    return getPlatformIconByKey(normalized);
  }

  for (const platform of Object.keys(COMPACT_PLATFORM_ICONS)) {
    if (platform.includes(normalized) || normalized.includes(platform)) {
      return getPlatformIconByKey(platform);
    }
  }

  for (const [platform, compact] of Object.entries(COMPACT_PLATFORM_ICONS)) {
    const keywords = compact[4];
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.replace(/[^a-z0-9]/g, "");
      if (normalizedKeyword.includes(normalized) || normalized.includes(normalizedKeyword)) {
        return getPlatformIconByKey(platform);
      }
    }
  }

  return null;
}

export function getPlatformCount(): number {
  return Object.keys(COMPACT_PLATFORM_ICONS).length;
}

export function getPlatformInitials(platformName: string): string {
  if (!platformName || platformName.trim() === "") {
    return "??";
  }
  const words = platformName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

export function getContrastColor(hexColor: string): "#FFFFFF" | "#000000" {
  if (!isValidHexColor(hexColor)) {
    return "#000000";
  }
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export { ICON_CATEGORIES_LIST };
export type { IconMapping, IconDefinition, IconLibrary, IconCategory };
