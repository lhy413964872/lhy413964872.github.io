import { createCopyResponse, publicError } from "./shared/openai-copy.mjs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "64kb",
    },
  },
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const payload = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const result = await createCopyResponse(payload);
    response.setHeader("cache-control", "no-store");
    response.status(200).json(result);
  } catch (error) {
    const { status, body } = publicError(error);
    response.status(status).json(body);
  }
}
