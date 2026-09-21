"use client";

import { useEffect, useState } from "react";
import type { TripPlace, TripPlan } from "@/app/types/trip";

const DRAFT_TRIP_PLAN_KEY = "draft-trip-plan";
const DRAFT_TRIP_ID_KEY = "draft-trip-id";

export function useTripPlan() {
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

  const [savedTripId, setSavedTripId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.sessionStorage.getItem(DRAFT_TRIP_ID_KEY);
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (tripPlan) {
      window.sessionStorage.setItem(DRAFT_TRIP_PLAN_KEY, JSON.stringify(tripPlan));
    } else {
      window.sessionStorage.removeItem(DRAFT_TRIP_PLAN_KEY);
    }
  }, [tripPlan]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (savedTripId != null) {
      window.sessionStorage.setItem(DRAFT_TRIP_ID_KEY, String(savedTripId));
    } else {
      window.sessionStorage.removeItem(DRAFT_TRIP_ID_KEY);
    }
  }, [savedTripId]);

  const handlePlanGenerated = (plan: TripPlan) => {
    setTripPlan(plan);
    setSavedTripId(null);
  };

  const updatePlaces = (
    selectedDay: number,
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
          ? { ...day, places: [...day.places, { ...place, order: day.places.length + 1 }] }
          : day,
      ),
    });
  };

  const clear = () => {
    setTripPlan(null);
    setSavedTripId(null);
    window.sessionStorage.removeItem(DRAFT_TRIP_PLAN_KEY);
    window.sessionStorage.removeItem(DRAFT_TRIP_ID_KEY);
  };

  return {
    tripPlan,
    setTripPlan,
    savedTripId,
    setSavedTripId,
    handlePlanGenerated,
    updatePlaces,
    deletePlace,
    updatePlace,
    movePlace,
    addPlace,
    clear,
  };
}

export type UseTripPlanReturn = ReturnType<typeof useTripPlan>;