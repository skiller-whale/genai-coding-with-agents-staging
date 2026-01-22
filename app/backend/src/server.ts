import { hashWithSalt, isValidData } from "./hash.ts";
import type { IStorage } from "./storage/index.ts";
import { InMemoryStorage, JSONFileStorage } from "./storage/index.ts";

const SECRET_SALT = process.env.SECRET_SALT || "default-secret-salt";
const PORT = parseInt(process.env.PORT || "6000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const STORAGE_TYPE = process.env.STORAGE_TYPE || "memory";
const STORAGE_FILE = process.env.STORAGE_FILE || "./data/storage.json";

// Initialize storage based on configuration
const contentStore: IStorage =
  STORAGE_TYPE === "file"
    ? new JSONFileStorage(STORAGE_FILE)
    : new InMemoryStorage();

const server = Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const url = new URL(req.url);

    // Health check endpoint
    if (url.pathname === "/health" && req.method === "GET") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Content storage endpoint
    if (url.pathname === "/content" && req.method === "POST") {
      try {
        const body = await req.json();

        if (!body || typeof body.text !== "string") {
          return new Response(
            JSON.stringify({
              error: "Invalid request body. Must include 'text' field.",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const hash = hashWithSalt(body.text, SECRET_SALT);
        await contentStore.set(hash, body.text);

        return new Response(JSON.stringify({ url: `/content/${hash}` }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Invalid JSON in request body",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Content retrieval endpoint
    if (url.pathname.startsWith("/content/") && req.method === "GET") {
      const hash = url.pathname.slice("/content/".length);
      const content = await contentStore.get(hash);

      if (!content) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(content, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Hash endpoint
    if (url.pathname === "/hash" && req.method === "POST") {
      try {
        const body = await req.json();

        if (!isValidData(body)) {
          return new Response(
            JSON.stringify({
              error: "Invalid request body. Must be a JSON object.",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const hash = hashWithSalt(body, SECRET_SALT);

        return new Response(JSON.stringify({ hash }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Invalid JSON in request body",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log(`Server running at http://${HOST}:${PORT}`);
