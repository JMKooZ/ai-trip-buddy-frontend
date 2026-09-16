import type { TripPlace, TripPlan } from "@/app/types/trip";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface HistoryEntry {
  id: string;
  lat: number | null;
  lng: number | null;
  label: string;
  timestamp: number;
  source: "search" | "click";
  naverPlaceUrl?: string;
  query?: string;
  address?: string;
  roadAddress?: string;
}

export interface DomesticMapSearchRequest {
  query: string;
  id: number;
}

export interface DomesticMapProps {
  plannedPlaces?: TripPlace[];
  showHistory?: boolean;
  searchRequest?: DomesticMapSearchRequest;
  tripPlan?: TripPlan | null;
  plannerMode?: "ai" | "custom";
  selectedDay?: number;
  onSelectedDayChange?: (day: number) => void;
  onPlacesChange?: (places: TripPlace[]) => void;
  onPlaceUpdate?: (
    placeId: string,
    field: "name" | "category" | "description",
    value: string,
  ) => void;
  onPlaceMove?: (index: number, direction: -1 | 1) => void;
  onPlaceRemove?: (placeId: string) => void;
  onPlaceAdd?: (place: TripPlace) => void;
  onPlaceSelect?: (place: TripPlace) => void;
}
