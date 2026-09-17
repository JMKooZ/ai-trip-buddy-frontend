import apiClient from "./axios";
import type { TripPlan, TravelStyle } from "@/app/types/trip";

export interface CreateTripPlanRequest {
  destination: string;
  duration: "day" | "stay";
  nights: number | null;
  travelStyles: TravelStyle[];
  request: string;
}

export interface PlaceSearchItem {
  name: string;
  link?: string;
  category?: string;
  description?: string;
  telephone?: string;
  address?: string;
  roadAddress?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface PlaceSearchResponse {
  query: string;
  total: number;
  items: PlaceSearchItem[];
}

export async function createTripPlan(
  request: CreateTripPlanRequest,
): Promise<TripPlan> {
  const response = await apiClient.post<TripPlan>("/trips", request);
  return response.data;
}

export async function searchPlaces(
  query: string,
): Promise<PlaceSearchResponse> {
  const response = await apiClient.get<PlaceSearchResponse>(
    "/trips/search/places",
    { params: { query } },
  );

  return response.data;
}
