import { ContentService } from "../../services/contentService.ts";
import { textResponse, jsonError } from "../../middleware/jsonResponse.ts";
import type { RouteHandler } from "../../middleware/types.ts";

export const retrieveContentHandler: RouteHandler = async (_req, params, context) => {
  const hash = params.hash;

  const contentService = new ContentService(context.storage, context.config.secretSalt);
  const content = await contentService.retrieveContent(hash);

  if (!content) {
    return jsonError("Not found", 404);
  }

  return textResponse(content);
};
