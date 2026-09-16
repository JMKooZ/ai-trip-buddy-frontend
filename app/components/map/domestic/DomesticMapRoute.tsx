"use client";

import { useEffect } from "react";
import { useMap, useNavermaps } from "react-naver-maps";
import { CLOSEUP_ZOOM } from "@/app/lib/map/regions";
import type { LatLng } from "./types";
import type { TripPlace } from "@/app/types/trip";

export function DomesticRouteViewport({
  places,
  focusTarget,
}: {
  places: TripPlace[];
  focusTarget: LatLng | null;
}) {
  const map = useMap();
  const navermaps = useNavermaps();

  useEffect(() => {
    if (!map || !navermaps || places.length === 0 || focusTarget) return;

    if (places.length === 1) {
      map.setCenter(new navermaps.LatLng(places[0].lat, places[0].lng));
      map.setZoom(CLOSEUP_ZOOM);
      return;
    }

    const first = places[0];
    const bounds = new navermaps.LatLngBounds(
      new navermaps.LatLng(first.lat, first.lng),
      new navermaps.LatLng(first.lat, first.lng),
    );

    places.forEach((place) => {
      bounds.extend(new navermaps.LatLng(place.lat, place.lng));
    });

    map.fitBounds(bounds, 80);
  }, [map, navermaps, places, focusTarget]);

  return null;
}

export function DomesticPlannedRoute({ places }: { places: TripPlace[] }) {
  const map = useMap();
  const navermaps = useNavermaps();

  useEffect(() => {
    if (!map || !navermaps || places.length < 2) return;

    const polyline = new navermaps.Polyline({
      map,
      path: places.map((place) => new navermaps.LatLng(place.lat, place.lng)),
      strokeColor: "#111111",
      strokeOpacity: 0.8,
      strokeWeight: 5,
      strokeLineCap: "round",
      strokeLineJoin: "round",
    });

    return () => polyline.setMap(null);
  }, [map, navermaps, places]);

  return null;
}
