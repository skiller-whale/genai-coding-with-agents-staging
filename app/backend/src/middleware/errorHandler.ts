import { jsonError } from "./jsonResponse.ts";
import type { RouteHandler, AppContext } from "./types.ts";

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: Request, params: Record<string, string>, context: AppContext) => {
    try {
      return await handler(req, params, context);
    } catch (error) {
      console.error("Handler error:", error);

      // Check if it's a JSON parsing error
      if (error instanceof SyntaxError) {
        return jsonError("Invalid JSON in request body", 400);
      }

      // Generic error response
      return jsonError("Internal server error", 500);
    }
  };
}
