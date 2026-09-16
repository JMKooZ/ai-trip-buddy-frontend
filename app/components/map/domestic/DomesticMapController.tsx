"use client";

import { useEffect } from "react";
import { useListener, useMap, useNavermaps } from "react-naver-maps";
import { CLOSEUP_ZOOM } from "@/app/lib/map/regions";
import type { LatLng } from "./types";

interface DomesticMapControllerProps {
  target: LatLng | null;
  zoom?: number;
  onMapClick: (lat: number, lng: number) => void;
}

export default function DomesticMapController({
  target,
  zoom = CLOSEUP_ZOOM,
  onMapClick,
}: DomesticMapControllerProps) {
  const map = useMap();
  const navermaps = useNavermaps();

  useListener(map, "click", (event: any) => {
    const coord = event?.coord;
    if (!coord) return;
    onMapClick(coord.lat(), coord.lng());
  });

  useEffect(() => {
    if (!map || !navermaps || !target) return;

    map.setCenter(new navermaps.LatLng(target.lat, target.lng));
    map.setZoom(zoom);
  }, [map, navermaps, target, zoom]);

  return null;
}
