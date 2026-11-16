import { useState } from "react";
import type { HistoryItem } from "../types";
import { formatDateTime } from "../utils";

interface Props {
  items: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onPreview: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export default function HistorySidebar({ items, activeId, onSelect, onPreview, onDelete }: Props) {
  const [brokenMap, setBrokenMap] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-400 shadow-sm">
        暂无历史记录，生成图片后会保存在这里
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700">历史记录</h2>
        <span className="text-xs text-slate-400">{items.length} 条</span>
      </div>
      <ul className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
        {items.map(item => {
          const broken = brokenMap[item.id] === true;
          return (
            <li
              key={item.id}
              className={
                "flex cursor-pointer gap-3 rounded-lg border p-2 transition hover:border-slate-300 " +
                (activeId === item.id ? "border-indigo-400 bg-indigo-50/60" : "border-slate-200")
              }
              onClick={() => onSelect(item)}
            >
              <div className="h-16 w-16 flex-none overflow-hidden rounded-md bg-slate-100">
                {broken ? (
                  <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] leading-tight text-slate-400">
                    链接已失效
                  </div>
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onClick={event => {
                      event.stopPropagation();
                      onPreview(item);
                    }}
                    onError={() => setBrokenMap(prev => ({ ...prev, [item.id]: true }))}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs leading-5 text-slate-600">{item.prompt}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {formatDateTime(item.createdAt)} · {item.size}
                </p>
              </div>
              <button
                type="button"
                title="删除"
                aria-label="删除该记录"
                onClick={event => {
                  event.stopPropagation();
                  onDelete(item.id);
                }}
                className="flex h-7 w-7 flex-none items-center justify-center self-start rounded text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
