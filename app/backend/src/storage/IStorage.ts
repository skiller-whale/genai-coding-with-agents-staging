/**
 * Interface for key-value storage implementations
 */
export interface IStorage {
  /**
   * Store a value with the given key
   * @param key - The key to store the value under
   * @param value - The value to store
   * @returns Promise that resolves when the value is stored
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Retrieve a value by key
   * @param key - The key to retrieve the value for
   * @returns Promise that resolves to the value, or undefined if not found
   */
  get(key: string): Promise<string | undefined>;

  /**
   * Check if a key exists in storage
   * @param key - The key to check
   * @returns Promise that resolves to true if the key exists, false otherwise
   */
  has(key: string): Promise<boolean>;

  /**
   * Delete a value by key
   * @param key - The key to delete
   * @returns Promise that resolves to true if the key was deleted, false if it didn't exist
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clear all values from storage
   * @returns Promise that resolves when storage is cleared
   */
  clear(): Promise<void>;
}
