"use client";

import { useMemo, useState } from "react";
import type { TripDay, TripPlace, TripPlan } from "@/app/types/trip";
import TripPlaceSortableList from "@/app/components/TripPlaceSortableList";

interface CustomTripPlannerProps {
  plan: TripPlan | null;
  onChange: (plan: TripPlan) => void;
}

const emptyPlace = (day: number, order: number): TripPlace => ({
  id: crypto.randomUUID(),
  day,
  order,
  name: "",
  category: "관광",
  description: "",
  lat: 37.5665,
  lng: 126.978,
  stayMinutes: 60,
});

const createEmptyPlan = (): TripPlan => ({
  destination: "",
  durationLabel: "당일치기",
  summary: "내가 직접 장소를 추가하고 순서를 정리하는 여행 계획입니다.",
  days: [{ day: 1, title: "내 여행 코스", places: [] }],
});

export default function CustomTripPlanner({ plan, onChange }: CustomTripPlannerProps) {
  const [destination, setDestination] = useState(plan?.destination ?? "");
  const [activeDay, setActiveDay] = useState(1);
  const [newPlaceName, setNewPlaceName] = useState("");



  const currentPlan = plan ?? createEmptyPlan();
  const currentDay = currentPlan.days.find((day) => day.day === activeDay) ?? currentPlan.days[0];

  const syncPlan = (next: TripPlan) => onChange(next);

  const ensurePlan = () => {
    if (plan) return plan;
    const next = createEmptyPlan();
    next.destination = destination.trim();
    return next;
  };

  const updateDay = (dayNumber: number, updater: (day: TripDay) => TripDay) => {
    const base = ensurePlan();
    syncPlan({
      ...base,
      days: base.days.map((day) => (day.day === dayNumber ? updater(day) : day)),
    });
  };

  const addPlace = () => {
    const name = newPlaceName.trim();
    if (!name) return;

    const base = ensurePlan();
    const day = base.days.find((item) => item.day === activeDay) ?? base.days[0];
    const place = emptyPlace(day.day, day.places.length + 1);

    syncPlan({
      ...base,
      days: base.days.map((current) =>
        current.day === day.day
          ? { ...current, places: [...current.places, { ...place, name }] }
          : current,
      ),
    });
    setNewPlaceName("");
  };

  const removePlace = (placeId: string) => {
    updateDay(activeDay, (day) => ({
      ...day,
      places: day.places
        .filter((place) => place.id !== placeId)
        .map((place, index) => ({ ...place, order: index + 1 })),
    }));
  };

  const movePlace = (index: number, direction: -1 | 1) => {
    updateDay(activeDay, (day) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= day.places.length) return day;
      const places = [...day.places];
      [places[index], places[nextIndex]] = [places[nextIndex], places[index]];
      return {
        ...day,
        places: places.map((place, placeIndex) => ({ ...place, order: placeIndex + 1 })),
      };
    });
  };



  const updatePlace = (placeId: string, field: "name" | "category" | "description", value: string) => {
    updateDay(activeDay, (day) => ({
      ...day,
      places: day.places.map((place) =>
        place.id === placeId ? { ...place, [field]: value } : place
      ),
    }));
  };

  const addDay = () => {
    const base = ensurePlan();
    const nextDay = base.days.length + 1;
    syncPlan({
      ...base,
      days: [...base.days, { day: nextDay, title: `DAY ${nextDay} 여행`, places: [] }],
    });
    setActiveDay(nextDay);
  };

  const destinationChanged = useMemo(
    () => destination !== currentPlan.destination,
    [destination, currentPlan.destination],
  );

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Custom Trip</p>
        <h2 className="mt-2 text-xl font-bold">내가 직접 여행 계획 만들기</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          AI를 사용하지 않고도 장소를 추가하고, 드래그하거나 버튼으로 순서를 바꾸고, 필요 없는 장소를 뺄 수 있습니다.
        </p>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold">여행지</label>
        <div className="flex gap-2">
          <input
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950"
          />
          <button
            type="button"
            disabled={!destinationChanged}
            onClick={() => {
              const base = ensurePlan();
              syncPlan({ ...base, destination: destination.trim() || "서울" });
            }}
            className="rounded-xl border border-neutral-200 px-3 text-xs font-semibold disabled:opacity-30 dark:border-neutral-700"
          >
            적용
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
        {currentPlan.days.map((day) => (
          <button
            key={day.day}
            type="button"
            onClick={() => setActiveDay(day.day)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${activeDay === day.day ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"}`}
          >
            DAY {day.day}
          </button>
        ))}
        <button
          type="button"
          onClick={addDay}
          className="shrink-0 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-500 dark:border-neutral-700"
        >
          + DAY
        </button>
      </div>

      <div className="mb-3 flex gap-2">
        <input
          value={newPlaceName}
          onChange={(event) => setNewPlaceName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addPlace()}
          placeholder="장소를 직접 추가해보세요"
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="button"
          onClick={addPlace}
          className="rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
        >
          추가
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {currentDay && currentDay.places.length > 0 ? (
          <TripPlaceSortableList
            places={currentDay.places}
            onUpdate={updatePlace}
            onMove={movePlace}
            onRemove={removePlace}
            onReorder={(places) => updateDay(activeDay, (day) => ({ ...day, places }))}
          />
        ) : (
          <div className="rounded-xl bg-neutral-50 p-6 text-center text-xs leading-5 text-neutral-400 dark:bg-neutral-950">
            아직 장소가 없습니다.<br />위 입력창에서 장소를 추가해주세요.
          </div>
        )}
      </div>
    </section>
  );
}
