import { useEffect } from "react";
import type { HistoryItem } from "../types";

interface Props {
  item: HistoryItem;
  onClose: () => void;
  onDownload: (url: string) => void;
}

export default function Lightbox({ item, onClose, onDownload }: Props) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div className="flex max-h-full w-full max-w-3xl flex-col items-center" onClick={event => event.stopPropagation()}>
        <img
          src={item.imageUrl}
          alt={item.prompt}
          className="max-h-[72vh] w-full rounded-lg object-contain"
        />
        <p className="mt-4 max-w-full text-center text-xs leading-5 text-slate-200 line-clamp-3">
          {item.prompt}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => onDownload(item.imageUrl)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            下载图片
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-500 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            关闭（Esc）
          </button>
        </div>
      </div>
    </div>
  );
}
