import type { ImageSize, StyleId, StyleOption } from "./types";

export const IMAGE_SIZES: Array<{ value: ImageSize; label: string; desc: string }> = [
  { value: "1024x1024", label: "方形", desc: "1024 x 1024" },
  { value: "768x1344", label: "竖版", desc: "768 x 1344" },
  { value: "864x1152", label: "海报", desc: "864 x 1152" }
];

export const STYLES: StyleOption[] = [
  { id: "realistic", label: "写实", keywords: "photorealistic, realistic, highly detailed" },
  { id: "cartoon", label: "卡通", keywords: "cartoon style, cute, vibrant colors" },
  { id: "oil", label: "油画", keywords: "oil painting, artistic, impressionist style" },
  { id: "watercolor", label: "水彩", keywords: "watercolor painting, soft colors, delicate brushwork" },
  { id: "cyberpunk", label: "赛博朋克", keywords: "cyberpunk, neon lights, futuristic city" }
];

export const STYLE_KEYWORDS: Record<StyleId, string> = STYLES.reduce(
  (map, option) => {
    map[option.id] = option.keywords;
    return map;
  },
  {} as Record<StyleId, string>
);
