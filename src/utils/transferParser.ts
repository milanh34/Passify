export const parseTransferText = (text: string): Record<string, any[]> => {
  const platforms = text.trim().split("\n\n\n");
  const result: Record<string, any[]> = {};

  for (const platformBlock of platforms) {
    if (!platformBlock.trim()) continue;

    const parts = platformBlock.split("\n\n");
    if (parts.length < 2) continue;

    const platformName = parts[0].trim();
    const accounts: any[] = [];

    for (let i = 1; i < parts.length; i++) {
      const accountBlock = parts[i];
      if (!accountBlock.trim()) continue;

      const lines = accountBlock.trim().split("\n");
      const accountData: Record<string, string> = {};

      for (const line of lines) {
        if (line.includes(" - ")) {
          const [key, value] = line.split(" - ", 2);
          const fieldName = key.trim().toLowerCase().replace(/\s+/g, "_");
          accountData[fieldName] = value.trim();
        }
      }

      if (Object.keys(accountData).length > 0) {
        accounts.push(accountData);
      }
    }

    if (accounts.length > 0) {
      result[platformName] = accounts;
    }
  }

  return result;
};

export const generateExportText = (
  data: Record<string, any[]>,
  schemas: Record<string, string[]>
): string => {
  const platforms = Object.keys(data);
  const platformTexts: string[] = [];

  for (const platformName of platforms) {
    const accounts = data[platformName];
    const platformId = platformName.toLowerCase().replace(/\s+/g, "_");
    const schema = schemas[platformId] || ["name", "password"];

    const accountTexts: string[] = [];

    for (const account of accounts) {
      const fieldLines: string[] = [];

      for (const fieldName of schema) {
        const value = account[fieldName];
        if (value !== undefined && value !== null && value !== "") {
          // Convert field name to title case for display
          const displayName = fieldName
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          fieldLines.push(`${displayName} - ${value}`);
        }
      }

      if (fieldLines.length > 0) {
        accountTexts.push(fieldLines.join("\n"));
      }
    }

    if (accountTexts.length > 0) {
      platformTexts.push(`${platformName}\n\n${accountTexts.join("\n\n")}`);
    }
  }

  return platformTexts.join("\n\n\n");
};
