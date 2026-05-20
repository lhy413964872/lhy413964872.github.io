const DEFAULT_MODEL = "gpt-5.5";
const MAX_BODY_BYTES = 64 * 1024;

const resultSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          kicker: { type: "string" },
          title: { type: "string" },
          score: { type: "number" },
          content: { type: "string" },
        },
        required: ["kicker", "title", "score", "content"],
      },
    },
    insights: {
      type: "object",
      additionalProperties: false,
      properties: {
        titleCount: { type: "number" },
        tagCount: { type: "number" },
        keywords: {
          type: "array",
          items: { type: "string" },
        },
        source: { type: "string" },
      },
      required: ["titleCount", "tagCount", "keywords", "source"],
    },
  },
  required: ["results", "insights"],
};

const systemPrompt = `
你是一个中文增长文案策略师，擅长小红书、抖音、公众号、朋友圈、电商详情页和 B 站内容。
根据用户提供的产品/活动/服务信息，生成可以直接发布或微调发布的爆款文案。

要求：
1. 输出必须是简体中文，语气自然、有转化感，不能像模板填空。
2. 必须围绕用户素材，不要编造不存在的价格、资质、销量、疗效或承诺。
3. 给出 4 个结果卡片：标题池、平台主文案、短视频/口播脚本、转化 CTA/卖点提炼。
4. 标题池至少包含 6 条标题，正文要有钩子、痛点、卖点、信任补强和行动引导。
5. score 是 0 到 100 的爆款潜力评分。
6. 只返回符合 JSON Schema 的对象，不要输出 Markdown。
`.trim();

class PublicError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "PublicError";
    this.status = status;
  }
}

function cleanString(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanKeywords(value) {
  const items = Array.isArray(value) ? value : String(value || "").split(/[,，]/);
  return [...new Set(items.map((item) => cleanString(item, 24)).filter(Boolean))].slice(0, 8);
}

function sanitizeInput(input) {
  const rawContent = cleanString(input?.rawContent, 6000);

  if (!rawContent) {
    throw new PublicError("请先输入要生成文案的内容。", 400);
  }

  return {
    rawContent,
    platform: cleanString(input?.platform, 40) || "小红书",
    platformValue: cleanString(input?.platformValue, 32) || "xiaohongshu",
    tone: cleanString(input?.tone, 40) || "真实种草",
    goal: cleanString(input?.goal, 40) || "下单/咨询",
    length: cleanString(input?.length, 20) || "medium",
    audience: cleanString(input?.audience, 120) || "正在寻找更好解决方案的人",
    painPoint: cleanString(input?.painPoint, 160) || "信息太多、选择成本高、怕花钱踩坑",
    offer: cleanString(input?.offer, 160) || "收藏或咨询了解更多",
    keywords: cleanKeywords(input?.keywords),
  };
}

function extractOutputText(responseBody) {
  if (typeof responseBody?.output_text === "string") {
    return responseBody.output_text;
  }

  for (const item of responseBody?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") {
        return content.text;
      }
    }
  }

  return "";
}

function parseJsonText(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) return JSON.parse(fenced[1]);

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }

    throw error;
  }
}

function normalizeResult(result) {
  return {
    kicker: cleanString(result?.kicker, 24) || "AI 文案",
    title: cleanString(result?.title, 80) || "生成结果",
    score: Math.max(0, Math.min(100, Math.round(Number(result?.score) || 88))),
    content: String(result?.content || "").trim().slice(0, 5000),
  };
}

function normalizeModelOutput(parsed, model) {
  const results = Array.isArray(parsed?.results)
    ? parsed.results.map(normalizeResult).filter((item) => item.content)
    : [];

  if (!results.length) {
    throw new PublicError("模型没有返回可用文案，请稍后再试。", 502);
  }

  const keywords = cleanKeywords(parsed?.insights?.keywords);

  return {
    model,
    provider: "openai",
    results: results.slice(0, 6),
    insights: {
      titleCount: Math.max(0, Math.round(Number(parsed?.insights?.titleCount) || 0)),
      tagCount: Math.max(0, Math.round(Number(parsed?.insights?.tagCount) || keywords.length)),
      keywords,
      source: cleanString(parsed?.insights?.source, 40) || "AI 模型",
    },
  };
}

function getRequestBody(input, env) {
  const model = env.OPENAI_MODEL || DEFAULT_MODEL;
  const body = {
    model,
    instructions: systemPrompt,
    input: JSON.stringify(input, null, 2),
    max_output_tokens: Number(env.OPENAI_MAX_OUTPUT_TOKENS || 3200),
    store: false,
    text: {
      format: {
        type: "json_schema",
        name: "viral_copy_result",
        schema: resultSchema,
        strict: true,
      },
    },
  };

  if (env.OPENAI_REASONING_EFFORT || model.startsWith("gpt-5")) {
    body.reasoning = { effort: env.OPENAI_REASONING_EFFORT || "low" };
  }

  return body;
}

export async function createCopyResponse(payload, env = process.env) {
  const apiKey = env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new PublicError("模型接口未配置 OPENAI_API_KEY。", 501);
  }

  const input = sanitizeInput(payload);
  const model = env.OPENAI_MODEL || DEFAULT_MODEL;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(getRequestBody(input, env)),
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = responseBody?.error?.message || "模型接口请求失败。";
    throw new PublicError(message, response.status || 502);
  }

  const outputText = extractOutputText(responseBody);
  const parsed = parseJsonText(outputText);
  return normalizeModelOutput(parsed, model);
}

export async function readNodeJson(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      throw new PublicError("请求内容过长。", 413);
    }
  }

  return body ? JSON.parse(body) : {};
}

export function sendNodeJson(response, status, data) {
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
}

export function publicError(error) {
  const status = Number(error?.status) || 500;
  return {
    status,
    body: {
      error: error?.message || "模型接口暂时不可用。",
    },
  };
}

export async function handleNodeGenerate(request, response) {
  if (request.method !== "POST") {
    sendNodeJson(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const payload = await readNodeJson(request);
    const result = await createCopyResponse(payload);
    sendNodeJson(response, 200, result);
  } catch (error) {
    const { status, body } = publicError(error);
    sendNodeJson(response, status, body);
  }
}
