import type { MapView, RegionPreset } from "@/app/types/map";

export const KOREA_DEFAULT_VIEW: MapView = {
  lat: 36.5,
  lng: 127.8,
  zoom: 7,
};

export const WORLD_DEFAULT_VIEW: MapView = {
  lat: 20,
  lng: 0,
  zoom: 2,
};

export const DOMESTIC_PRESETS: RegionPreset[] = [
  { name: "서울", lat: 37.5665, lng: 126.978, zoom: 12 },
  { name: "부산", lat: 35.1796, lng: 129.0756, zoom: 12 },
  { name: "제주", lat: 33.4996, lng: 126.5312, zoom: 11 },
];

export const OVERSEAS_PRESETS: RegionPreset[] = [
  { name: "도쿄", lat: 35.6762, lng: 139.6503, zoom: 11 },
  { name: "파리", lat: 48.8566, lng: 2.3522, zoom: 12 },
  { name: "뉴욕", lat: 40.7128, lng: -74.006, zoom: 11 },
];

export const CLOSEUP_ZOOM = 13;
