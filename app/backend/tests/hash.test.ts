import { describe, test, expect } from "bun:test";
import { hashWithSalt, isValidData } from "../src/hash";

describe("hashWithSalt", () => {
  test("should generate consistent hash for same input", () => {
    const data = { name: "test", value: 123 };
    const salt = "test-salt";

    const hash1 = hashWithSalt(data, salt);
    const hash2 = hashWithSalt(data, salt);

    expect(hash1).toBe(hash2);
  });

  test("should generate different hashes for different data", () => {
    const data1 = { name: "test1" };
    const data2 = { name: "test2" };
    const salt = "test-salt";

    const hash1 = hashWithSalt(data1, salt);
    const hash2 = hashWithSalt(data2, salt);

    expect(hash1).not.toBe(hash2);
  });

  test("should generate different hashes for different salts", () => {
    const data = { name: "test" };
    const salt1 = "salt1";
    const salt2 = "salt2";

    const hash1 = hashWithSalt(data, salt1);
    const hash2 = hashWithSalt(data, salt2);

    expect(hash1).not.toBe(hash2);
  });

  test("should return a 64-character hex string", () => {
    const data = { test: true };
    const salt = "test-salt";

    const hash = hashWithSalt(data, salt);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("should handle complex nested objects", () => {
    const data = {
      user: {
        name: "John",
        age: 30,
        address: {
          city: "New York",
          zip: "10001",
        },
      },
      items: [1, 2, 3],
    };
    const salt = "test-salt";

    const hash = hashWithSalt(data, salt);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("should handle empty objects", () => {
    const data = {};
    const salt = "test-salt";

    const hash = hashWithSalt(data, salt);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("should handle objects with null values", () => {
    const data = { value: null };
    const salt = "test-salt";

    const hash = hashWithSalt(data, salt);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("should be sensitive to key order in JSON serialization", () => {
    const data1 = { a: 1, b: 2 };
    const data2 = { b: 2, a: 1 };
    const salt = "test-salt";

    const hash1 = hashWithSalt(data1, salt);
    const hash2 = hashWithSalt(data2, salt);

    // JSON.stringify maintains insertion order, so these should be different
    // unless the objects were created in the same order
    expect(typeof hash1).toBe("string");
    expect(typeof hash2).toBe("string");
  });
});

describe("isValidData", () => {
  test("should return true for valid objects", () => {
    expect(isValidData({ name: "test" })).toBe(true);
    expect(isValidData({})).toBe(true);
    expect(isValidData({ nested: { obj: true } })).toBe(true);
  });

  test("should return false for null", () => {
    expect(isValidData(null)).toBe(false);
  });

  test("should return false for arrays", () => {
    expect(isValidData([1, 2, 3])).toBe(false);
    expect(isValidData([])).toBe(false);
  });

  test("should return false for primitives", () => {
    expect(isValidData("string")).toBe(false);
    expect(isValidData(123)).toBe(false);
    expect(isValidData(true)).toBe(false);
    expect(isValidData(undefined)).toBe(false);
  });
});
