import { describe, it, expect } from 'vitest';
import { isValidJSON, parseJSON, isValidHash, sanitizeText } from '../src/utils/validators';

describe('Validators', () => {
  describe('isValidJSON', () => {
    it('should return true for valid JSON object', () => {
      expect(isValidJSON('{"key": "value"}')).toBe(true);
      expect(isValidJSON('{"nested": {"key": "value"}}')).toBe(true);
      expect(isValidJSON('{"array": [1, 2, 3]}')).toBe(true);
    });

    it('should return true for valid JSON array', () => {
      expect(isValidJSON('[1, 2, 3]')).toBe(true);
      expect(isValidJSON('[{"key": "value"}]')).toBe(true);
    });

    it('should return false for invalid JSON', () => {
      expect(isValidJSON('{key: "value"}')).toBe(false);
      expect(isValidJSON('{"key": value}')).toBe(false);
      expect(isValidJSON('not json')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidJSON('')).toBe(false);
      expect(isValidJSON('   ')).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isValidJSON('123')).toBe(false);
      expect(isValidJSON('"string"')).toBe(false);
      expect(isValidJSON('true')).toBe(false);
      expect(isValidJSON('null')).toBe(false);
    });
  });

  describe('parseJSON', () => {
    it('should parse valid JSON object', () => {
      const result = parseJSON('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should parse valid JSON array', () => {
      const result = parseJSON('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return null for invalid JSON', () => {
      expect(parseJSON('not json')).toBe(null);
      expect(parseJSON('{key: value}')).toBe(null);
    });

    it('should return null for primitive values', () => {
      expect(parseJSON('123')).toBe(null);
      expect(parseJSON('"string"')).toBe(null);
    });
  });

  describe('isValidHash', () => {
    it('should return true for valid hash', () => {
      const validHash = 'a'.repeat(64);
      expect(isValidHash(validHash)).toBe(true);
    });

    it('should return true for hash with mixed hex characters', () => {
      const validHash = 'abc123def456' + '0'.repeat(52);
      expect(isValidHash(validHash)).toBe(true);
    });

    it('should return false for wrong length', () => {
      expect(isValidHash('a'.repeat(63))).toBe(false);
      expect(isValidHash('a'.repeat(65))).toBe(false);
      expect(isValidHash('')).toBe(false);
    });

    it('should return false for non-hex characters', () => {
      const invalidHash = 'g' + 'a'.repeat(63);
      expect(isValidHash(invalidHash)).toBe(false);
    });

    it('should return false for uppercase hex', () => {
      const invalidHash = 'A'.repeat(64);
      expect(isValidHash(invalidHash)).toBe(false);
    });
  });

  describe('sanitizeText', () => {
    it('should trim whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello');
      expect(sanitizeText('\n\nhello\n\n')).toBe('hello');
    });

    it('should return empty string for whitespace-only input', () => {
      expect(sanitizeText('   ')).toBe('');
      expect(sanitizeText('\n\t')).toBe('');
    });

    it('should preserve internal whitespace', () => {
      expect(sanitizeText('hello world')).toBe('hello world');
    });
  });
});
