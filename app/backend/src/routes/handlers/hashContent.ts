import { hashWithSalt, isValidData } from "../../hash.ts";
import { jsonSuccess, jsonError } from "../../middleware/jsonResponse.ts";
import { parseJsonBody } from "../../middleware/validation.ts";
import type { RouteHandler } from "../../middleware/types.ts";

export const hashHandler: RouteHandler = async (req, _params, context) => {
  const body = await parseJsonBody(req);

  if (!isValidData(body)) {
    return jsonError("Invalid request body. Must be a JSON object.", 400);
  }

  const hash = hashWithSalt(body, context.config.secretSalt);

  return jsonSuccess({ hash });
};
