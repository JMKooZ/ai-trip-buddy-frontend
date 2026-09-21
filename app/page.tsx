"use client";

import { useState } from "react";
import { useAppDialog } from "@/app/components/ui/AppDialogProvider";
import { useTripPlan } from "@/app/hooks/useTripPlan";
import AppHeader from "@/app/components/home/AppHeader";
import TopBar from "@/app/components/home/TopBar";
import PlannerPanel from "@/app/components/home/PlannerPanel";
import MapPanel from "@/app/components/home/MapPanel";
import TripStructureSection from "@/app/components/home/TripStructureSection";
import TripPlaceDetailModal from "@/app/components/TripPlaceDetailModal";
import type { RegionMode } from "@/app/types/map";
import type { TripPlace, TripPlan } from "@/app/types/trip";

export default function Home() {
  const [mode, setMode] = useState<RegionMode>("domestic");
  const trip = useTripPlan();

  const [plannerMode, setPlannerMode] = useState<"ai" | "custom">("ai");
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<TripPlace | null>(null);
  const [mapSearchRequest, setMapSearchRequest] = useState({ query: "", id: 0 });
  const { confirm } = useAppDialog();

  const selectedDayPlan = trip.tripPlan?.days.find((day) => day.day === selectedDay);

  const handlePlanGenerated = (plan: TripPlan) => {
    trip.handlePlanGenerated(plan);
    setSelectedDay(plan.days[0]?.day ?? 1);
  };

  const handleEditDay = (dayNumber: number) => {
    setPlannerMode("custom");
    setSelectedDay(dayNumber);
  };

  const resetTripPlan = async () => {
    const confirmed = await confirm("현재 여행 계획을 모두 초기화할까요?", "여행 계획 초기화");
    if (!confirmed) return;
    trip.clear();
    setPlannerMode("ai");
    setSelectedDay(1);
    setSelectedPlace(null);
    setMapSearchRequest({ query: "", id: 0 });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-6 px-4 py-6 transition-colors duration-500 md:px-8 md:py-8">
      <AppHeader />

      <TopBar
        mode={mode}
        onModeChange={setMode}
        tripPlan={trip.tripPlan}
        savedTripId={trip.savedTripId}
        onSaved={trip.setSavedTripId}
      />

      <section className="grid min-h-[720px] gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <PlannerPanel
          plannerMode={plannerMode}
          onPlannerModeChange={setPlannerMode}
          tripPlan={trip.tripPlan}
          onTripPlanChange={trip.setTripPlan}
          onPlanGenerated={handlePlanGenerated}
          onMapSearch={(query) =>
            setMapSearchRequest((current) => ({ query, id: current.id + 1 }))
          }
          onReset={resetTripPlan}
        />

        <MapPanel
          mode={mode}
          tripPlan={trip.tripPlan}
          plannerMode={plannerMode}
          selectedDay={selectedDay}
          selectedDayPlaces={selectedDayPlan?.places ?? []}
          searchRequest={mapSearchRequest}
          onSelectedDayChange={setSelectedDay}
          onPlacesChange={(places) => trip.updatePlaces(selectedDay, places)}
          onPlaceUpdate={(placeId, field, value) => trip.updatePlace(selectedDay, placeId, field, value)}
          onPlaceMove={(index, direction) => trip.movePlace(selectedDay, index, direction)}
          onPlaceRemove={(placeId) => trip.deletePlace(selectedDay, placeId)}
          onPlaceAdd={trip.addPlace}
          onPlaceSelect={setSelectedPlace}
        />
      </section>

      {trip.tripPlan && (
        <TripStructureSection
          tripPlan={trip.tripPlan}
          plannerMode={plannerMode}
          selectedDay={selectedDay}
          onSelectedDayChange={setSelectedDay}
          onSelectPlace={setSelectedPlace}
          onEditDay={handleEditDay}
          onDeletePlace={trip.deletePlace}
        />
      )}

      <TripPlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </main>
  );
}