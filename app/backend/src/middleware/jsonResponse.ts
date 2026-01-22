export function jsonSuccess(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function textResponse(content: string, status: number = 200): Response {
  return new Response(content, {
    status,
    headers: { "Content-Type": "text/plain" },
  });
}
