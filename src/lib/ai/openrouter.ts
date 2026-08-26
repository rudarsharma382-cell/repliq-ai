const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export function openRouterConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function openRouterModel() {
  return process.env.OPENROUTER_MODEL || "qwen/qwen3-coder";
}

export function openRouterVisionModel() {
  return process.env.OPENROUTER_VISION_MODEL || "qwen/qwen2.5-vl-72b-instruct";
}

export function openRouterVisionModels() {
  const models = [
    openRouterVisionModel(),
    "qwen/qwen2.5-vl-72b-instruct",
    "google/gemini-2.5-flash",
    "google/gemini-2.0-flash-001",
    "qwen/qwen-vl-plus",
  ];
  return [...new Set(models.filter(Boolean))];
}

export function openRouterFallbackModel() {
  const primary = openRouterModel();
  if (primary.endsWith(":free")) return primary;
  if (primary === "qwen/qwen3-coder") return "qwen/qwen3-coder:free";
  return `${primary}:free`;
}

export function tokenBudget(kind: "analyze" | "generate" | "edit") {
  const fromEnv = (name: string, fallback: number) => {
    const raw = Number(process.env[name]);
    return Number.isFinite(raw) && raw > 0 ? raw : fallback;
  };

  if (kind === "analyze") return fromEnv("OPENROUTER_MAX_TOKENS_ANALYZE", 1024);
  if (kind === "edit") return fromEnv("OPENROUTER_MAX_TOKENS_EDIT", 3072);
  return fromEnv("OPENROUTER_MAX_TOKENS_GENERATE", 6144);
}

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
};

export type ModelUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type CompletionResult = {
  content: string;
  model: string;
  usage: ModelUsage;
};

type OpenRouterError = {
  message?: string;
  code?: number | string;
  metadata?: { raw?: string; provider_name?: string };
};

type OpenRouterPayload = {
  error?: OpenRouterError | string;
  model?: string;
  usage?: Partial<ModelUsage>;
  choices?: Array<{
    finish_reason?: string;
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

function payloadErrorMessage(payload: OpenRouterPayload, status: number) {
  const err = payload.error;
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object") {
    const parts = [err.message, err.metadata?.raw].filter(Boolean);
    if (parts.length) return parts.join(" — ");
  }
  return `OpenRouter request failed (${status})`;
}

function choiceContent(payload: OpenRouterPayload) {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part.text || ""))
      .join("")
      .trim();
  }
  return "";
}

function usageFrom(payload: OpenRouterPayload): ModelUsage {
  return {
    prompt_tokens: Number(payload.usage?.prompt_tokens) || 0,
    completion_tokens: Number(payload.usage?.completion_tokens) || 0,
    total_tokens: Number(payload.usage?.total_tokens) || 0,
  };
}

function addUsage(a: ModelUsage, b: ModelUsage): ModelUsage {
  return {
    prompt_tokens: a.prompt_tokens + b.prompt_tokens,
    completion_tokens: a.completion_tokens + b.completion_tokens,
    total_tokens: a.total_tokens + b.total_tokens,
  };
}

export function emptyUsage(): ModelUsage {
  return { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
}

export function mergeUsage(...parts: ModelUsage[]) {
  return parts.reduce(addUsage, emptyUsage());
}

export function creditsFromTokens(totalTokens: number, kind: "generate" | "edit") {
  if (kind === "edit") {
    return Math.min(18, Math.max(4, Math.ceil(Math.max(totalTokens, 1) / 1800)));
  }
  return Math.min(36, Math.max(8, Math.ceil(Math.max(totalTokens, 1) / 2000)));
}

async function requestCompletion(
  model: string,
  messages: ChatMessage[],
  maxTokens: number
): Promise<CompletionResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Repliq AI",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.15,
      max_tokens: maxTokens,
    }),
  });

  let payload: OpenRouterPayload;
  try {
    payload = (await res.json()) as OpenRouterPayload;
  } catch {
    throw new Error(`OpenRouter returned a non-JSON response (${res.status})`);
  }

  if (!res.ok || payload.error) {
    const error = new Error(payloadErrorMessage(payload, res.status)) as Error & {
      status?: number;
      code?: number | string;
    };
    error.status = res.status;
    error.code = typeof payload.error === "object" ? payload.error.code : res.status;
    throw error;
  }

  const content = choiceContent(payload);
  if (!content) {
    throw new Error("OpenRouter returned an empty response");
  }

  return {
    content,
    model: payload.model || model,
    usage: usageFrom(payload),
  };
}

function shouldRetryFree(error: unknown, primary: string, fallback: string) {
  if (fallback === primary) return false;
  const status = (error as { status?: number; code?: number | string }).status;
  const code = (error as { code?: number | string }).code;
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    status === 402 ||
    code === 402 ||
    status === 403 ||
    message.includes("credit") ||
    message.includes("afford") ||
    message.includes("can only afford")
  );
}

export async function chatCompletion(
  messages: ChatMessage[],
  maxTokens = 4096,
  model = openRouterModel()
): Promise<CompletionResult> {
  try {
    return await requestCompletion(model, messages, maxTokens);
  } catch (error) {
    const fallback = openRouterFallbackModel();
    if (!shouldRetryFree(error, model, fallback)) throw error;
    console.warn(`[openrouter] ${model} failed. Retrying ${fallback}`);
    return await requestCompletion(fallback, messages, maxTokens);
  }
}

export async function visionCompletion(messages: ChatMessage[], maxTokens = 1024) {
  const models = openRouterVisionModels();
  let lastError: unknown;

  for (const model of models) {
    try {
      return await requestCompletion(model, messages, maxTokens);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "failed";
      console.warn(`[openrouter] vision ${model} skipped: ${message}`);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("No vision model available");
}

export function extractJsonObject(text: string): Record<string, unknown> {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

export function extractCode(text: string) {
  const fenced = text.match(/```(?:tsx|jsx|ts|js)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? text).trim();
}
