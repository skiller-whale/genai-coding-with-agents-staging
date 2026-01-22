import type { Route, AppContext } from "../middleware/types.ts";
import { withErrorHandler } from "../middleware/errorHandler.ts";
import { jsonError } from "../middleware/jsonResponse.ts";
import { handleCORS, addCORSHeaders } from "../middleware/cors.ts";
import { healthHandler } from "./handlers/health.ts";
import { hashHandler } from "./handlers/hashContent.ts";
import { storeContentHandler } from "./handlers/storeContent.ts";
import { retrieveContentHandler } from "./handlers/retrieveContent.ts";

const routes: Route[] = [
  { method: "GET", pattern: "/health", handler: healthHandler },
  { method: "POST", pattern: "/hash", handler: withErrorHandler(hashHandler) },
  { method: "POST", pattern: "/content", handler: withErrorHandler(storeContentHandler) },
  {
    method: "GET",
    pattern: /^\/content\/([a-f0-9]{64})$/,
    handler: retrieveContentHandler
  },
];

interface MatchResult {
  handler: Route["handler"];
  params: Record<string, string>;
}

function matchRoute(method: string, pathname: string): MatchResult | null {
  for (const route of routes) {
    if (route.method !== method) continue;

    if (typeof route.pattern === "string") {
      if (route.pattern === pathname) {
        return { handler: route.handler, params: {} };
      }
    } else {
      const match = pathname.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        // For the retrieve content route, capture the hash
        if (pathname.startsWith("/content/")) {
          params.hash = match[1];
        }
        return { handler: route.handler, params };
      }
    }
  }

  return null;
}

export function createRouter(context: AppContext) {
  return async (req: Request): Promise<Response> => {
    const corsOptions = { origin: context.config.corsOrigin };

    // Handle CORS preflight requests
    const corsResponse = handleCORS(req, corsOptions);
    if (corsResponse) {
      return corsResponse;
    }

    const url = new URL(req.url);
    const match = matchRoute(req.method, url.pathname);

    if (!match) {
      const errorResponse = jsonError("Not found", 404);
      return addCORSHeaders(errorResponse, corsOptions);
    }

    const response = await match.handler(req, match.params, context);
    return addCORSHeaders(response, corsOptions);
  };
}
