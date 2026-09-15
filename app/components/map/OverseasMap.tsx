"use client";

import { useCallback, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import RegionSearchBar from "./RegionSearchBar";
import { WORLD_DEFAULT_VIEW, CLOSEUP_ZOOM } from "@/app/lib/map/regions";
import type { MapView } from "@/app/types/map";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function OverseasMap() {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-500 md:h-[75vh]">
        해외 지도(Google Maps)는 API 키 발급 후 연결 예정입니다.
      </div>
    );
  }

  return <OverseasMapInner apiKey={GOOGLE_MAPS_API_KEY} />;
}

function OverseasMapInner({ apiKey }: { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "ai-trip-buddy-google-maps",
  });

  const [view, setView] = useState<MapView>(WORLD_DEFAULT_VIEW);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback((query: string) => {
    if (!window.google?.maps) return;

    setSearching(true);
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: query }, (results, status) => {
      setSearching(false);

      if (status !== "OK" || !results?.[0]) {
        window.alert("검색 결과가 없어요. 다른 도시명이나 장소명으로 시도해보세요.");
        return;
      }

      const location = results[0].geometry.location;
      const lat = location.lat();
      const lng = location.lng();
      setView({ lat, lng, zoom: CLOSEUP_ZOOM });
      setMarker({ lat, lng });
    });
  }, []);

  if (loadError) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-500 md:h-[75vh]">
        Google Maps를 불러오지 못했습니다. API 키와 도메인 설정을 확인해주세요.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="h-[60vh] rounded-xl bg-neutral-100 dark:bg-neutral-900 md:h-[75vh]" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <RegionSearchBar
        placeholder="해외 도시/장소 검색"
        onSearch={handleSearch}
        loading={searching}
      />
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "60vh" }}
        center={{ lat: view.lat, lng: view.lng }}
        zoom={view.zoom}
        options={{
          gestureHandling: "greedy",
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onClick={(event) => {
          if (!event.latLng) return;
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          setView({ lat, lng, zoom: CLOSEUP_ZOOM });
          setMarker({ lat, lng });
        }}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}
