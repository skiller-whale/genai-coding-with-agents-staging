import type { IStorage } from "../storage/index.ts";
import type { AppConfig } from "../config/index.ts";

export interface AppContext {
  storage: IStorage;
  config: AppConfig;
}

export type RouteHandler = (
  req: Request,
  params: Record<string, string>,
  context: AppContext
) => Promise<Response> | Response;

export interface Route {
  method: string;
  pattern: string | RegExp;
  handler: RouteHandler;
}
