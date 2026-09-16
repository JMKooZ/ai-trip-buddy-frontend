"use client";

import { useRef } from "react";
import TripPlaceSortableList from "@/app/components/TripPlaceSortableList";
import type { TripPlace, TripPlan } from "@/app/types/trip";

export default function DomesticTripPlannerPanel({
  tripPlan,
  plannerMode,
  selectedDay,
  open,
  onToggle,
  onSelectedDayChange,
  onPlaceUpdate,
  onPlaceMove,
  onPlaceRemove,
  onPlaceAdd,
  onPlacesChange,
}: {
  tripPlan: TripPlan;
  plannerMode: "ai" | "custom";
  selectedDay: number;
  open: boolean;
  onToggle: (open: boolean) => void;
  onSelectedDayChange?: (day: number) => void;
  onPlaceUpdate?: (placeId: string, field: "name" | "category" | "description", value: string) => void;
  onPlaceMove?: (index: number, direction: -1 | 1) => void;
  onPlaceRemove?: (placeId: string) => void;
  onPlaceAdd?: (name: string) => void;
  onPlacesChange?: (places: TripPlace[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const plannedPlaces = tripPlan.days.find((day) => day.day === selectedDay)?.places ?? [];

  const submit = () => {
    const name = inputRef.current?.value.trim() ?? "";
    if (!name) return;
    onPlaceAdd?.(name);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => onToggle(!open)}
        className={`absolute bottom-1/2 left-2 z-30 flex h-9 w-7 translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-neutral-200/70 bg-white/80 text-sm font-medium text-neutral-400 shadow-sm backdrop-blur transition-all duration-300 hover:bg-white/95 hover:text-neutral-700 dark:border-neutral-700/70 dark:bg-neutral-950/80 dark:text-neutral-500 dark:hover:bg-neutral-900/95 ${open ? "translate-x-[348px] max-[520px]:translate-x-[78vw]" : "translate-x-0"}`}
        aria-label={open ? "여행 일정 패널 닫기" : "여행 일정 패널 열기"}
      >
        {open ? "‹" : "›"}
      </button>

      <aside className={`absolute inset-y-0 left-0 z-20 w-[380px] max-w-[88%] p-3 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-2xl backdrop-blur dark:border-neutral-700 dark:bg-neutral-950/95">
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{plannerMode === "ai" ? "AI Trip" : "Custom Trip"}</p>
              <h2 className="mt-1 text-sm font-bold">여행 일정</h2>
            </div>
            <button type="button" onClick={() => onToggle(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white">×</button>
          </div>

          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
            {tripPlan.days.map((day) => (
              <button key={day.day} type="button" onClick={() => onSelectedDayChange?.(day.day)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${selectedDay === day.day ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                DAY {day.day}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <p className="text-sm font-bold">{tripPlan.days.find((day) => day.day === selectedDay)?.title}</p>
            <p className="mt-1 text-[11px] text-neutral-400">왼쪽 핸들을 잡고 드래그하거나 ↑ ↓ 버튼으로 순서를 변경하세요.</p>

            <div className="mb-3 mt-3 flex gap-2">
              <input ref={inputRef} placeholder="장소 추가" className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900" onKeyDown={(event) => { if (event.key === "Enter") submit(); }} />
              <button type="button" onClick={submit} className="rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">추가</button>
            </div>

            <TripPlaceSortableList
              places={plannedPlaces}
              compact
              onUpdate={onPlaceUpdate}
              onMove={onPlaceMove}
              onRemove={onPlaceRemove}
              onReorder={(places) => onPlacesChange?.(places)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
