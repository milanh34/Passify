// src/utils/searchFilter.ts

import { isFuzzyMatch, fuzzyMatchScore } from "./fuzzySearch";

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
  matchType: "platform" | "account";
  matchedAccounts?: any[];
  score: number;
}

export function searchPlatforms(
  platforms: Platform[],
  database: Record<string, any[]>,
  query: string
): SearchResult[] {
  if (!query.trim()) {
    return platforms.map((p) => ({
      platform: p,
      matchType: "platform" as const,
      score: 0,
    }));
  }

  const lowerQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const platform of platforms) {
    const platformScore = fuzzyMatchScore(lowerQuery, platform.name, 2);

    if (platformScore >= 0) {
      results.push({
        platform,
        matchType: "platform",
        score: platformScore,
      });
      continue;
    }

    const keyScore = fuzzyMatchScore(lowerQuery, platform.key, 2);
    if (keyScore >= 0) {
      results.push({
        platform,
        matchType: "platform",
        score: keyScore,
      });
      continue;
    }

    const accounts = database[platform.key] || [];
    const matchedAccounts: any[] = [];
    let bestAccountScore = Infinity;

    for (const account of accounts) {
      let accountMatched = false;
      let accountBestScore = Infinity;

      for (const [key, value] of Object.entries(account)) {
        if (key === "id" || key === "createdAt" || key === "updatedAt") {
          continue;
        }

        if (typeof value === "string" && value.trim()) {
          const score = fuzzyMatchScore(lowerQuery, value, 2);
          if (score >= 0) {
            accountMatched = true;
            accountBestScore = Math.min(accountBestScore, score);
          }
        }
      }

      if (accountMatched) {
        matchedAccounts.push(account);
        bestAccountScore = Math.min(bestAccountScore, accountBestScore);
      }
    }

    if (matchedAccounts.length > 0) {
      results.push({
        platform,
        matchType: "account",
        matchedAccounts,
        score: bestAccountScore + 0.5,
      });
    }
  }

  return results.sort((a, b) => a.score - b.score);
}

export function searchPlatformsExact(
  platforms: Platform[],
  database: Record<string, any[]>,
  query: string
): SearchResult[] {
  if (!query.trim()) {
    return platforms.map((p) => ({
      platform: p,
      matchType: "platform" as const,
      score: 0,
    }));
  }

  const lowerQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const platform of platforms) {
    if (platform.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        platform,
        matchType: "platform",
        score: 0,
      });
      continue;
    }

    const accounts = database[platform.key] || [];
    const matchedAccountIds: string[] = [];

    for (const account of accounts) {
      const matchFound = Object.entries(account).some(([key, value]) => {
        if (key === "id") return false;
        if (typeof value === "string") {
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
        matchType: "account",
        matchedAccounts: accounts.filter((a: any) => matchedAccountIds.includes(a.id)),
        score: 1,
      });
    }
  }

  return results;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

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
