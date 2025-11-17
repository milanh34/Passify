// src/utils/sortAccounts.ts

export interface Account {
  id: string;
  name: string;
  email?: string;
  username?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

export type AccountSortOption =
  | "name_asc"
  | "name_desc"
  | "recent_added"
  | "oldest_added"
  | "recent_modified"
  | "oldest_modified";

export interface AccountSortConfig {
  id: AccountSortOption;
  label: string;
  icon: string;
}

export const ACCOUNT_SORT_OPTIONS: AccountSortConfig[] = [
  { id: "name_asc", label: "Name (A → Z)", icon: "arrow-up-outline" },
  { id: "name_desc", label: "Name (Z → A)", icon: "arrow-down-outline" },
  { id: "recent_added", label: "Recently Added", icon: "time-outline" },
  { id: "oldest_added", label: "Oldest Added", icon: "calendar-outline" },
  { id: "recent_modified", label: "Recently Modified", icon: "create-outline" },
  { id: "oldest_modified", label: "Oldest Modified", icon: "timer-outline" },
];

function getIdentifier(account: Account): string {
  return account.email || account.username || account.name || "";
}

export function sortAccounts(accounts: Account[], sortOption: AccountSortOption): Account[] {
  const sorted = [...accounts];

  switch (sortOption) {
    case "name_asc":
      return sorted.sort((a, b) => {
        const aId = getIdentifier(a).toLowerCase();
        const bId = getIdentifier(b).toLowerCase();
        return aId.localeCompare(bId);
      });

    case "name_desc":
      return sorted.sort((a, b) => {
        const aId = getIdentifier(a).toLowerCase();
        const bId = getIdentifier(b).toLowerCase();
        return bId.localeCompare(aId);
      });

    case "recent_added":
      return sorted.sort((a, b) => {
        const aTime = a.createdAt || 0;
        const bTime = b.createdAt || 0;
        return bTime - aTime;
      });

    case "oldest_added":
      return sorted.sort((a, b) => {
        const aTime = a.createdAt || 0;
        const bTime = b.createdAt || 0;
        return aTime - bTime;
      });

    case "recent_modified":
      return sorted.sort((a, b) => {
        const aTime = a.updatedAt || 0;
        const bTime = b.updatedAt || 0;
        return bTime - aTime;
      });

    case "oldest_modified":
      return sorted.sort((a, b) => {
        const aTime = a.updatedAt || 0;
        const bTime = b.updatedAt || 0;
        return aTime - bTime;
      });

    default:
      return sorted;
  }
}

export function getAccountSortLabel(sortOption: AccountSortOption): string {
  const option = ACCOUNT_SORT_OPTIONS.find((o) => o.id === sortOption);
  return option?.label || "Sort";
}
