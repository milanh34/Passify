// src/utils/iconLibrary.ts

import { PLATFORM_ICONS, IconMapping, getAllPlatformIcons } from '../constants/iconMapping';


export const searchIcons = (query: string): IconMapping[] => {
  if (!query || query.trim() === '') {
    return getAllPlatformIcons();
  }


  const lowerQuery = query.toLowerCase().trim();
  
  return getAllPlatformIcons().filter(icon => {
    if (icon.displayName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    if (icon.platform.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    if (icon.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    
    return false;
  });
};


export const getPlatformIcon = (platformKey: string): IconMapping | null => {
  if (!platformKey) return null;
  
  const normalizedKey = platformKey.toLowerCase().replace(/\s+/g, '');
  return PLATFORM_ICONS[normalizedKey] || null;
};


export const getPlatformInitials = (platformName: string): string => {
  if (!platformName || platformName.trim() === '') {
    return '??';
  }


  const words = platformName.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  } else {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
};


export const normalizePlatformName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
};


export const findBestMatchingIcon = (platformName: string): IconMapping | null => {
  const normalized = normalizePlatformName(platformName);
  
  if (PLATFORM_ICONS[normalized]) {
    return PLATFORM_ICONS[normalized];
  }
  
  const allIcons = getAllPlatformIcons();
  const partialMatch = allIcons.find(icon => 
    icon.displayName.toLowerCase().includes(platformName.toLowerCase()) ||
    platformName.toLowerCase().includes(icon.displayName.toLowerCase())
  );
  
  if (partialMatch) {
    return partialMatch;
  }
  
  const keywordMatch = allIcons.find(icon =>
    icon.keywords.some(keyword => 
      keyword.includes(normalized) || normalized.includes(keyword)
    )
  );
  
  return keywordMatch || null;
};


export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};


export const getContrastColor = (hexColor: string): '#FFFFFF' | '#000000' => {
  if (!isValidHexColor(hexColor)) {
    return '#000000';
  }


  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);


  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;


  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};


export const getRandomColor = (): string => {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#FF9800', '#FF5722'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};


export const getAvailableLibraries = (): string[] => {
  const libraries = new Set<string>();
  getAllPlatformIcons().forEach(icon => libraries.add(icon.library));
  return Array.from(libraries).sort();
};


export const getIconCountByLibrary = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  getAllPlatformIcons().forEach(icon => {
    counts[icon.library] = (counts[icon.library] || 0) + 1;
  });
  return counts;
};
