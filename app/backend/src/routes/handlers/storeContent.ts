import { ContentService } from "../../services/contentService.ts";
import { jsonSuccess, jsonError } from "../../middleware/jsonResponse.ts";
import { parseJsonBody, validateTextField } from "../../middleware/validation.ts";
import type { RouteHandler } from "../../middleware/types.ts";

export const storeContentHandler: RouteHandler = async (req, _params, context) => {
  const body = await parseJsonBody(req);

  if (!validateTextField(body)) {
    return jsonError("Invalid request body. Must include 'text' field.", 400);
  }

  const contentService = new ContentService(context.storage, context.config.secretSalt);
  const hash = await contentService.storeContent(body.text);

  return jsonSuccess({ url: `/content/${hash}` });
};
