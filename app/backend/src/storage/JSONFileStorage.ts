import { IStorage } from "./IStorage.ts";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * JSON file-based storage implementation
 * Data is persisted to a JSON file and survives process restarts
 */
export class JSONFileStorage implements IStorage {
  private filePath: string;
  private store: Map<string, string>;
  private initialized: boolean = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.store = new Map<string, string>();
  }

  /**
   * Initialize the storage by loading data from the file
   * Creates the file if it doesn't exist
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Ensure the directory exists
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      // Try to read existing file
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(data);

      // Validate that parsed data is an object
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        this.store = new Map(Object.entries(parsed));
      } else {
        this.store = new Map();
      }
    } catch (error: any) {
      // File doesn't exist or is invalid, start with empty store
      if (error.code === "ENOENT") {
        this.store = new Map();
        await this.persist();
      } else {
        // File exists but is corrupted, start fresh
        this.store = new Map();
        await this.persist();
      }
    }

    this.initialized = true;
  }

  /**
   * Persist the current store to disk
   */
  private async persist(): Promise<void> {
    const obj = Object.fromEntries(this.store);
    await fs.writeFile(this.filePath, JSON.stringify(obj, null, 2), "utf-8");
  }

  async set(key: string, value: string): Promise<void> {
    await this.initialize();
    this.store.set(key, value);
    await this.persist();
  }

  async get(key: string): Promise<string | undefined> {
    await this.initialize();
    return this.store.get(key);
  }

  async has(key: string): Promise<boolean> {
    await this.initialize();
    return this.store.has(key);
  }

  async delete(key: string): Promise<boolean> {
    await this.initialize();
    const result = this.store.delete(key);
    if (result) {
      await this.persist();
    }
    return result;
  }

  async clear(): Promise<void> {
    await this.initialize();
    this.store.clear();
    await this.persist();
  }
}
