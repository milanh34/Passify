import { PLATFORM_ICONS, IconMapping, getAllPlatformIcons } from '../constants/iconMapping';

/**
 * Search platforms by query string
 * Searches in display name, platform key, and keywords
 */
export const searchIcons = (query: string): IconMapping[] => {
  if (!query || query.trim() === '') {
    return getAllPlatformIcons();
  }

  const lowerQuery = query.toLowerCase().trim();
  
  return getAllPlatformIcons().filter(icon => {
    // Search in display name
    if (icon.displayName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in platform key
    if (icon.platform.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in keywords
    if (icon.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    
    return false;
  });
};

/**
 * Get icon mapping by platform key
 */
export const getPlatformIcon = (platformKey: string): IconMapping | null => {
  if (!platformKey) return null;
  
  const normalizedKey = platformKey.toLowerCase().replace(/\s+/g, '');
  return PLATFORM_ICONS[normalizedKey] || null;
};

/**
 * Get platform initials for fallback display
 */
export const getPlatformInitials = (platformName: string): string => {
  if (!platformName || platformName.trim() === '') {
    return '??';
  }

  const words = platformName.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 2 characters
    return words[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple words: take first letter of first 2 words
    return (words[0][0] + words[1][0]).toUpperCase();
  }
};

/**
 * Normalize platform name to icon key
 * Removes spaces, special characters, converts to lowercase
 */
export const normalizePlatformName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

/**
 * Find best matching icon for a platform name
 * Uses fuzzy matching if exact match not found
 */
export const findBestMatchingIcon = (platformName: string): IconMapping | null => {
  const normalized = normalizePlatformName(platformName);
  
  // Try exact match first
  if (PLATFORM_ICONS[normalized]) {
    return PLATFORM_ICONS[normalized];
  }
  
  // Try partial match in display names
  const allIcons = getAllPlatformIcons();
  const partialMatch = allIcons.find(icon => 
    icon.displayName.toLowerCase().includes(platformName.toLowerCase()) ||
    platformName.toLowerCase().includes(icon.displayName.toLowerCase())
  );
  
  if (partialMatch) {
    return partialMatch;
  }
  
  // Try keyword match
  const keywordMatch = allIcons.find(icon =>
    icon.keywords.some(keyword => 
      keyword.includes(normalized) || normalized.includes(keyword)
    )
  );
  
  return keywordMatch || null;
};

/**
 * Validate hex color format
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Get contrast color (black or white) for background
 */
export const getContrastColor = (hexColor: string): '#FFFFFF' | '#000000' => {
  if (!isValidHexColor(hexColor)) {
    return '#000000';
  }

  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Generate a random color from palette
 */
export const getRandomColor = (): string => {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#FF9800', '#FF5722'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Get available icon libraries
 */
export const getAvailableLibraries = (): string[] => {
  const libraries = new Set<string>();
  getAllPlatformIcons().forEach(icon => libraries.add(icon.library));
  return Array.from(libraries).sort();
};

/**
 * Get icon count by library
 */
export const getIconCountByLibrary = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  getAllPlatformIcons().forEach(icon => {
    counts[icon.library] = (counts[icon.library] || 0) + 1;
  });
  return counts;
};
