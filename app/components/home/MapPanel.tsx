import dynamic from "next/dynamic";
import type { RegionMode } from "@/app/types/map";
import type { TripPlace, TripPlan } from "@/app/types/trip";

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

interface MapPanelProps {
  mode: RegionMode;
  tripPlan: TripPlan | null;
  plannerMode: "ai" | "custom";
  selectedDay: number;
  selectedDayPlaces: TripPlace[];
  searchRequest: { query: string; id: number };
  onSelectedDayChange: (day: number) => void;
  onPlacesChange: (places: TripPlan["days"][number]["places"]) => void;
  onPlaceUpdate: (placeId: string, field: "name" | "category" | "description", value: string) => void;
  onPlaceMove: (index: number, direction: -1 | 1) => void;
  onPlaceRemove: (placeId: string) => void;
  onPlaceAdd: (place: TripPlace) => void;
  onPlaceSelect: (place: TripPlace | null) => void;
}

export default function MapPanel({
  mode,
  tripPlan,
  plannerMode,
  selectedDay,
  selectedDayPlaces,
  searchRequest,
  onSelectedDayChange,
  onPlacesChange,
  onPlaceUpdate,
  onPlaceMove,
  onPlaceRemove,
  onPlaceAdd,
  onPlaceSelect,
}: MapPanelProps) {
  return (
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
            plannedPlaces={selectedDayPlaces}
            showHistory
            searchRequest={searchRequest}
            tripPlan={tripPlan}
            plannerMode={plannerMode}
            selectedDay={selectedDay}
            onSelectedDayChange={onSelectedDayChange}
            onPlacesChange={onPlacesChange}
            onPlaceUpdate={onPlaceUpdate}
            onPlaceMove={onPlaceMove}
            onPlaceRemove={onPlaceRemove}
            onPlaceAdd={onPlaceAdd}
            onPlaceSelect={onPlaceSelect}
          />
        ) : (
          <OverseasMap />
        )}
      </div>
    </div>
  );
}