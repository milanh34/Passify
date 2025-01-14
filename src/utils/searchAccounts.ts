// src/utils/searchAccounts.ts

import { isFuzzyMatch, fuzzyMatchScore } from "./fuzzySearch";

export interface Account {
  id: string;
  name: string;
  [key: string]: any;
}

export interface SearchResult {
  account: Account;
  score: number;
}

export function searchAccounts(accounts: Account[], query: string): Account[] {
  if (!query.trim()) {
    return accounts;
  }

  const lowerQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const account of accounts) {
    let bestScore = -1;

    for (const [key, value] of Object.entries(account)) {
      if (key === "id" || key === "createdAt" || key === "updatedAt") {
        continue;
      }

      if (typeof value === "string" && value.trim()) {
        const score = fuzzyMatchScore(lowerQuery, value, 2);

        if (score >= 0) {
          let weightedScore = score;
          if (key === "name") {
            weightedScore *= 0.8;
          } else if (key === "email" || key === "username") {
            weightedScore *= 0.9;
          }

          if (bestScore < 0 || weightedScore < bestScore) {
            bestScore = weightedScore;
          }
        }
      }
    }

    if (bestScore >= 0) {
      results.push({ account, score: bestScore });
    }
  }

  return results.sort((a, b) => a.score - b.score).map((result) => result.account);
}

export function searchAccountsExact(accounts: Account[], query: string): Account[] {
  if (!query.trim()) {
    return accounts;
  }

  const lowerQuery = query.toLowerCase().trim();

  return accounts.filter((account) => {
    return Object.entries(account).some(([key, value]) => {
      if (key === "id" || key === "createdAt" || key === "updatedAt") {
        return false;
      }
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
  });
}

export function debounceSearch<T extends (...args: any[]) => any>(
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
