"use client";

import { Suspense, useEffect, useState } from "react";
import {
  NavermapsProvider,
  Container,
  NaverMap,
  Marker,
  useMap,
  useNavermaps,
  useListener,
} from "react-naver-maps";
import {
  KOREA_DEFAULT_VIEW,
  CLOSEUP_ZOOM,
  DOMESTIC_PRESETS,
} from "@/app/lib/map/regions";
import { formatRelativeTime } from "@/app/lib/format/relativeTime";
import type { TripPlace, TripPlan } from "@/app/types/trip";
import TripPlaceSortableList from "@/app/components/TripPlaceSortableList";

interface LatLng {
  lat: number;
  lng: number;
}

interface HistoryEntry {
  id: string;
  lat: number | null;
  lng: number | null;
  label: string;
  timestamp: number;
  source: "search" | "click";
  naverPlaceUrl?: string;
}

interface DomesticMapProps {
  plannedPlaces?: TripPlace[];
  showHistory?: boolean;
  searchRequest?: {
    query: string;
    id: number;
  };
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
  onPlaceAdd?: (name: string) => void;
  onPlaceSelect?: (place: TripPlace) => void;
}

const NAVER_MAP_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

function PlannedRoute({ places }: { places: TripPlace[] }) {
  const map = useMap();
  const navermaps = useNavermaps();

  useEffect(() => {
    if (!map || !navermaps || places.length < 2) {
      return;
    }

    const path = places.map(
      (place) => new navermaps.LatLng(place.lat, place.lng)
    );

    const polyline = new navermaps.Polyline({
      map,
      path,
      strokeColor: "#111111",
      strokeOpacity: 0.8,
      strokeWeight: 5,
      strokeLineCap: "round",
      strokeLineJoin: "round",
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, navermaps, places]);

  return null;
}

function MapController({
  target,
  onMapClick,
}: {
  target: LatLng | null;
  onMapClick: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useListener(map, "click", (event: any) => {
    const coord = event?.coord;

    if (!coord) {
      return;
    }

    onMapClick(coord.lat(), coord.lng());
  });

  useEffect(() => {
    if (!map || !target) {
      return;
    }

    const position = new window.naver.maps.LatLng(target.lat, target.lng);
    map.setCenter(position);
    map.setZoom(CLOSEUP_ZOOM);
  }, [map, target]);

  return null;
}


function RouteViewport({ places }: { places: TripPlace[] }) {
  const map = useMap();
  const navermaps = useNavermaps();

  useEffect(() => {
    if (!map || !navermaps || places.length === 0) {
      return;
    }

    if (places.length === 1) {
      map.setCenter(
        new navermaps.LatLng(places[0].lat, places[0].lng)
      );
      map.setZoom(CLOSEUP_ZOOM);
      return;
    }

    const bounds = new navermaps.LatLngBounds(
      new navermaps.LatLng(places[0].lat, places[0].lng),
      new navermaps.LatLng(places[0].lat, places[0].lng)
    );

    places.forEach((place) => {
      bounds.extend(
        new navermaps.LatLng(place.lat, place.lng)
      );
    });

    map.fitBounds(bounds, 80);
  }, [map, navermaps, places]);

  return null;
}

function PlannedPlaceMarkers({
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

        const icon = {
          content: `
            <div style="
              width:${size}px;
              height:${size}px;
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              box-sizing:border-box;
              background:${selected ? "#111111" : "#ffffff"};
              color:${selected ? "#ffffff" : "#111111"};
              border:3px solid #111111;
              box-shadow:0 3px 10px rgba(0,0,0,0.25);
              font-size:${selected ? 15 : 13}px;
              font-weight:800;
              cursor:pointer;
              transition:all 180ms ease;
            ">${place.order}</div>
          `,
          size: new navermaps.Size(size, size),
          anchor: new navermaps.Point(size / 2, size / 2),
        };

        return (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            icon={icon}
            title={`${place.order}. ${place.name}`}
            zIndex={selected ? 1000 : 100 + place.order}
            onClick={() => onSelect(place)}
          />
        );
      })}
    </>
  );
}

function SearchPlaceMarker({ target }: { target: LatLng | null }) {
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

function DomesticMapInner({
  plannedPlaces = [],
  showHistory = true,
  searchRequest,
  tripPlan = null,
  plannerMode = "ai",
  selectedDay = 1,
  onSelectedDayChange,
  onPlacesChange,
  onPlaceUpdate,
  onPlaceMove,
  onPlaceRemove,
  onPlaceAdd,
  onPlaceSelect,
}: DomesticMapProps) {
  const navermaps = useNavermaps();
  const [target, setTarget] = useState<LatLng | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<TripPlace | null>(null);
  const [rightPanel, setRightPanel] = useState<"history" | "place" | null>(null);
  const [plannerPanelOpen, setPlannerPanelOpen] = useState(true);
  const [searching, setSearching] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1_000);

    return () => window.clearInterval(id);
  }, []);

  const addHistory = ({
    lat,
    lng,
    label,
    source,
    id,
    naverPlaceUrl,
  }: {
    lat: number | null;
    lng: number | null;
    label: string;
    source: HistoryEntry["source"];
    id?: string;
    naverPlaceUrl?: string;
  }) => {
    const normalizedLabel = label.trim() || "알 수 없는 위치";

    setHistory((prev) => {
      if (id) {
        return prev.map((item) =>
          item.id === id
            ? {
                ...item,
                lat,
                lng,
                label: normalizedLabel,
                naverPlaceUrl: naverPlaceUrl ?? item.naverPlaceUrl,
              }
            : item
        );
      }

      const duplicate = prev.find(
        (item) =>
          item.lat !== null &&
          item.lng !== null &&
          lat !== null &&
          lng !== null &&
          Math.abs(item.lat - lat) < 0.00001 &&
          Math.abs(item.lng - lng) < 0.00001
      );

      if (duplicate) {
        const rest = prev.filter((item) => item.id !== duplicate.id);

        return [
          {
            ...duplicate,
            label: normalizedLabel,
            timestamp: Date.now(),
            source,
            naverPlaceUrl: naverPlaceUrl ?? duplicate.naverPlaceUrl,
          },
          ...rest,
        ].slice(0, 20);
      }

      return [
        {
          id: crypto.randomUUID(),
          lat,
          lng,
          label: normalizedLabel,
          timestamp: Date.now(),
          source,
          naverPlaceUrl,
        },
        ...prev,
      ].slice(0, 20);
    });
  };

  useEffect(() => {
    const query = searchRequest?.query.trim();

    if (!query || !searchRequest?.id) {
      return;
    }

    const historyId = crypto.randomUUID();
    const naverPlaceUrl = `https://map.naver.com/p/search/${encodeURIComponent(query)}`;

    // 검색 즉시 오른쪽 History drawer를 열고 기록한다.
    setRightPanel("history");
    setHistory((prev) => [
      {
        id: historyId,
        lat: null,
        lng: null,
        label: query,
        timestamp: Date.now(),
        source: "search",
        naverPlaceUrl,
      },
      ...prev,
    ].slice(0, 20));

    const preset = DOMESTIC_PRESETS.find((item) =>
      item.name.includes(query) || query.includes(item.name)
    );

    if (preset) {
      const presetPoint = {
        lat: preset.lat,
        lng: preset.lng,
      };

      setTarget(presetPoint);
      addHistory({
        id: historyId,
        lat: preset.lat,
        lng: preset.lng,
        label: preset.name,
        source: "search",
        naverPlaceUrl,
      });
      return;
    }



    if (!navermaps?.Service) {
      return;
    }

    setSearching(true);

    navermaps.Service.geocode(
      { query },
      (status: string, response: any) => {
        setSearching(false);

        if (status !== navermaps.Service.Status.OK) {
          return;
        }

        const result = response?.v2?.addresses?.[0];

        if (!result) {
          return;
        }

        const lat = Number(result.y);
        const lng = Number(result.x);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return;
        }

        const searchedLabel =
          result.roadAddress || result.jibunAddress || query;

        setTarget({ lat, lng });

        addHistory({
          id: historyId,
          lat,
          lng,
          label: searchedLabel,
          source: "search",
          naverPlaceUrl,
        });
      }
    );
  }, [navermaps, searchRequest?.id]);

  const handleMapClick = (lat: number, lng: number) => {
    const clickedPoint = { lat, lng };
    const historyId = crypto.randomUUID();
    const naverPlaceUrl = `https://map.naver.com/p?c=15.00,${lng},${lat},0,dh`;

    setRightPanel("history");
    setTarget(clickedPoint);

    // Reverse geocoding이 403이어도 클릭 기록은 즉시 표시한다.
    addHistory({
      id: historyId,
      lat,
      lng,
      label: "지도 클릭 위치",
      source: "click",
      naverPlaceUrl,
    });

    if (!navermaps?.Service) {
      return;
    }

    navermaps.Service.reverseGeocode(
      {
        coords: new navermaps.LatLng(lat, lng),
        orders: [
          navermaps.Service.OrderType.ADDR,
          navermaps.Service.OrderType.ROAD_ADDR,
        ].join(","),
      },
      (status: string, response: any) => {
        if (status !== navermaps.Service.Status.OK) {
          return;
        }

        const address = response?.v2?.address;
        const result = response?.v2?.results?.[0];
        const region = result?.region;

        const area1 = region?.area1?.name;
        const area2 = region?.area2?.name;
        const area3 = region?.area3?.name;

        const regionLabel = [area1, area2, area3]
          .filter(Boolean)
          .join(" ");

        const addressLabel =
          address?.roadAddress || address?.jibunAddress;

        const label =
          regionLabel ||
          addressLabel ||
          "지도 클릭 위치";

        addHistory({
          id: historyId,
          lat,
          lng,
          label,
          source: "click",
          naverPlaceUrl,
        });
      }
    );
  };

  useEffect(() => {
    if (plannedPlaces.length === 0) {
      setSelectedPlace(null);
      return;
    }

    const firstPlace = plannedPlaces[0];

    setSelectedPlace((current) => {
      if (!current) {
        return firstPlace;
      }

      return (
        plannedPlaces.find((place) => place.id === current.id) ??
        firstPlace
      );
    });
  }, [plannedPlaces]);

  const handleSelectPlace = (place: TripPlace) => {
    setSelectedPlace(place);
    setRightPanel("place");
    setTarget({
      lat: place.lat,
      lng: place.lng,
    });
  };

  const handleHistoryClick = (item: HistoryEntry) => {
    if (item.lat === null || item.lng === null) {
      return;
    }

    setTarget({
      lat: item.lat,
      lng: item.lng,
    });
  };

  return (
    <div className="relative h-full min-h-[720px] w-full">
      <Container className="h-full min-h-[720px] w-full overflow-hidden rounded-2xl">
        <NaverMap
          defaultCenter={{
            lat: KOREA_DEFAULT_VIEW.lat,
            lng: KOREA_DEFAULT_VIEW.lng,
          }}
          defaultZoom={KOREA_DEFAULT_VIEW.zoom}
        >
          <MapController
            target={target}
            onMapClick={handleMapClick}
          />

          {plannedPlaces.length > 0 && (
            <>
              <RouteViewport places={plannedPlaces} />
              <PlannedRoute places={plannedPlaces} />
              <PlannedPlaceMarkers
                places={plannedPlaces}
                selectedPlaceId={selectedPlace?.id ?? null}
                onSelect={handleSelectPlace}
              />
            </>
          )}
        </NaverMap>
      </Container>

      <button
        type="button"
        onClick={() => setRightPanel((current) => current ? null : "history")}
        className={`absolute right-2 top-1/2 z-30 flex h-9 w-7 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-neutral-200/70 bg-white/70 text-sm font-medium text-neutral-400 shadow-sm backdrop-blur transition-all duration-300 hover:bg-white/90 hover:text-neutral-700 dark:border-neutral-700/70 dark:bg-neutral-950/70 dark:text-neutral-500 dark:hover:bg-neutral-900/90 dark:hover:text-neutral-200 ${
          rightPanel ? "translate-x-[-392px] max-[520px]:translate-x-[-90vw]" : "translate-x-0"
        }`}
        aria-label={rightPanel ? "오른쪽 패널 닫기" : "히스토리 패널 열기"}
        aria-expanded={rightPanel !== null}
      >
        {rightPanel ? "›" : "‹"}
      </button>

      <div
        className={`absolute inset-y-0 right-0 z-20 w-[380px] max-w-[88%] p-3 transition-transform duration-300 ease-out ${
          rightPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-2xl backdrop-blur dark:border-neutral-700 dark:bg-neutral-950/95">
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {rightPanel === "place" ? "Naver Place" : "History"}
              </p>
              <h2 className="mt-1 text-sm font-bold">
                {rightPanel === "place" ? "장소 정보" : "최근 검색·클릭"}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setRightPanel(null)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
              aria-label="오른쪽 패널 닫기"
            >
              ×
            </button>
          </div>

          {rightPanel === "place" && selectedPlace && (
            <section className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
                  {selectedPlace.order}
                </span>

                <div className="min-w-0">
                  <p className="text-base font-bold">{selectedPlace.name}</p>
                  <p className="mt-1 text-xs font-medium text-neutral-400">
                    {selectedPlace.category}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                {selectedPlace.description}
              </p>

              <div className="mt-4 space-y-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-neutral-400">추천 체류</span>
                  <span className="font-medium">
                    {selectedPlace.stayMinutes}분
                  </span>
                </div>

                {selectedPlace.naverPlace?.roadAddress && (
                  <div className="text-xs leading-5">
                    <span className="text-neutral-400">도로명</span>
                    <p className="mt-0.5">
                      {selectedPlace.naverPlace.roadAddress}
                    </p>
                  </div>
                )}

                {selectedPlace.naverPlace?.address && (
                  <div className="text-xs leading-5">
                    <span className="text-neutral-400">지번</span>
                    <p className="mt-0.5">
                      {selectedPlace.naverPlace.address}
                    </p>
                  </div>
                )}

                {selectedPlace.naverPlace?.telephone && (
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-neutral-400">전화</span>
                    <span className="font-medium">
                      {selectedPlace.naverPlace.telephone}
                    </span>
                  </div>
                )}
              </div>

              <a
                href={
                  selectedPlace.naverPlace?.link ||
                  `https://map.naver.com/p/search/${encodeURIComponent(selectedPlace.name)}`
                }
                target="_blank"
                rel="noreferrer"
                className="mt-4 block rounded-xl bg-neutral-900 px-3 py-3 text-center text-xs font-semibold text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
              >
                네이버 플레이스에서 보기 ↗
              </a>
            </section>
          )}

          {rightPanel === "history" && (
            <section className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-neutral-400">
                  검색하거나 지도에서 클릭한 기록은 자동으로 남습니다.
                </p>
                {searching && (
                  <span className="ml-3 shrink-0 text-[10px] text-neutral-400">
                    검색 중...
                  </span>
                )}
              </div>

              {history.length === 0 ? (
                <div className="rounded-xl bg-neutral-50 p-4 text-center text-xs leading-5 text-neutral-400 dark:bg-neutral-900">
                  아직 검색·클릭 기록이 없습니다.
                </div>
              ) : (
                <div className="history-list">
                  {history.map((item, index) => (
                    <div
                      key={item.id}
                      className="history-item group"
                    >
                      <button
                        type="button"
                        onClick={() => handleHistoryClick(item)}
                        disabled={item.lat === null || item.lng === null}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                      >
                        <span className="history-index">
                          {index + 1}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-xs text-neutral-400">
                            {formatRelativeTime(item.timestamp, now)}
                            <span className="ml-2 opacity-60">
                              {item.source === "search" ? "검색" : "지도 클릭"}
                            </span>
                          </span>
                        </span>
                      </button>

                      <a
                        href={
                          item.naverPlaceUrl ||
                          `https://map.naver.com/p/search/${encodeURIComponent(item.label)}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="shrink-0 rounded-lg border border-neutral-200 px-2 py-1.5 text-[10px] font-semibold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                        aria-label={`${item.label} 네이버 플레이스 열기`}
                      >
                        네이버
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {tripPlan && plannedPlaces.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setPlannerPanelOpen((current) => !current)}
            className={`absolute bottom-1/2 left-2 z-30 flex h-9 w-7 translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-neutral-200/70 bg-white/80 text-sm font-medium text-neutral-400 shadow-sm backdrop-blur transition-all duration-300 hover:bg-white/95 hover:text-neutral-700 dark:border-neutral-700/70 dark:bg-neutral-950/80 dark:text-neutral-500 dark:hover:bg-neutral-900/95 ${
              plannerPanelOpen ? "translate-x-[348px] max-[520px]:translate-x-[78vw]" : "translate-x-0"
            }`}
            aria-label={plannerPanelOpen ? "여행 일정 패널 닫기" : "여행 일정 패널 열기"}
            aria-expanded={plannerPanelOpen}
          >
            {plannerPanelOpen ? "‹" : "›"}
          </button>

          <aside
            className={`absolute inset-y-0 left-0 z-20 w-[380px] max-w-[88%] p-3 transition-transform duration-300 ease-out ${
              plannerPanelOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-2xl backdrop-blur dark:border-neutral-700 dark:bg-neutral-950/95">
              <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                    {plannerMode === "ai" ? "AI Trip" : "Custom Trip"}
                  </p>
                  <h2 className="mt-1 text-sm font-bold">여행 일정</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPlannerPanelOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                  aria-label="여행 일정 패널 닫기"
                >
                  ×
                </button>
              </div>

              <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
                {tripPlan.days.map((day) => (
                  <button
                    key={day.day}
                    type="button"
                    onClick={() => onSelectedDayChange?.(day.day)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      selectedDay === day.day
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    DAY {day.day}
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <div className="mb-3">
                  <p className="text-sm font-bold">
                    {tripPlan.days.find((day) => day.day === selectedDay)?.title}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    왼쪽 핸들을 잡고 드래그하거나 ↑ ↓ 버튼으로 순서를 변경하세요.
                  </p>
                </div>

                <div className="mb-3 flex gap-2">
                  <input
                    id="map-planner-place-input"
                    placeholder="장소 추가"
                    className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      const input = event.currentTarget;
                      const name = input.value.trim();
                      if (!name) return;
                      onPlaceAdd?.(name);
                      input.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(
                        "map-planner-place-input",
                      ) as HTMLInputElement | null;
                      const name = input?.value.trim() ?? "";
                      if (!name) return;
                      onPlaceAdd?.(name);
                      if (input) input.value = "";
                    }}
                    className="rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
                  >
                    추가
                  </button>
                </div>

                <TripPlaceSortableList
                  places={plannedPlaces}
                  compact
                  onUpdate={onPlaceUpdate}
                  onMove={onPlaceMove}
                  onRemove={onPlaceRemove}
                  onSelect={onPlaceSelect}
                  onReorder={(places) => onPlacesChange?.(places)}
                />
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function DomesticMapProvider(props: DomesticMapProps) {
  if (!NAVER_MAP_CLIENT_ID) {
    return (
      <div className="flex h-full min-h-[720px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-sm text-neutral-500">
        네이버 지도 API 키가 설정되지 않았습니다. <code className="mx-1">.env.local</code>을 확인해주세요.
      </div>
    );
  }

  return (
    <NavermapsProvider
      ncpKeyId={NAVER_MAP_CLIENT_ID}
      submodules={["geocoder"]}
    >
      <DomesticMapInner {...props} />
    </NavermapsProvider>
  );
}

function DomesticMapFallback() {
  return (
    <div className="flex h-full min-h-[720px] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm text-neutral-500">
        네이버 지도를 불러오는 중입니다...
      </p>
    </div>
  );
}

export default function DomesticMap(props: DomesticMapProps) {
  return (
    <Suspense fallback={<DomesticMapFallback />}>
      <DomesticMapProvider {...props} />
    </Suspense>
  );
}
