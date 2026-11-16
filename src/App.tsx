import { useEffect, useState } from "react";
import type { HistoryItem, ImageSize, Phase, StyleId } from "./types";
import { IMAGE_SIZES, STYLES, STYLE_KEYWORDS } from "./constants";
import { chatCompletion, generateImage } from "./api/zhipu";
import { downloadImage } from "./utils";
import ImageDisplay from "./components/ImageDisplay";
import HistorySidebar from "./components/HistorySidebar";
import Lightbox from "./components/Lightbox";

const HISTORY_KEY = "ai-image-generator:history";

function isValidItem(value: unknown): value is HistoryItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.prompt === "string" &&
    typeof item.imageUrl === "string" &&
    typeof item.createdAt === "number" &&
    typeof item.size === "string" &&
    typeof item.style === "string"
  );
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isValidItem);
  } catch {
    return [];
  }
}

function createId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<ImageSize>("1024x1024");
  const [style, setStyle] = useState<StyleId>("realistic");
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [lightbox, setLightbox] = useState<HistoryItem | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // 存储不可用时忽略，不影响主流程
    }
  }, [history]);

  useEffect(() => {
    if (phase !== "generating") {
      setElapsed(0);
      return;
    }
    const timer = window.setInterval(() => setElapsed(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const busy = phase !== "idle";

  const handleStyleChange = (next: StyleId) => {
    if (next === style) {
      return;
    }
    setPrompt(prev => {
      const previousKeywords = STYLE_KEYWORDS[style];
      let cleaned = prev;
      if (previousKeywords && prev.includes(previousKeywords)) {
        cleaned = prev.split(previousKeywords).join("");
        cleaned = cleaned.replace(/^[,\s]+|[,\s]+$/g, "");
        cleaned = cleaned.replace(/,\s*,/g, ",");
      }
      const keywords = STYLE_KEYWORDS[next];
      if (!cleaned) {
        return keywords;
      }
      return cleaned + ", " + keywords;
    });
    setStyle(next);
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      setError("请先输入图片描述，再优化提示词");
      return;
    }
    setPhase("optimizing");
    setError("");
    try {
      const optimized = await chatCompletion([
        {
          role: "system",
          content:
            "你是一位专业的 AI 绘画提示词工程师。请把用户的简短描述扩展成一段详细的英文图片生成提示词，必须涵盖主体细节、环境背景、光线、色彩、构图、质量词（例如 high quality, 4K）。只输出最终的英文提示词本身，不要任何解释、前缀、引号或换行说明。"
        },
        { role: "user", content: prompt.trim() }
      ]);
      setPrompt(optimized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "优化提示词失败，请稍后重试");
    } finally {
      setPhase("idle");
    }
  };

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("请先输入图片描述");
      return;
    }
    setPhase("generating");
    setError("");
    try {
      const imageUrl = await generateImage(trimmed, size);
      const item: HistoryItem = {
        id: createId(),
        prompt: trimmed,
        size,
        style,
        imageUrl,
        createdAt: Date.now()
      };
      setCurrent(item);
      setHistory(prev => [item, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片生成失败，请稍后重试");
    } finally {
      setPhase("idle");
    }
  };

  const handleDownload = async (url: string) => {
    try {
      await downloadImage(url);
    } catch {
      window.open(url, "_blank");
      setError("图片下载失败，已在新窗口打开原图链接，请右键另存为");
    }
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (current && current.id === id) {
      setCurrent(null);
    }
    if (lightbox && lightbox.id === id) {
      setLightbox(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
          <h1 className="text-2xl font-bold lg:text-3xl">AI 图片生成器</h1>
          <p className="mt-1 text-sm text-slate-500">
            输入描述，选择尺寸与风格，一键生成图片（智谱 CogView-3）
          </p>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3 lg:px-6">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
            <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-slate-700">
              图片描述
            </label>
            <textarea
              id="prompt"
              rows={5}
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              placeholder="描述你想生成的画面，例如：一只橘猫坐在窗台上看着外面的雨……"
              className="w-full resize-y rounded-lg border border-slate-300 p-3 text-sm leading-6 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-slate-700">图片尺寸</p>
              <div className="grid grid-cols-3 gap-2">
                {IMAGE_SIZES.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSize(option.value)}
                    className={
                      "rounded-lg border px-3 py-2 text-sm transition " +
                      (size === option.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400")
                    }
                  >
                    <span className="block font-medium">{option.label}</span>
                    <span className="block text-xs text-slate-400">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-slate-700">画面风格</p>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleStyleChange(option.id)}
                    className={
                      "rounded-full border px-4 py-1.5 text-sm transition " +
                      (style === option.id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400")
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                切换风格时，对应风格关键词会自动追加到描述末尾
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleOptimize}
                disabled={busy || !prompt.trim()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {phase === "optimizing" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                ) : null}
                {phase === "optimizing" ? "优化中…" : "优化提示词"}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={busy || !prompt.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {phase === "generating" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : null}
                {phase === "generating" ? "生成中…" : "生成图片"}
              </button>
            </div>
          </div>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}
          <ImageDisplay
            current={current}
            phase={phase}
            elapsed={elapsed}
            onDownload={handleDownload}
          />
        </section>
        <aside>
          <HistorySidebar
            items={history}
            activeId={current ? current.id : null}
            onSelect={item => {
              setCurrent(item);
              setError("");
            }}
            onPreview={setLightbox}
            onDelete={handleDelete}
          />
        </aside>
      </main>
      {lightbox ? (
        <Lightbox
          item={lightbox}
          onClose={() => setLightbox(null)}
          onDownload={handleDownload}
        />
      ) : null}
    </div>
  );
}
