"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAppDialog } from "@/app/components/ui/AppDialogProvider";
import RegionTabs from "@/app/components/map/RegionTabs";
import ThemeToggle from "@/app/components/ThemeToggle";
import TripPlanner from "@/app/components/TripPlanner";
import CustomTripPlanner from "@/app/components/CustomTripPlanner";
import TripPlaceDetailModal from "@/app/components/TripPlaceDetailModal";
import SaveTripButton from "@/app/components/trip/SaveTripButton";
import ShareTripButton from "@/app/components/trip/ShareTripButton";
import AuthWidget from "@/app/components/auth/AuthWidget";
import type { RegionMode } from "@/app/types/map";
import type { TripPlace, TripPlan } from "@/app/types/trip";

const DRAFT_TRIP_PLAN_KEY = "draft-trip-plan";

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

function getNaverSearchUrl(place: TripPlace) {
  const query = [place.naverPlace?.address, place.name]
    .filter(Boolean)
    .join(" ");

  return `https://map.naver.com/p/search/${encodeURIComponent(
    query || place.name,
  )}`;
}

export default function Home() {
  const [mode, setMode] = useState<RegionMode>("domestic");

  const [tripPlan, setTripPlan] = useState<TripPlan | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.sessionStorage.getItem(DRAFT_TRIP_PLAN_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as TripPlan;
    } catch {
      return null;
    }
  });

  const [plannerMode, setPlannerMode] = useState<"ai" | "custom">("ai");
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<TripPlace | null>(null);
  const { confirm } = useAppDialog();

  const [mapSearchRequest, setMapSearchRequest] = useState({
    query: "",
    id: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (tripPlan) {
      window.sessionStorage.setItem(DRAFT_TRIP_PLAN_KEY, JSON.stringify(tripPlan));
    } else {
      window.sessionStorage.removeItem(DRAFT_TRIP_PLAN_KEY);
    }
  }, [tripPlan]);

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

  const deletePlace = (dayNumber: number, placeId: string) => {
    if (!tripPlan) return;

    const targetDay = tripPlan.days.find((day) => day.day === dayNumber);
    if (!targetDay) return;

    const nextPlaces = targetDay.places
      .filter((place) => place.id !== placeId)
      .map((place, index) => ({ ...place, order: index + 1 }));

    setTripPlan({
      ...tripPlan,
      days: tripPlan.days.map((day) =>
        day.day === dayNumber ? { ...day, places: nextPlaces } : day,
      ),
    });
  };

  const updatePlace = (
    dayNumber: number,
    placeId: string,
    field: "name" | "category" | "description",
    value: string,
  ) => {
    if (!tripPlan) return;
    setTripPlan({
      ...tripPlan,
      days: tripPlan.days.map((day) =>
        day.day === dayNumber
          ? {
              ...day,
              places: day.places.map((place) =>
                place.id === placeId ? { ...place, [field]: value } : place,
              ),
            }
          : day,
      ),
    });
  };

  const movePlace = (dayNumber: number, index: number, direction: -1 | 1) => {
    if (!tripPlan) return;
    const targetDay = tripPlan.days.find((day) => day.day === dayNumber);
    if (!targetDay) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= targetDay.places.length) return;

    const places = [...targetDay.places];
    [places[index], places[nextIndex]] = [places[nextIndex], places[index]];

    setTripPlan({
      ...tripPlan,
      days: tripPlan.days.map((day) =>
        day.day === dayNumber
          ? {
              ...day,
              places: places.map((place, placeIndex) => ({
                ...place,
                order: placeIndex + 1,
              })),
            }
          : day,
      ),
    });
  };

  const addPlace = (place: TripPlace) => {
    if (!tripPlan) return;

    setTripPlan({
      ...tripPlan,
      days: tripPlan.days.map((day) =>
        day.day === place.day
          ? {
              ...day,
              places: [
                ...day.places,
                { ...place, order: day.places.length + 1 },
              ],
            }
          : day,
      ),
    });
  };

  const resetTripPlan = async () => {
    const confirmed = await confirm("현재 여행 계획을 모두 초기화할까요?", "여행 계획 초기화");
    if (!confirmed) return;
    setTripPlan(null);
    setPlannerMode("ai");
    setSelectedDay(1);
    setSelectedPlace(null);
    setMapSearchRequest({ query: "", id: 0 });
    window.sessionStorage.removeItem(DRAFT_TRIP_PLAN_KEY);
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
        <div className="flex items-center gap-3">
          <AuthWidget />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <RegionTabs value={mode} onChange={setMode} />

        {tripPlan && (
          <div className="flex flex-wrap items-center gap-2">
            <SaveTripButton plan={tripPlan} />
            <ShareTripButton plan={tripPlan} />
          </div>
        )}
      </div>

      <section className="grid min-h-[720px] gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="min-h-0">
          <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="grid flex-1 grid-cols-2 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
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
              <button
                type="button"
                onClick={resetTripPlan}
                disabled={!tripPlan}
                className="shrink-0 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-500 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700"
              >
                리셋
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
                onPlaceUpdate={(placeId, field, value) => updatePlace(selectedDay, placeId, field, value)}
                onPlaceMove={(index, direction) => movePlace(selectedDay, index, direction)}
                onPlaceRemove={(placeId) => deletePlace(selectedDay, placeId)}
                onPlaceAdd={addPlace}
                onPlaceSelect={setSelectedPlace}
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
                {tripPlan.destination || "내 여행"} 여행 구조
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-neutral-500">
              {tripPlan.summary}
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {tripPlan.days.map((day) => (
              <div
                key={day.day}
                className={`rounded-xl border p-4 ${
                  selectedDay === day.day
                    ? "border-neutral-900 dark:border-white"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedDay(day.day)}
                  className="w-full text-left"
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
                </button>

                <div className="mt-3 space-y-2">
                  {day.places.length === 0 ? (
                    <p className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-400 dark:bg-neutral-950">
                      등록된 장소가 없습니다.
                    </p>
                  ) : (
                    day.places.map((place) => (
                      <div
                        key={place.id}
                        className="group rounded-lg border border-neutral-100 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-950"
                        title={place.description || "상세 설명이 없습니다."}
                        onClick={() => setSelectedPlace(place)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white dark:bg-white dark:text-neutral-900">
                            {place.order}
                          </span>

                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                window.open(
                                  getNaverSearchUrl(place),
                                  "_blank",
                                  "noopener,noreferrer",
                                );
                              }}
                              className="block max-w-full truncate text-left text-xs font-semibold underline-offset-2 hover:underline"
                              title="네이버 지도에서 검색"
                            >
                              {place.name}
                            </button>
                            <p className="mt-0.5 text-[10px] text-neutral-400">
                              {place.category} · {place.stayMinutes}분
                            </p>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedPlace(place);
                              }}
                              className="mt-1 block w-full truncate text-left text-[11px] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                            >
                              {place.description || "상세 설명이 없습니다."}
                            </button>
                          </div>

                          {plannerMode === "custom" ? (
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedDay(day.day);
                                }}
                                className="rounded-md px-1.5 py-1 text-[10px] text-neutral-400 hover:bg-white hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
                                title="이 DAY의 장소 수정"
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deletePlace(day.day, place.id);
                                }}
                                className="rounded-md px-1.5 py-1 text-[10px] text-neutral-400 hover:bg-white hover:text-red-500 dark:hover:bg-neutral-900"
                                title="장소 삭제"
                              >
                                삭제
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setPlannerMode("custom");
                                setSelectedDay(day.day);
                              }}
                              className="shrink-0 rounded-md px-1.5 py-1 text-[10px] text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-900 dark:hover:text-white"
                              title="이 장소를 수정"
                            >
                              수정
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <p className="mt-3 text-[10px] text-neutral-400">
                  설명에 마우스를 올리면 전체 내용을 확인할 수 있고, 클릭하면 상세 팝업이 열립니다. 장소명은 네이버 지도 검색으로 열립니다.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <TripPlaceDetailModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </main>
  );
}