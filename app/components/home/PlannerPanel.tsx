import TripPlanner from "@/app/components/TripPlanner";
import CustomTripPlanner from "@/app/components/CustomTripPlanner";
import type { TripPlan } from "@/app/types/trip";

interface PlannerPanelProps {
  plannerMode: "ai" | "custom";
  onPlannerModeChange: (mode: "ai" | "custom") => void;
  tripPlan: TripPlan | null;
  onTripPlanChange: (plan: TripPlan) => void;
  onPlanGenerated: (plan: TripPlan) => void;
  onMapSearch: (query: string) => void;
  onReset: () => void;
}

export default function PlannerPanel({
  plannerMode,
  onPlannerModeChange,
  tripPlan,
  onTripPlanChange,
  onPlanGenerated,
  onMapSearch,
  onReset,
}: PlannerPanelProps) {
  return (
    <div className="min-h-0">
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="grid flex-1 grid-cols-2 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => onPlannerModeChange("ai")}
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
              onClick={() => onPlannerModeChange("custom")}
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
            onClick={onReset}
            disabled={!tripPlan}
            className="shrink-0 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-500 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700"
          >
            리셋
          </button>
        </div>

        {plannerMode === "ai" ? (
          <TripPlanner onPlanGenerated={onPlanGenerated} onMapSearch={onMapSearch} />
        ) : (
          <CustomTripPlanner plan={tripPlan} onChange={onTripPlanChange} />
        )}
      </div>
    </div>
  );
}