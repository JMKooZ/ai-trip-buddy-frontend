import RegionTabs from "@/app/components/map/RegionTabs";
import SaveTripButton from "@/app/components/trip/SaveTripButton";
import ShareTripButton from "@/app/components/trip/ShareTripButton";
import type { RegionMode } from "@/app/types/map";
import type { TripPlan } from "@/app/types/trip";

interface TopBarProps {
  mode: RegionMode;
  onModeChange: (mode: RegionMode) => void;
  tripPlan: TripPlan | null;
  savedTripId: number | null;
  onSaved: (id: number) => void;
}

export default function TopBar({
  mode,
  onModeChange,
  tripPlan,
  savedTripId,
  onSaved,
}: TopBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <RegionTabs value={mode} onChange={onModeChange} />

      {tripPlan && (
        <div className="flex flex-wrap items-center gap-2">
          <SaveTripButton
            plan={tripPlan}
            savedTripId={savedTripId}
            onSaved={onSaved}
          />
          <ShareTripButton plan={tripPlan} />
        </div>
      )}
    </div>
  );
}