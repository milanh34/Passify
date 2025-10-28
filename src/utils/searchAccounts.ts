/**
 * Search/filter utilities for accounts
 */

export interface Account {
  id: string;
  name: string;
  [key: string]: any;
}

/**
 * Search accounts by all string fields
 * @param accounts - Array of account objects
 * @param query - Search query string
 * @returns Filtered array of accounts
 */
export function searchAccounts(
  accounts: Account[],
  query: string
): Account[] {
  if (!query.trim()) {
    return accounts;
  }

  const lowerQuery = query.toLowerCase().trim();

  return accounts.filter((account) => {
    // Check all string fields in the account
    return Object.entries(account).some(([key, value]) => {
      // Skip technical fields
      if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
        return false;
      }
      
      // Check if value is string and contains query
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      
      return false;
    });
  });
}

/**
 * Debounce function for search input
 */
export function debounceSearch<T extends (...args: any[]) => any>(
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
