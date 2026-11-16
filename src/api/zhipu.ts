import type { ImageSize } from "../types";

const API_BASE = "/api/paas/v4";
const API_KEY = import.meta.env.VITE_ZHIPU_API_KEY;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatChoice {
  message?: { content?: string };
}

interface ChatResponse {
  choices?: ChatChoice[];
}

interface ImageResponse {
  data?: Array<{ url?: string }>;
}

interface ApiErrorBody {
  error?: { message?: string };
  message?: string;
}

function requireApiKey(): string {
  if (!API_KEY) {
    throw new Error(
      "未检测到 API Key：请复制 .env.example 为 .env.local，填入 VITE_ZHIPU_API_KEY 后重启开发服务器"
    );
  }
  return API_KEY;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (body.error && body.error.message) {
      return body.error.message;
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // 响应体不是 JSON 时走默认提示
  }
  return "请求失败（HTTP " + response.status + "），请稍后重试";
}

function jsonHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey
  };
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(API_BASE + "/chat/completions", {
    method: "POST",
    headers: jsonHeaders(requireApiKey()),
    body: JSON.stringify({ model: "glm-4-flash", messages })
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  const data = (await response.json()) as ChatResponse;
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("模型未返回有效内容，请稍后重试");
  }
  return content.trim();
}

export async function generateImage(prompt: string, size: ImageSize): Promise<string> {
  const response = await fetch(API_BASE + "/images/generations", {
    method: "POST",
    headers: jsonHeaders(requireApiKey()),
    body: JSON.stringify({ model: "cogview-3", prompt, size })
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  const data = (await response.json()) as ImageResponse;
  const url = data.data && data.data[0] && data.data[0].url;
  if (typeof url !== "string" || !url) {
    throw new Error("接口未返回图片地址，请稍后重试");
  }
  return url;
}
