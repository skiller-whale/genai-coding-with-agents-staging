import { IStorage } from "./IStorage.ts";

/**
 * In-memory storage implementation using a Map
 * Data is not persisted and will be lost when the process terminates
 */
export class InMemoryStorage implements IStorage {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map<string, string>();
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async get(key: string): Promise<string | undefined> {
    return this.store.get(key);
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
