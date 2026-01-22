import { jsonSuccess } from "../../middleware/jsonResponse.ts";
import type { RouteHandler } from "../../middleware/types.ts";

export const healthHandler: RouteHandler = () => {
  return jsonSuccess({ status: "ok" });
};
