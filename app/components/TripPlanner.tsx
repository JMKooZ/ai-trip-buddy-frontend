"use client";

import { useMemo, useState } from "react";
import type { TripDuration, TripPlan, TravelStyle } from "@/app/types/trip";
import RegionSearchBar from "@/app/components/map/RegionSearchBar";

interface TripPlannerProps {
  onPlanGenerated: (plan: TripPlan) => void;
  onMapSearch: (query: string) => void;
}

const TRAVEL_STYLES: TravelStyle[] = [
  "맛집",
  "카페",
  "자연",
  "관광",
  "휴식",
  "액티비티",
];

const DESTINATION_PRESETS = ["제주도", "서울", "부산"];

export default function TripPlanner({
  onPlanGenerated,
  onMapSearch,
}: TripPlannerProps) {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState<TripDuration>("day");
  const [nights, setNights] = useState(1);
  const [styles, setStyles] = useState<TravelStyle[]>([]);
  const [request, setRequest] = useState("");
  const [generating, setGenerating] = useState(false);

  const durationText = useMemo(() => {
    return duration === "day" ? "당일치기" : `${nights}박 ${nights + 1}일`;
  }, [duration, nights]);

  const toggleStyle = (style: TravelStyle) => {
    setStyles((prev) =>
      prev.includes(style)
        ? prev.filter((item) => item !== style)
        : [...prev, style]
    );
  };

  const handleGenerate = async () => {
    const normalizedDestination = destination.trim();

    if (!normalizedDestination) {
      window.alert("여행지를 입력해 주세요.");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: normalizedDestination,
          duration,
          nights: duration === "stay" ? nights : null,
          travelStyles: styles,
          request: request.trim(),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "여행 일정 생성에 실패했습니다.");
      }

      const plan = (await response.json()) as TripPlan;
      onPlanGenerated(plan);
    } catch (error) {
      console.error("여행 일정 생성 실패", error);
      window.alert("여행 일정을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:p-6">
      <div className="mb-6">
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Trip Map Search
          </p>
          <RegionSearchBar
            placeholder="지역이나 장소를 검색해보세요"
            onSearch={onMapSearch}
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          AI Trip Planner
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight md:text-2xl">
          어디로, 얼마나 떠날까요?
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          여행 조건을 입력하면 AI가 먼저 전체 동선을 구조화하고,
          그 다음 장소를 하나씩 조정할 수 있게 만드는 흐름입니다.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-sm font-semibold">여행지</label>
          <input
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="예: 제주도, 부산, 서울"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
          />

          <div className="mt-2 flex flex-wrap gap-2">
            {DESTINATION_PRESETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDestination(item)}
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:border-neutral-400 dark:border-neutral-700"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">여행 기간</label>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setDuration("day")}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                duration === "day"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white"
                  : "text-neutral-500"
              }`}
            >
              당일치기
            </button>
            <button
              type="button"
              onClick={() => setDuration("stay")}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                duration === "stay"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white"
                  : "text-neutral-500"
              }`}
            >
              숙박 여행
            </button>
          </div>

          {duration === "stay" && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-700">
              <span className="text-sm text-neutral-500">숙박</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNights((value) => Math.max(1, value - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-semibold">
                  {durationText}
                </span>
                <button
                  type="button"
                  onClick={() => setNights((value) => Math.min(7, value + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">여행 스타일</label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((style) => {
              const selected = styles.includes(style);

              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium ${
                    selected
                      ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700"
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">원하는 여행이 있다면</label>
          <textarea
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="예: 너무 빡빡하지 않게, 맛집은 꼭 포함해줘"
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 outline-none focus:border-neutral-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
          />
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="w-full rounded-xl bg-neutral-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          {generating ? "AI가 여행 구조를 만드는 중..." : "AI로 여행 일정 만들기"}
        </button>
      </div>
    </section>
  );
}
