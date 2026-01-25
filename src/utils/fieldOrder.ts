// src/utils/fieldOrder.ts

const FIELD_ORDER: Record<string, number> = {
  name: 1,
  fullname: 1,
  full_name: 1,

  username: 2,
  user: 2,
  user_name: 2,

  email: 3,
  gmail: 3,
  mail: 3,

  phone: 4,
  mobile: 4,
  cell: 4,
  telephone: 4,
  phone_number: 4,

  dob: 5,
  date_of_birth: 5,
  birthday: 5,
  birthdate: 5,

  address: 6,

  password: 100,
  secret: 101,
  pin: 102,
  security_question: 103,
  security_answer: 104,
  recovery: 105,
  recovery_email: 106,
  recovery_phone: 107,
  backup_code: 108,
  backup_codes: 109,
  two_factor: 110,
  "2fa": 110,
};

export function getFieldOrder(fieldName: string): number {
  const normalized = fieldName.toLowerCase().replace(/\s+/g, "_");

  if (FIELD_ORDER[normalized] !== undefined) {
    return FIELD_ORDER[normalized];
  }

  for (const [key, order] of Object.entries(FIELD_ORDER)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return order;
    }
  }

  return 50;
}

export function sortFieldsByOrder(fields: string[]): string[] {
  return [...fields].sort((a, b) => {
    const orderA = getFieldOrder(a);
    const orderB = getFieldOrder(b);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.localeCompare(b);
  });
}

export function isSensitiveField(fieldName: string): boolean {
  const order = getFieldOrder(fieldName);
  return order >= 100;
}

export function isPasswordField(fieldName: string): boolean {
  const lower = fieldName.toLowerCase();
  return (
    lower.includes("password") ||
    lower.includes("secret") ||
    lower.includes("pin") ||
    lower === "pwd"
  );
}
