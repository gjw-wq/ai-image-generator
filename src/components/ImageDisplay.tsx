import { useEffect, useState } from "react";
import type { HistoryItem, Phase } from "../types";
import { formatDateTime } from "../utils";

interface Props {
  current: HistoryItem | null;
  phase: Phase;
  elapsed: number;
  onDownload: (url: string) => void;
}

export default function ImageDisplay({ current, phase, elapsed, onDownload }: Props) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [current]);

  if (phase === "generating") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></span>
        <p className="mt-4 text-sm font-medium text-slate-700">正在生成图片，请稍候…</p>
        <p className="mt-1 text-xs text-slate-400">
          通常需要 10~30 秒，请耐心等待（已等待 {elapsed} 秒）
        </p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-400">输入描述并点击「生成图片」，结果会显示在这里</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700">生成结果</h2>
        <span className="text-xs text-slate-400">{formatDateTime(current.createdAt)}</span>
      </div>
      {imageError ? (
        <div className="mt-4 flex min-h-[280px] flex-col items-center justify-center rounded-lg bg-slate-50 text-center">
          <p className="text-sm text-slate-500">图片加载失败</p>
          <p className="mt-1 text-xs text-slate-400">
            图片链接可能已过期（智谱返回的图片 URL 有时效），可重新生成
          </p>
        </div>
      ) : (
        <img
          src={current.imageUrl}
          alt={current.prompt}
          className="mt-4 max-h-[480px] w-full rounded-lg object-contain"
          onError={() => setImageError(true)}
        />
      )}
      <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">{current.prompt}</p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onDownload(current.imageUrl)}
          disabled={imageError}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          下载图片
        </button>
        <span className="text-xs text-slate-400">文件名格式：ai-image-时间戳.png</span>
      </div>
    </div>
  );
}
