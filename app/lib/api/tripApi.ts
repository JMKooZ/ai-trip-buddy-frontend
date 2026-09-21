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

export interface SavedTripSummary {
  id: number;
  destination: string;
  durationLabel: string;
  createdAt: string;
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

export async function saveTripPlan(plan: TripPlan): Promise<{ id: number }> {
  const response = await apiClient.post<{ id: number }>(
    "/trips/saved",
    plan,
  );
  return response.data;
}

export async function fetchMyTrips(): Promise<SavedTripSummary[]> {
  const response = await apiClient.get<SavedTripSummary[]>("/trips/saved");
  return response.data;
}

export interface SavedTripDetail {
  id: number;
  plan: TripPlan;
  createdAt: string;
  updatedAt: string;
}

export async function fetchTripDetail(id: number): Promise<SavedTripDetail> {
  const response = await apiClient.get<SavedTripDetail>(`/trips/saved/${id}`);
  return response.data;
}

export async function updateTripPlan(id: number, plan: TripPlan): Promise<void> {
  await apiClient.put(`/trips/saved/${id}`, plan);
}

export async function deleteTripPlan(id: number): Promise<void> {
  await apiClient.delete(`/trips/saved/${id}`);
}