export interface AppConfig {
  secretSalt: string;
  port: number;
  host: string;
  storageType: "memory" | "file";
  storageFile: string;
  corsOrigin: string;
}

export function loadConfig(): AppConfig {
  const secretSalt = process.env.SECRET_SALT || "default-secret-salt";
  const port = parseInt(process.env.PORT || "6000", 10);
  const host = process.env.HOST || "0.0.0.0";
  const storageType = process.env.STORAGE_TYPE === "file" ? "file" : "memory";
  const storageFile = process.env.STORAGE_FILE || "./data/storage.json";
  const corsOrigin = process.env.CORS_ORIGIN || "*";

  return {
    secretSalt,
    port,
    host,
    storageType,
    storageFile,
    corsOrigin,
  };
}
