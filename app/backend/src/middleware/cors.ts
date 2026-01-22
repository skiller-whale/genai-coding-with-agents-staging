export interface CORSOptions {
  origin: string;
  methods?: string;
  headers?: string;
}

const DEFAULT_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const DEFAULT_HEADERS = "Content-Type, Authorization";

export function createCORSHeaders(options: CORSOptions): HeadersInit {
  return {
    "Access-Control-Allow-Origin": options.origin,
    "Access-Control-Allow-Methods": options.methods || DEFAULT_METHODS,
    "Access-Control-Allow-Headers": options.headers || DEFAULT_HEADERS,
  };
}

export function handleCORS(req: Request, options: CORSOptions): Response | null {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: createCORSHeaders(options),
    });
  }

  return null;
}

export function addCORSHeaders(response: Response, options: CORSOptions): Response {
  const corsHeaders = createCORSHeaders(options);
  const headers = new Headers(response.headers);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
