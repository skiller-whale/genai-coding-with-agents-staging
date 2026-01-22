export async function parseJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch (error) {
    throw new SyntaxError("Invalid JSON in request body");
  }
}

export function validateTextField(body: unknown): body is { text: string } {
  return (
    body !== null &&
    typeof body === "object" &&
    "text" in body &&
    typeof body.text === "string"
  );
}
