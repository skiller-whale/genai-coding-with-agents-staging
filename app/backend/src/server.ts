import { hashWithSalt, isValidData } from "./hash";

const SECRET_SALT = process.env.SECRET_SALT || "default-secret-salt";
const PORT = parseInt(process.env.PORT || "6000", 10);
const HOST = process.env.HOST || "0.0.0.0";

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
