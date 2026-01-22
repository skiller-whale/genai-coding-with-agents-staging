import { hashWithSalt } from "../hash.ts";
import type { IStorage } from "../storage/index.ts";

export class ContentService {
  constructor(
    private storage: IStorage,
    private secretSalt: string
  ) {}

  async storeContent(text: string): Promise<string> {
    const hash = hashWithSalt(text, this.secretSalt);
    await this.storage.set(hash, text);
    return hash;
  }

  async retrieveContent(hash: string): Promise<string | undefined> {
    return await this.storage.get(hash);
  }
}
