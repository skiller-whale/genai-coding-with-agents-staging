import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { InMemoryStorage, JSONFileStorage } from "../src/storage";
import * as fs from "fs/promises";
import * as path from "path";

describe("InMemoryStorage", () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  test("should store and retrieve values", async () => {
    await storage.set("key1", "value1");
    const value = await storage.get("key1");
    expect(value).toBe("value1");
  });

  test("should return undefined for non-existent keys", async () => {
    const value = await storage.get("nonexistent");
    expect(value).toBeUndefined();
  });

  test("should check if key exists", async () => {
    await storage.set("key1", "value1");
    expect(await storage.has("key1")).toBe(true);
    expect(await storage.has("key2")).toBe(false);
  });

  test("should delete values", async () => {
    await storage.set("key1", "value1");
    const deleted = await storage.delete("key1");
    expect(deleted).toBe(true);
    expect(await storage.get("key1")).toBeUndefined();
  });

  test("should return false when deleting non-existent key", async () => {
    const deleted = await storage.delete("nonexistent");
    expect(deleted).toBe(false);
  });

  test("should clear all values", async () => {
    await storage.set("key1", "value1");
    await storage.set("key2", "value2");
    await storage.clear();
    expect(await storage.get("key1")).toBeUndefined();
    expect(await storage.get("key2")).toBeUndefined();
  });

  test("should overwrite existing values", async () => {
    await storage.set("key1", "value1");
    await storage.set("key1", "value2");
    const value = await storage.get("key1");
    expect(value).toBe("value2");
  });
});

describe("JSONFileStorage", () => {
  const testDir = path.join(__dirname, "test-data");
  const testFile = path.join(testDir, "test-storage.json");
  let storage: JSONFileStorage;

  beforeEach(async () => {
    // Clean up any existing test files
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
    storage = new JSONFileStorage(testFile);
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test("should create file if it doesn't exist", async () => {
    await storage.set("key1", "value1");
    const value = await storage.get("key1");
    expect(value).toBe("value1");

    // Verify file exists
    const fileExists = await fs
      .access(testFile)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);
  });

  test("should persist data to file", async () => {
    await storage.set("key1", "value1");
    await storage.set("key2", "value2");

    // Create new storage instance with same file
    const storage2 = new JSONFileStorage(testFile);
    expect(await storage2.get("key1")).toBe("value1");
    expect(await storage2.get("key2")).toBe("value2");
  });

  test("should return undefined for non-existent keys", async () => {
    const value = await storage.get("nonexistent");
    expect(value).toBeUndefined();
  });

  test("should check if key exists", async () => {
    await storage.set("key1", "value1");
    expect(await storage.has("key1")).toBe(true);
    expect(await storage.has("key2")).toBe(false);
  });

  test("should delete values and persist", async () => {
    await storage.set("key1", "value1");
    const deleted = await storage.delete("key1");
    expect(deleted).toBe(true);
    expect(await storage.get("key1")).toBeUndefined();

    // Verify deletion persisted
    const storage2 = new JSONFileStorage(testFile);
    expect(await storage2.get("key1")).toBeUndefined();
  });

  test("should return false when deleting non-existent key", async () => {
    const deleted = await storage.delete("nonexistent");
    expect(deleted).toBe(false);
  });

  test("should clear all values and persist", async () => {
    await storage.set("key1", "value1");
    await storage.set("key2", "value2");
    await storage.clear();
    expect(await storage.get("key1")).toBeUndefined();
    expect(await storage.get("key2")).toBeUndefined();

    // Verify clear persisted
    const storage2 = new JSONFileStorage(testFile);
    expect(await storage2.get("key1")).toBeUndefined();
    expect(await storage2.get("key2")).toBeUndefined();
  });

  test("should overwrite existing values", async () => {
    await storage.set("key1", "value1");
    await storage.set("key1", "value2");
    const value = await storage.get("key1");
    expect(value).toBe("value2");

    // Verify overwrite persisted
    const storage2 = new JSONFileStorage(testFile);
    expect(await storage2.get("key1")).toBe("value2");
  });

  test("should handle corrupted file gracefully", async () => {
    // Create directory first
    await fs.mkdir(testDir, { recursive: true });
    // Write invalid JSON
    await fs.writeFile(testFile, "not valid json", "utf-8");

    // Should initialize with empty store
    const value = await storage.get("key1");
    expect(value).toBeUndefined();

    // Should be able to write new data
    await storage.set("key1", "value1");
    expect(await storage.get("key1")).toBe("value1");
  });

  test("should create parent directories if they don't exist", async () => {
    const deepPath = path.join(testDir, "deep", "nested", "storage.json");
    const deepStorage = new JSONFileStorage(deepPath);

    await deepStorage.set("key1", "value1");
    expect(await deepStorage.get("key1")).toBe("value1");

    // Verify file exists at deep path
    const fileExists = await fs
      .access(deepPath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);
  });
});
