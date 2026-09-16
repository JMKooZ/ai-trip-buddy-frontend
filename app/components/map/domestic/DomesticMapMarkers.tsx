"use client";

import { Marker, useNavermaps } from "react-naver-maps";
import type { TripPlace } from "@/app/types/trip";
import type { LatLng } from "./types";

export function DomesticSearchMarker({ target }: { target: LatLng | null }) {
  const navermaps = useNavermaps();
  if (!target) return null;

  return (
    <Marker
      position={target}
      icon={{
        content: `<div style="width:16px;height:16px;border-radius:50%;background:#111;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.28)"></div>`,
        size: new navermaps.Size(16, 16),
        anchor: new navermaps.Point(8, 8),
      }}
      title="검색한 위치"
      zIndex={2000}
    />
  );
}

export function DomesticPlannedPlaceMarkers({
  places,
  selectedPlaceId,
  onSelect,
}: {
  places: TripPlace[];
  selectedPlaceId: string | null;
  onSelect: (place: TripPlace) => void;
}) {
  const navermaps = useNavermaps();

  return (
    <>
      {places.map((place) => {
        const selected = selectedPlaceId === place.id;
        const size = selected ? 44 : 38;

        return (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            icon={{
              content: `
                <div style="width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;background:${selected ? "#111111" : "#ffffff"};color:${selected ? "#ffffff" : "#111111"};border:3px solid #111111;box-shadow:0 3px 10px rgba(0,0,0,0.25);font-size:${selected ? 15 : 13}px;font-weight:800;cursor:pointer;transition:all 180ms ease;">${place.order}</div>
              `,
              size: new navermaps.Size(size, size),
              anchor: new navermaps.Point(size / 2, size / 2),
            }}
            title={`${place.order}. ${place.name}`}
            zIndex={selected ? 1000 : 100 + place.order}
            onClick={() => onSelect(place)}
          />
        );
      })}
    </>
  );
}
