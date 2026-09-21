import TripPlaceCard from "@/app/components/home/TripPlaceCard";
import type { TripPlace, TripPlan } from "@/app/types/trip";

interface TripStructureSectionProps {
  tripPlan: TripPlan;
  plannerMode: "ai" | "custom";
  selectedDay: number;
  onSelectedDayChange: (day: number) => void;
  onSelectPlace: (place: TripPlace) => void;
  onEditDay: (dayNumber: number) => void;
  onDeletePlace: (dayNumber: number, placeId: string) => void;
}

export default function TripStructureSection({
  tripPlan,
  plannerMode,
  selectedDay,
  onSelectedDayChange,
  onSelectPlace,
  onEditDay,
  onDeletePlace,
}: TripStructureSectionProps) {
  return (
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
        <p className="max-w-2xl text-sm leading-6 text-neutral-500">{tripPlan.summary}</p>
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
              onClick={() => onSelectedDayChange(day.day)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400">DAY {day.day}</span>
                <span className="text-xs text-neutral-400">{day.places.length}곳</span>
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
                  <TripPlaceCard
                    key={place.id}
                    place={place}
                    dayNumber={day.day}
                    plannerMode={plannerMode}
                    onSelect={onSelectPlace}
                    onEditDay={onEditDay}
                    onDelete={onDeletePlace}
                  />
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
  );
}