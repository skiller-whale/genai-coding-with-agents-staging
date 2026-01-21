import { createHash } from "crypto";

/**
 * Hashes data with a secret salt using SHA-256
 * @param data - The data object to hash
 * @param salt - The secret salt to use
 * @returns The hexadecimal hash string
 */
export function hashWithSalt(data: unknown, salt: string): string {
  const dataString = JSON.stringify(data);
  const combined = dataString + salt;
  return createHash("sha256").update(combined).digest("hex");
}

/**
 * Validates that the provided data is a valid JSON object
 * @param data - The data to validate
 * @returns True if data is a valid object
 */
export function isValidData(data: unknown): boolean {
  return data !== null && typeof data === "object" && !Array.isArray(data);
}
