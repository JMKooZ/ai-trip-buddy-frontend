export type TripDuration =
  | "day"
  | "stay";

export type TravelStyle =
  | "맛집"
  | "카페"
  | "자연"
  | "관광"
  | "휴식"
  | "액티비티";

export interface NaverPlacePreview {
  category?: string;
  address?: string;
  roadAddress?: string;
  telephone?: string;
  link?: string;
}

export interface TripPlace {
  id: string;
  day: number;
  order: number;
  name: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  stayMinutes: number;

  naverPlace?: NaverPlacePreview;
}

export interface TripDay {
  day: number;
  title: string;
  places: TripPlace[];
}

export interface TripPlan {
  destination: string;
  durationLabel: string;
  summary: string;
  days: TripDay[];
}