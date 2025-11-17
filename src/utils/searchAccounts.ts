// src/utils/searchAccounts.ts

export interface Account {
  id: string;
  name: string;
  [key: string]: any;
}


export function searchAccounts(
  accounts: Account[],
  query: string
): Account[] {
  if (!query.trim()) {
    return accounts;
  }


  const lowerQuery = query.toLowerCase().trim();


  return accounts.filter((account) => {
    return Object.entries(account).some(([key, value]) => {
      if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
        return false;
      }
      
      if (typeof value === 'string') {
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
