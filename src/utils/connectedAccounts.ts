// src/utils/connectedAccounts.ts

export interface ConnectedAccount {
  platformKey: string;
  platformName: string;
  accountId: string;
  accountName: string;
  matchingField: string;
  matchingValue: string;
  icon?: string | null;
  iconColor?: string | null;
}

export interface ConnectedPlatform {
  platformKey: string;
  platformName: string;
  accounts: ConnectedAccount[];
  accountCount: number;
  icon?: string | null;
  iconColor?: string | null;
}

export interface ConnectedAccountsResult {
  identifier: string;
  identifierType: string;
  totalPlatforms: number;
  totalAccounts: number;
  platforms: ConnectedPlatform[];
}

const EMAIL_IDENTIFIER_FIELDS = [
  "email",
  "gmail",
  "mail",
  "recovery_email",
  "recoveryemail",
  "recovery email",
];

export const SUPPORTED_PLATFORMS_FOR_CONNECTIONS = ["google", "gmail", "microsoft", "outlook"];

export function isPlatformSupportedForConnections(platformKey: string): boolean {
  const normalized = platformKey.toLowerCase().replace(/\s+/g, "");
  return SUPPORTED_PLATFORMS_FOR_CONNECTIONS.some(
    (supported) => normalized.includes(supported) || supported.includes(normalized)
  );
}

export function isEmailIdentifierField(fieldName: string): boolean {
  const normalized = fieldName.toLowerCase().replace(/[_\s]/g, "");
  return EMAIL_IDENTIFIER_FIELDS.some(
    (f) =>
      normalized.includes(f.replace(/[_\s]/g, "")) || f.replace(/[_\s]/g, "").includes(normalized)
  );
}

export function getEmailFieldsFromAccount(account: any): { field: string; value: string }[] {
  const emailFields: { field: string; value: string }[] = [];

  for (const [key, value] of Object.entries(account)) {
    if (isEmailIdentifierField(key) && value && typeof value === "string" && value.includes("@")) {
      emailFields.push({ field: key, value: value.trim() });
    }
  }

  return emailFields;
}

export function findConnectedAccounts(
  database: Record<string, any[]>,
  platformsMetadata: Record<string, any>,
  identifierValue: string,
  currentPlatformKey?: string,
  currentAccountId?: string
): ConnectedAccountsResult {
  const normalizedValue = identifierValue.toLowerCase().trim();

  const result: ConnectedAccountsResult = {
    identifier: identifierValue,
    identifierType: "Email",
    totalPlatforms: 0,
    totalAccounts: 0,
    platforms: [],
  };

  if (!normalizedValue || !normalizedValue.includes("@")) {
    return result;
  }

  for (const [platformKey, accounts] of Object.entries(database)) {
    const matchingAccounts: ConnectedAccount[] = [];

    for (const account of accounts) {
      const emailFields = getEmailFieldsFromAccount(account);

      for (const { field, value } of emailFields) {
        if (value.toLowerCase().trim() === normalizedValue) {
          matchingAccounts.push({
            platformKey,
            platformName: account.platform || platformKey.replace(/_/g, " "),
            accountId: account.id,
            accountName: account.name || "Unnamed Account",
            matchingField: field,
            matchingValue: value,
            icon: platformsMetadata[platformKey]?.icon || null,
            iconColor: platformsMetadata[platformKey]?.iconColor || null,
          });
          break;
        }
      }
    }

    if (matchingAccounts.length > 0) {
      const platformMeta = platformsMetadata[platformKey];
      result.platforms.push({
        platformKey,
        platformName: matchingAccounts[0].platformName,
        accounts: matchingAccounts,
        accountCount: matchingAccounts.length,
        icon: platformMeta?.icon || null,
        iconColor: platformMeta?.iconColor || null,
      });
      result.totalAccounts += matchingAccounts.length;
    }
  }

  result.totalPlatforms = result.platforms.length;

  result.platforms.sort((a, b) => {
    if (currentPlatformKey) {
      if (a.platformKey === currentPlatformKey) return -1;
      if (b.platformKey === currentPlatformKey) return 1;
    }
    return a.platformName.localeCompare(b.platformName);
  });

  return result;
}

export function countConnectedPlatforms(
  database: Record<string, any[]>,
  identifierValue: string,
  excludePlatformKey: string
): number {
  const normalizedValue = identifierValue.toLowerCase().trim();

  if (!normalizedValue || !normalizedValue.includes("@")) {
    return 0;
  }

  let count = 0;

  for (const [platformKey, accounts] of Object.entries(database)) {
    if (platformKey === excludePlatformKey) continue;

    for (const account of accounts) {
      const emailFields = getEmailFieldsFromAccount(account);

      for (const { value } of emailFields) {
        if (value.toLowerCase().trim() === normalizedValue) {
          count++;
          break;
        }
      }

      if (count > 0) break;
    }
  }

  return count;
}

export function getPrimaryEmail(account: any): { field: string; value: string } | null {
  const emailFields = getEmailFieldsFromAccount(account);
  return emailFields.length > 0 ? emailFields[0] : null;
}

export function formatIdentifierType(field: string): string {
  const mappings: Record<string, string> = {
    email: "Email",
    gmail: "Gmail",
    mail: "Email",
    recovery_email: "Recovery Email",
    recoveryemail: "Recovery Email",
  };

  const normalized = field.toLowerCase().replace(/[_\s]/g, "");
  return mappings[normalized] || "Email";
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
