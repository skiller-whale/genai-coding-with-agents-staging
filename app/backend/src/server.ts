import { loadConfig } from "./config/index.ts";
import { InMemoryStorage, JSONFileStorage } from "./storage/index.ts";
import { createRouter } from "./routes/index.ts";

const config = loadConfig();

const storage =
  config.storageType === "file"
    ? new JSONFileStorage(config.storageFile)
    : new InMemoryStorage();

const router = createRouter({ storage, config });

const server = Bun.serve({
  port: config.port,
  hostname: config.host,
  fetch: router,
});

console.log(`Server running at http://${config.host}:${config.port}`);
