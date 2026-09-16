"use client";

import { formatRelativeTime } from "@/app/lib/format/relativeTime";
import type { HistoryEntry } from "./types";

export default function DomesticMapHistoryPanel({
  history,
  now,
  searching,
  onSelect,
}: {
  history: HistoryEntry[];
  now: number;
  searching: boolean;
  onSelect: (item: HistoryEntry) => void;
}) {
  return (
    <section className="min-h-0 flex-1 overflow-y-auto p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-neutral-400">검색하거나 지도에서 클릭한 기록은 자동으로 남습니다.</p>
        {searching && <span className="ml-3 shrink-0 text-[10px] text-neutral-400">검색 중...</span>}
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl bg-neutral-50 p-4 text-center text-xs leading-5 text-neutral-400 dark:bg-neutral-900">
          아직 검색·클릭 기록이 없습니다.
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <div key={item.id} className="history-item group">
              <button
                type="button"
                onClick={() => onSelect(item)}
                disabled={item.lat === null || item.lng === null}
                className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
              >
                <span className="history-index">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">{item.label}</span>
                  <span className="mt-1 block text-xs text-neutral-400">
                    {formatRelativeTime(item.timestamp, now)}
                    <span className="ml-2 opacity-60">{item.source === "search" ? "검색" : "지도 클릭"}</span>
                  </span>
                </span>
              </button>
              <a
                href={item.naverPlaceUrl || `https://map.naver.com/p/search/${encodeURIComponent([item.address, item.query || item.label].filter(Boolean).join(" "))}`}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="shrink-0 rounded-lg border border-neutral-200 px-2 py-1.5 text-[10px] font-semibold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                네이버
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
