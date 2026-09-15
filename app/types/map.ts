export type RegionMode = "domestic" | "overseas";

export interface MapView {
  lat: number;
  lng: number;
  zoom: number;
}

export interface RegionPreset extends MapView {
  name: string;
}