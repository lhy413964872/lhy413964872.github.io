import { createCopyResponse, publicError } from "../../api/shared/openai-copy.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const result = await createCopyResponse(payload);
    return {
      statusCode: 200,
      headers: {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    const { status, body } = publicError(error);
    return {
      statusCode: status,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    };
  }
}
