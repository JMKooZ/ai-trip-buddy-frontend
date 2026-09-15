"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import RegionTabs from "@/app/components/map/RegionTabs";
import ThemeToggle from "@/app/components/ThemeToggle";
import TripPlanner from "@/app/components/TripPlanner";
import CustomTripPlanner from "@/app/components/CustomTripPlanner";
import type { RegionMode } from "@/app/types/map";
import type { TripPlan } from "@/app/types/trip";

const DomesticMap = dynamic(() => import("@/app/components/map/DomesticMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[620px] items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
      국내 지도를 준비하는 중입니다...
    </div>
  ),
});

const OverseasMap = dynamic(() => import("@/app/components/map/OverseasMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[620px] items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
      해외 지도를 준비하는 중입니다...
    </div>
  ),
});

export default function Home() {
  const [mode, setMode] = useState<RegionMode>("domestic");
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [plannerMode, setPlannerMode] = useState<"ai" | "custom">("ai");
  const [selectedDay, setSelectedDay] = useState(1);
  const [mapSearchRequest, setMapSearchRequest] = useState({
    query: "",
    id: 0,
  });

  const selectedDayPlan = tripPlan?.days.find(
    (day) => day.day === selectedDay,
  );

  const handlePlanGenerated = (plan: TripPlan) => {
    setTripPlan(plan);
    setSelectedDay(plan.days[0]?.day ?? 1);
  };

  const updateTripPlanPlaces = (
    places: TripPlan["days"][number]["places"],
  ) => {
    if (!tripPlan) return;

    setTripPlan({
      ...tripPlan,
      days: tripPlan.days.map((day) =>
        day.day === selectedDay ? { ...day, places } : day,
      ),
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-6 px-4 py-6 transition-colors duration-500 md:px-8 md:py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            AI-Trip Buddy
          </h1>
          <p className="mt-1 text-xs text-neutral-500 md:text-sm">
            여행을 계획하는 시간을 줄여주는 AI 여행 플래너
          </p>
        </div>
        <ThemeToggle />
      </header>

      <RegionTabs value={mode} onChange={setMode} />

      <section className="grid min-h-[720px] gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="min-h-0">
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="grid grid-cols-2 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => setPlannerMode("ai")}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  plannerMode === "ai"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white"
                    : "text-neutral-500"
                }`}
              >
                AI 추천 일정
              </button>
              <button
                type="button"
                onClick={() => setPlannerMode("custom")}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  plannerMode === "custom"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white"
                    : "text-neutral-500"
                }`}
              >
                내 여행 계획
              </button>
            </div>

            {plannerMode === "ai" ? (
              <TripPlanner
                onPlanGenerated={handlePlanGenerated}
                onMapSearch={(query) =>
                  setMapSearchRequest((current) => ({
                    query,
                    id: current.id + 1,
                  }))
                }
              />
            ) : (
              <CustomTripPlanner plan={tripPlan} onChange={setTripPlan} />
            )}
          </div>
        </div>

        <div className="relative min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="absolute left-4 top-4 z-20 rounded-xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-neutral-700 dark:bg-neutral-950/95">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {tripPlan
                ? plannerMode === "ai"
                  ? "AI Trip Preview"
                  : "Custom Trip"
                : "Trip Map"}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {tripPlan
                ? `${tripPlan.destination} · ${tripPlan.durationLabel}`
                : "여행 조건을 입력해보세요"}
            </p>
          </div>

          <div className="h-full min-h-[720px]">
            {mode === "domestic" ? (
              <DomesticMap
                plannedPlaces={selectedDayPlan?.places ?? []}
                showHistory
                searchRequest={mapSearchRequest}
                tripPlan={tripPlan}
                plannerMode={plannerMode}
                selectedDay={selectedDay}
                onSelectedDayChange={setSelectedDay}
                onPlacesChange={updateTripPlanPlaces}
              />
            ) : (
              <OverseasMap />
            )}
          </div>
        </div>
      </section>

      {tripPlan && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {plannerMode === "ai" ? "AI Structure" : "Custom Structure"}
              </p>
              <h2 className="mt-1 text-lg font-bold">
                {tripPlan.destination} 여행 구조
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-neutral-500">
              {tripPlan.summary}
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {tripPlan.days.map((day) => (
              <button
                key={day.day}
                type="button"
                onClick={() => setSelectedDay(day.day)}
                className={`rounded-xl border p-4 text-left ${
                  selectedDay === day.day
                    ? "border-neutral-900 dark:border-white"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">
                    DAY {day.day}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {day.places.length}곳
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">{day.title}</p>
                <p className="mt-2 truncate text-xs text-neutral-500">
                  {day.places.map((place) => place.name).join(" → ")}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
