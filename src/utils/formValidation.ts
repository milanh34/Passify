// src/utils/formValidation.ts

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === "") {
    return { isValid: true };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === "") {
    return { isValid: true };
  }

  const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, "");

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: "Phone should contain only numbers" };
  }

  if (cleaned.length < 7 || cleaned.length > 15) {
    return { isValid: false, error: "Phone number should be 7-15 digits" };
  }

  return { isValid: true };
}

export function validateDate(date: string): ValidationResult {
  if (!date || date.trim() === "") {
    return { isValid: true };
  }

  const formats = [/^\d{2}\/\d{2}\/\d{4}$/, /^\d{4}-\d{2}-\d{2}$/];

  if (!formats.some((regex) => regex.test(date.trim()))) {
    return { isValid: false, error: "Invalid date format" };
  }

  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === "") {
    return { isValid: true };
  }

  if (password.length < 4) {
    return { isValid: false, error: "Password too short (min 4 chars)" };
  }

  return { isValid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === "") {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

export function getFieldType(fieldName: string): "email" | "phone" | "date" | "password" | "text" {
  const lower = fieldName.toLowerCase();

  if (lower.includes("email") || lower.includes("gmail") || lower.includes("mail")) {
    return "email";
  }
  if (
    lower.includes("phone") ||
    lower.includes("mobile") ||
    lower.includes("cell") ||
    lower.includes("tel")
  ) {
    return "phone";
  }
  if (lower.includes("dob") || lower.includes("birth") || lower.includes("date")) {
    return "date";
  }
  if (lower.includes("password") || lower.includes("secret") || lower.includes("pin")) {
    return "password";
  }

  return "text";
}

export function validateField(fieldName: string, value: string): ValidationResult {
  const fieldType = getFieldType(fieldName);

  switch (fieldType) {
    case "email":
      return validateEmail(value);
    case "phone":
      return validatePhone(value);
    case "date":
      return validateDate(value);
    case "password":
      return validatePassword(value);
    default:
      return { isValid: true };
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else if (cleaned.length <= 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)}-${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
}
