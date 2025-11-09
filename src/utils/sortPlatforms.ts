/**
 * Sorting utilities for platforms
 */

export interface Platform {
  key: string;
  name: string;
  count: number;
  createdAt?: number;
  icon?: string | null; // 🎨 ICONS: Icon key from iconMapping
  iconColor?: string | null; // 🎨 ICONS: Hex color for icon
}

export type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'count_asc'
  | 'count_desc'
  | 'recent'
  | 'oldest';

export interface SortConfig {
  id: SortOption;
  label: string;
  icon: string;
}

export const SORT_OPTIONS: SortConfig[] = [
  { id: 'name_asc', label: 'Platform Name (A → Z)', icon: 'arrow-up-outline' },
  { id: 'name_desc', label: 'Platform Name (Z → A)', icon: 'arrow-down-outline' },
  { id: 'count_asc', label: 'Accounts (Low → High)', icon: 'trending-up-outline' },
  { id: 'count_desc', label: 'Accounts (High → Low)', icon: 'trending-down-outline' },
  { id: 'recent', label: 'Recently Created', icon: 'time-outline' },
  { id: 'oldest', label: 'Oldest Created', icon: 'calendar-outline' },
];

/**
 * Sort platforms based on selected option
 */
export function sortPlatforms(
  platforms: Platform[],
  sortOption: SortOption,
  metadata?: Record<string, { createdAt: number; updatedAt: number }>
): Platform[] {
  const sorted = [...platforms];

  switch (sortOption) {
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    case 'count_asc':
      return sorted.sort((a, b) => a.count - b.count);

    case 'count_desc':
      return sorted.sort((a, b) => b.count - a.count);

    case 'recent':
      return sorted.sort((a, b) => {
        const aTime = metadata?.[a.key]?.createdAt || 0;
        const bTime = metadata?.[b.key]?.createdAt || 0;
        return bTime - aTime; // Newest first
      });

    case 'oldest':
      return sorted.sort((a, b) => {
        const aTime = metadata?.[a.key]?.createdAt || 0;
        const bTime = metadata?.[b.key]?.createdAt || 0;
        return aTime - bTime; // Oldest first
      });

    default:
      return sorted;
  }
}

/**
 * Get short label for current sort option
 */
export function getSortLabel(sortOption: SortOption): string {
  const option = SORT_OPTIONS.find((o) => o.id === sortOption);
  return option?.label || 'Sort';
}
