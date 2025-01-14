// src/utils/fuzzySearch.ts

export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

export function isFuzzyMatch(query: string, target: string, maxDistance: number = 2): boolean {
  const lowerQuery = query.toLowerCase();
  const lowerTarget = target.toLowerCase();

  if (lowerTarget.includes(lowerQuery)) {
    return true;
  }

  if (lowerQuery.length < 3) {
    return lowerTarget.includes(lowerQuery);
  }

  const targetWords = lowerTarget.split(/[\s\-_@.]+/);
  const queryWords = lowerQuery.split(/[\s\-_@.]+/);

  for (const queryWord of queryWords) {
    if (queryWord.length < 2) continue;

    for (const targetWord of targetWords) {
      if (targetWord.length < 2) continue;

      if (targetWord.includes(queryWord) || queryWord.includes(targetWord)) {
        return true;
      }

      const dynamicTolerance = Math.min(
        maxDistance,
        Math.floor(Math.min(queryWord.length, targetWord.length) / 3)
      );

      if (dynamicTolerance > 0) {
        const distance = levenshteinDistance(queryWord, targetWord);
        if (distance <= dynamicTolerance) {
          return true;
        }
      }
    }

    const distance = levenshteinDistance(queryWord, lowerTarget.substring(0, queryWord.length + 2));
    if (distance <= maxDistance) {
      return true;
    }
  }
  if (lowerQuery.length >= 3 && lowerTarget.length >= lowerQuery.length) {
    const targetPrefix = lowerTarget.substring(0, lowerQuery.length);
    const distance = levenshteinDistance(lowerQuery, targetPrefix);
    if (distance <= maxDistance) {
      return true;
    }
  }

  return false;
}

export function fuzzyMatchScore(query: string, target: string, maxDistance: number = 2): number {
  const lowerQuery = query.toLowerCase();
  const lowerTarget = target.toLowerCase();

  if (lowerTarget === lowerQuery) {
    return 0;
  }

  if (lowerTarget.includes(lowerQuery)) {
    return 0.5;
  }

  if (lowerTarget.startsWith(lowerQuery)) {
    return 0.3;
  }

  if (lowerQuery.length < 3) {
    return -1;
  }

  let bestScore = Infinity;
  const targetWords = lowerTarget.split(/[\s\-_@.]+/);

  for (const targetWord of targetWords) {
    if (targetWord.length < 2) continue;

    const distance = levenshteinDistance(lowerQuery, targetWord);
    if (distance <= maxDistance) {
      const normalizedScore = distance / Math.max(lowerQuery.length, targetWord.length);
      bestScore = Math.min(bestScore, 1 + normalizedScore);
    }
  }

  if (lowerTarget.length >= lowerQuery.length) {
    const targetPrefix = lowerTarget.substring(0, lowerQuery.length);
    const prefixDistance = levenshteinDistance(lowerQuery, targetPrefix);
    if (prefixDistance <= maxDistance) {
      const normalizedScore = prefixDistance / lowerQuery.length;
      bestScore = Math.min(bestScore, 1 + normalizedScore);
    }
  }

  return bestScore === Infinity ? -1 : bestScore;
}

export function fuzzySearchStrings(
  query: string,
  items: string[],
  maxDistance: number = 2
): string[] {
  if (!query.trim()) {
    return items;
  }

  const scored = items
    .map((item) => ({
      item,
      score: fuzzyMatchScore(query, item, maxDistance),
    }))
    .filter((result) => result.score >= 0)
    .sort((a, b) => a.score - b.score);

  return scored.map((result) => result.item);
}
