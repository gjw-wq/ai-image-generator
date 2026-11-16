export type ImageSize = "1024x1024" | "768x1344" | "864x1152";

export type StyleId = "realistic" | "cartoon" | "oil" | "watercolor" | "cyberpunk";

export interface StyleOption {
  id: StyleId;
  label: string;
  keywords: string;
}

export type Phase = "idle" | "optimizing" | "generating";

export interface HistoryItem {
  id: string;
  prompt: string;
  size: ImageSize;
  style: StyleId;
  imageUrl: string;
  createdAt: number;
}
