/**
 * Search/filter utilities for platform and account searching
 */

export interface Platform {
  key: string;
  name: string;
  count: number;
  createdAt?: number;
}

export interface SearchResult {
  platform: Platform;
  matchType: 'platform' | 'account';
  matchedAccounts?: string[]; // IDs of matched accounts
}

/**
 * Search platforms by name and account data
 * @param platforms - Array of platform objects
 * @param database - Full database with account data
 * @param query - Search query string
 * @returns Filtered array of SearchResult objects
 */
export function searchPlatforms(
  platforms: Platform[],
  database: Record<string, any[]>,
  query: string
): SearchResult[] {
  if (!query.trim()) {
    return platforms.map(p => ({ platform: p, matchType: 'platform' as const }));
  }

  const lowerQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const platform of platforms) {
    // Primary filter: Match platform name
    if (platform.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        platform,
        matchType: 'platform',
      });
      continue;
    }

    // Secondary filter: Match account data
    const accounts = database[platform.key] || [];
    const matchedAccountIds: string[] = [];

    for (const account of accounts) {
      // Check all string fields in the account
      const matchFound = Object.entries(account).some(([key, value]) => {
        if (key === 'id') return false; // Skip ID field
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery);
        }
        return false;
      });

      if (matchFound) {
        matchedAccountIds.push(account.id);
      }
    }

    if (matchedAccountIds.length > 0) {
      results.push({
        platform,
        matchType: 'account',
        matchedAccounts: matchedAccountIds,
      });
    }
  }

  return results;
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
