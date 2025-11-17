// src/utils/searchFilter.ts

export interface Platform {
  key: string;
  name: string;
  count: number;
  createdAt?: number;
  icon?: string | null;
  iconColor?: string | null;
}


export interface SearchResult {
  platform: Platform;
  matchType: 'platform' | 'account';
  matchedAccounts?: string[];
}


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
    if (platform.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        platform,
        matchType: 'platform',
      });
      continue;
    }


    const accounts = database[platform.key] || [];
    const matchedAccountIds: string[] = [];


    for (const account of accounts) {
      const matchFound = Object.entries(account).some(([key, value]) => {
        if (key === 'id') return false;
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
