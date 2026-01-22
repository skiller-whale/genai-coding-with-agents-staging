/**
 * Validates if a string is valid JSON
 * @param str - The string to validate
 * @returns true if valid JSON, false otherwise
 */
export function isValidJSON(str: string): boolean {
  if (!str || str.trim() === '') {
    return false;
  }

  try {
    const parsed = JSON.parse(str);
    // Ensure it's an object (not a primitive)
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}

/**
 * Parses JSON string safely
 * @param str - The JSON string to parse
 * @returns Parsed object or null if invalid
 */
export function parseJSON(str: string): object | null {
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates if a string is a valid hash (64 hex characters)
 * @param hash - The hash string to validate
 * @returns true if valid hash format, false otherwise
 */
export function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/.test(hash);
}

/**
 * Sanitizes text content for display
 * @param text - The text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  return text.trim();
}
