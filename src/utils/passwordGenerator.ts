// src/utils/passwordGenerator.ts

import * as Crypto from "expo-crypto";

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  excludeSimilar: boolean;
  customSymbols?: string;
}

export interface PasswordStrength {
  score: number;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
  suggestions: string[];
}

export interface GeneratedPassword {
  password: string;
  strength: PasswordStrength;
  entropy: number;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "{}[]()/\\'\"`~,;:.<>";
const SIMILAR = "il1Lo0O";

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
  excludeSimilar: false,
};

export const PASSWORD_PRESETS: {
  id: string;
  name: string;
  description: string;
  options: PasswordOptions;
}[] = [
  {
    id: "strong",
    name: "Strong",
    description: "16 chars, all character types",
    options: {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: false,
      excludeSimilar: false,
    },
  },
  {
    id: "very_strong",
    name: "Very Strong",
    description: "24 chars, maximum security",
    options: {
      length: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: false,
      excludeSimilar: false,
    },
  },
  {
    id: "readable",
    name: "Readable",
    description: "12 chars, no ambiguous characters",
    options: {
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: true,
      excludeSimilar: true,
    },
  },
  {
    id: "pin",
    name: "PIN",
    description: "6 digit numeric PIN",
    options: {
      length: 6,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: false,
      excludeSimilar: false,
    },
  },
  {
    id: "alphanumeric",
    name: "Alphanumeric",
    description: "14 chars, letters and numbers only",
    options: {
      length: 14,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: false,
      excludeSimilar: false,
    },
  },
];

async function getSecureRandomBytes(count: number): Promise<Uint8Array> {
  return await Crypto.getRandomBytesAsync(count);
}

function buildCharacterPool(options: PasswordOptions): string {
  let pool = "";

  if (options.includeLowercase) {
    pool += LOWERCASE;
  }
  if (options.includeUppercase) {
    pool += UPPERCASE;
  }
  if (options.includeNumbers) {
    pool += NUMBERS;
  }
  if (options.includeSymbols) {
    pool += options.customSymbols || SYMBOLS;
  }

  if (options.excludeAmbiguous) {
    for (const char of AMBIGUOUS) {
      pool = pool.replace(new RegExp(`\\${char}`, "g"), "");
    }
  }

  if (options.excludeSimilar) {
    for (const char of SIMILAR) {
      pool = pool.replace(new RegExp(char, "g"), "");
    }
  }

  return pool;
}

function calculateEntropy(password: string, poolSize: number): number {
  if (poolSize <= 1 || password.length === 0) return 0;
  return Math.floor(password.length * Math.log2(poolSize));
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      color: "#EF4444",
      suggestions: ["Enter a password"],
    };
  }

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasRepeating = /(.)\1{2,}/.test(password);
  const hasSequential =
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password
    );

  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (length >= 20) score += 1;

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  score += varietyCount * 0.5;

  if (hasRepeating) {
    score -= 1;
    suggestions.push("Avoid repeating characters");
  }
  if (hasSequential) {
    score -= 1;
    suggestions.push("Avoid sequential patterns");
  }
  if (length < 8) {
    suggestions.push("Use at least 8 characters");
  }
  if (!hasLower) {
    suggestions.push("Add lowercase letters");
  }
  if (!hasUpper) {
    suggestions.push("Add uppercase letters");
  }
  if (!hasNumber) {
    suggestions.push("Add numbers");
  }
  if (!hasSymbol) {
    suggestions.push("Add symbols for extra security");
  }

  score = Math.max(0, Math.min(4, Math.round(score)));

  const strengthMap: Record<number, { label: PasswordStrength["label"]; color: string }> = {
    0: { label: "Very Weak", color: "#EF4444" },
    1: { label: "Weak", color: "#F97316" },
    2: { label: "Fair", color: "#EAB308" },
    3: { label: "Strong", color: "#22C55E" },
    4: { label: "Very Strong", color: "#10B981" },
  };

  return {
    score,
    label: strengthMap[score].label,
    color: strengthMap[score].color,
    suggestions: suggestions.slice(0, 3),
  };
}

export async function generatePassword(options: PasswordOptions): Promise<GeneratedPassword> {
  const pool = buildCharacterPool(options);

  if (pool.length === 0) {
    throw new Error("No characters available. Enable at least one character type.");
  }

  if (options.length < 4) {
    throw new Error("Password length must be at least 4 characters.");
  }

  if (options.length > 128) {
    throw new Error("Password length cannot exceed 128 characters.");
  }

  const randomBytes = await getSecureRandomBytes(options.length * 2);

  let password = "";
  let byteIndex = 0;

  const requiredChars: string[] = [];
  if (options.includeLowercase) {
    const chars = options.excludeSimilar
      ? LOWERCASE.split("")
          .filter((c) => !SIMILAR.includes(c))
          .join("")
      : LOWERCASE;
    const idx = randomBytes[byteIndex++] % chars.length;
    requiredChars.push(chars[idx]);
  }
  if (options.includeUppercase) {
    const chars = options.excludeSimilar
      ? UPPERCASE.split("")
          .filter((c) => !SIMILAR.includes(c))
          .join("")
      : UPPERCASE;
    const idx = randomBytes[byteIndex++] % chars.length;
    requiredChars.push(chars[idx]);
  }
  if (options.includeNumbers) {
    const chars = options.excludeSimilar
      ? NUMBERS.split("")
          .filter((c) => !SIMILAR.includes(c))
          .join("")
      : NUMBERS;
    const idx = randomBytes[byteIndex++] % chars.length;
    requiredChars.push(chars[idx]);
  }
  if (options.includeSymbols) {
    let chars = options.customSymbols || SYMBOLS;
    if (options.excludeAmbiguous) {
      chars = chars
        .split("")
        .filter((c) => !AMBIGUOUS.includes(c))
        .join("");
    }
    if (chars.length > 0) {
      const idx = randomBytes[byteIndex++] % chars.length;
      requiredChars.push(chars[idx]);
    }
  }

  const remainingLength = options.length - requiredChars.length;
  for (let i = 0; i < remainingLength && byteIndex < randomBytes.length; i++) {
    const idx = randomBytes[byteIndex++] % pool.length;
    password += pool[idx];
  }

  password += requiredChars.join("");

  const shuffleBytes = await getSecureRandomBytes(password.length);
  const passwordArray = password.split("");
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  password = passwordArray.join("");

  const entropy = calculateEntropy(password, pool.length);
  const strength = evaluatePasswordStrength(password);

  return {
    password,
    strength,
    entropy,
  };
}

export async function generatePassphrase(
  wordCount: number = 4,
  separator: string = "-"
): Promise<GeneratedPassword> {
  const words = [
    "apple",
    "beach",
    "cloud",
    "dance",
    "eagle",
    "flame",
    "grape",
    "heart",
    "island",
    "jungle",
    "kite",
    "lemon",
    "moon",
    "night",
    "ocean",
    "piano",
    "queen",
    "river",
    "storm",
    "tiger",
    "umbrella",
    "violet",
    "wave",
    "xenon",
    "yellow",
    "zebra",
    "anchor",
    "bridge",
    "castle",
    "dragon",
    "ember",
    "forest",
    "galaxy",
    "harbor",
    "ivory",
    "jasper",
    "knight",
    "lantern",
    "marble",
    "nebula",
    "orchid",
    "phoenix",
    "quartz",
    "rainbow",
    "shadow",
    "thunder",
    "unity",
    "vortex",
    "willow",
    "crystal",
    "diamond",
    "eclipse",
    "falcon",
    "glacier",
    "horizon",
    "inferno",
  ];

  const randomBytes = await getSecureRandomBytes(wordCount * 2);
  const selectedWords: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    const idx = (randomBytes[i * 2] * 256 + randomBytes[i * 2 + 1]) % words.length;
    selectedWords.push(words[idx]);
  }

  const capitalizedWords = selectedWords.map((word, i) =>
    i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
  );

  const randomNum = randomBytes[wordCount * 2 - 1] % 100;
  const passphrase = capitalizedWords.join(separator) + separator + randomNum;

  const strength = evaluatePasswordStrength(passphrase);
  const entropy = Math.floor(wordCount * Math.log2(words.length) + Math.log2(100));

  return {
    password: passphrase,
    strength,
    entropy,
  };
}

export function meetsMinimumRequirements(password: string): { meets: boolean; missing: string[] } {
  const missing: string[] = [];

  if (password.length < 8) {
    missing.push("At least 8 characters");
  }
  if (!/[a-z]/.test(password)) {
    missing.push("Lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    missing.push("Uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    missing.push("Number");
  }

  return {
    meets: missing.length === 0,
    missing,
  };
}
