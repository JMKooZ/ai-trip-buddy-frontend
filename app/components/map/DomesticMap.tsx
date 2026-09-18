"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Container,
  NavermapsProvider,
  NaverMap,
  useNavermaps,
} from "react-naver-maps";
import { KOREA_DEFAULT_VIEW, CLOSEUP_ZOOM } from "@/app/lib/map/regions";
import type { TripPlace } from "@/app/types/trip";
import type { PlaceSearchItem } from "@/app/lib/api/tripApi";
import DomesticMapController from "./domestic/DomesticMapController";
import DomesticMapHistoryPanel from "./domestic/DomesticMapHistoryPanel";
import DomesticMapSearch from "./domestic/DomesticMapSearch";
import { DomesticPlannedPlaceMarkers, DomesticSearchMarker } from "./domestic/DomesticMapMarkers";
import { DomesticPlannedRoute, DomesticRouteViewport } from "./domestic/DomesticMapRoute";
import DomesticTripPlannerPanel from "./domestic/DomesticTripPlannerPanel";
import type { DomesticMapProps, HistoryEntry, LatLng } from "./domestic/types";
import { useAppDialog } from "@/app/components/ui/AppDialogProvider";

const NAVER_MAP_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
const SEARCH_ZOOM = 16;

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
  const [searchTarget, setSearchTarget] = useState<LatLng | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<TripPlace | null>(null);
  const [rightPanel, setRightPanel] = useState<"history" | "place" | null>(null);
  const [plannerPanelOpen, setPlannerPanelOpen] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceSearchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const { alert } = useAppDialog();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const addHistory = useCallback((entry: Omit<HistoryEntry, "id" | "timestamp"> & { id?: string }) => {
    const normalizedLabel = entry.label.trim() || "알 수 없는 위치";

    setHistory((prev) => {
      const duplicate = prev.find(
        (item) => item.lat !== null && item.lng !== null && entry.lat !== null && entry.lng !== null && Math.abs(item.lat - entry.lat) < 0.00001 && Math.abs(item.lng - entry.lng) < 0.00001,
      );

      const base = {
        ...entry,
        id: entry.id ?? duplicate?.id ?? crypto.randomUUID(),
        timestamp: Date.now(),
        label: normalizedLabel,
      };

      if (duplicate) {
        return [base, ...prev.filter((item) => item.id !== duplicate.id)].slice(0, 20);
      }

      return [base, ...prev].slice(0, 20);
    });
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    const point = { lat, lng };
    const naverPlaceUrl = `https://map.naver.com/p?c=15.00,${lng},${lat},0,dh`;

    setSearchTarget(null);
    setTarget(point);
    setRightPanel("history");
    addHistory({ lat, lng, label: "지도 클릭 위치", source: "click", naverPlaceUrl });

    if (!navermaps?.Service) return;

    navermaps.Service.reverseGeocode(
      {
        coords: new navermaps.LatLng(lat, lng),
        orders: [navermaps.Service.OrderType.ADDR, navermaps.Service.OrderType.ROAD_ADDR].join(","),
      },
      (status: string, response: any) => {
        if (status !== navermaps.Service.Status.OK) return;

        const address = response?.v2?.address;
        const result = response?.v2?.results?.[0];
        const region = result?.region;
        const regionLabel = [region?.area1?.name, region?.area2?.name, region?.area3?.name].filter(Boolean).join(" ");

        addHistory({
          lat,
          lng,
          label: regionLabel || address?.roadAddress || address?.jibunAddress || "지도 클릭 위치",
          source: "click",
          naverPlaceUrl,
          address: address?.jibunAddress || "",
          roadAddress: address?.roadAddress || "",
        });
      },
    );
  }, [addHistory, navermaps]);

  useEffect(() => {
    if (plannedPlaces.length === 0) {
      setSelectedPlace(null);
      return;
    }

    setSelectedPlace((current) => plannedPlaces.find((place) => place.id === current?.id) ?? plannedPlaces[0]);
  }, [plannedPlaces]);

  const handleSelectPlace = useCallback((place: TripPlace) => {
    setSearchTarget(null);
    setSelectedPlace(place);
    setRightPanel("place");
    setTarget({ lat: place.lat, lng: place.lng });
    onPlaceSelect?.(place);
  }, [onPlaceSelect]);

  const handleHistoryClick = useCallback((item: HistoryEntry) => {
    if (item.lat === null || item.lng === null) return;

    const point = { lat: item.lat, lng: item.lng };
    setTarget(point);
    setSearchTarget(item.source === "search" ? point : null);
  }, []);

  const handleSearchResults = useCallback(
    (query: string, items: PlaceSearchItem[]) => {
      setSearchQuery(query);
      setSearchResults(items);
    },
    [],
  );

  const handleSelectSearchResult = useCallback((item: PlaceSearchItem) => {
    const lat = Number(item.lat);
    const lng = Number(item.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    const point = { lat, lng };

    setTarget(point);
    setSearchTarget(point);
    setRightPanel("history");

    addHistory({
      lat,
      lng,
      label: searchQuery || item.name || "검색 결과",
      source: "search",
      naverPlaceUrl:
        item.link ||
        `https://map.naver.com/p/search/${encodeURIComponent(
          [item.address, item.name].filter(Boolean).join(" "),
        )}`,
      query: searchQuery,
      address: item.address || "",
      roadAddress: item.roadAddress || "",
    });
  }, [addHistory, searchQuery]);

  const handleAddPlace = useCallback((name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName || !navermaps?.Service) return;

    const destination = tripPlan?.destination?.trim() || "";
    const query = [destination, normalizedName].filter(Boolean).join(" ");
    const targetDay = tripPlan?.days.find((day) => day.day === selectedDay);

    if (!targetDay) return;

    setSearching(true);
    navermaps.Service.geocode({ query }, (status: string, response: any) => {
      setSearching(false);
      if (status !== navermaps.Service.Status.OK) {
        void alert(`장소를 찾을 수 없습니다.\n검색어: ${query}`);
        return;
      }

      const result = response?.v2?.addresses?.[0];
      const lat = Number(result?.y);
      const lng = Number(result?.x);
      if (!result || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        void alert("장소의 좌표를 확인하지 못했습니다.");
        return;
      }

      const place: TripPlace = {
        id: crypto.randomUUID(),
        day: selectedDay,
        order: targetDay.places.length + 1,
        name: normalizedName,
        category: "관광",
        description: "",
        lat,
        lng,
        stayMinutes: 60,
        naverPlace: { address: result.jibunAddress || "", roadAddress: result.roadAddress || "" },
      };

      setSearchTarget(null);
      setTarget({ lat, lng });
      onPlaceAdd?.(place);
    });
  }, [navermaps, onPlaceAdd, selectedDay, tripPlan]);

  return (
    <div className="relative h-full min-h-[720px] w-full">
      <Container className="h-full min-h-[720px] w-full overflow-hidden rounded-2xl">
        <NaverMap defaultCenter={{ lat: KOREA_DEFAULT_VIEW.lat, lng: KOREA_DEFAULT_VIEW.lng }} defaultZoom={KOREA_DEFAULT_VIEW.zoom}>
          <DomesticMapController target={target} zoom={searchTarget ? SEARCH_ZOOM : CLOSEUP_ZOOM} onMapClick={handleMapClick} />
          <DomesticMapSearch request={searchRequest} onSearchingChange={setSearching} onTargetChange={setTarget} onSearchTargetChange={setSearchTarget} onHistoryAdd={addHistory} onOpenHistory={() => setRightPanel("history")} onSearchResults={handleSearchResults} />
          <DomesticSearchMarker target={searchTarget} />

          {plannedPlaces.length > 0 && (
            <>
              <DomesticRouteViewport places={plannedPlaces} focusTarget={searchTarget} />
              <DomesticPlannedRoute places={plannedPlaces} />
              <DomesticPlannedPlaceMarkers places={plannedPlaces} selectedPlaceId={selectedPlace?.id ?? null} onSelect={handleSelectPlace} />
            </>
          )}
        </NaverMap>
      </Container>

      {showHistory && (
        <>
          <button
            type="button"
            onClick={() => setRightPanel((current) => (current ? null : "history"))}
            className={`absolute right-1 top-1/2 z-30 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-neutral-200 bg-white text-neutral-400 shadow-sm transition-all duration-300 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-500 dark:hover:text-neutral-200 ${rightPanel ? "translate-x-[-360px] max-[520px]:translate-x-[calc(-88vw+20px)]" : "translate-x-0"}`}
            aria-label={rightPanel ? "오른쪽 패널 닫기" : "히스토리 패널 열기"}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-300 ${rightPanel ? "rotate-180" : ""}`}>
              <path d="M7 1L2.5 5L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className={`absolute inset-y-0 right-0 z-20 w-[380px] max-w-[88%] p-3 transition-transform duration-300 ease-out ${rightPanel ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-2xl backdrop-blur dark:border-neutral-700 dark:bg-neutral-950/95">
              <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{rightPanel === "place" ? "Naver Place" : "History"}</p><h2 className="mt-1 text-sm font-bold">{rightPanel === "place" ? "장소 정보" : "최근 검색·클릭"}</h2></div>
                <button type="button" onClick={() => setRightPanel(null)} className="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white">×</button>
              </div>

              {rightPanel === "place" && selectedPlace && (
                <section className="min-h-0 flex-1 overflow-y-auto p-4">
                  <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">{selectedPlace.order}</span><div className="min-w-0"><p className="text-base font-bold">{selectedPlace.name}</p><p className="mt-1 text-xs font-medium text-neutral-400">{selectedPlace.category}</p></div></div>
                  <p className="mt-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{selectedPlace.description}</p>
                  <div className="mt-4 space-y-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                    <div className="flex justify-between gap-3 text-xs"><span className="text-neutral-400">추천 체류</span><span className="font-medium">{selectedPlace.stayMinutes}분</span></div>
                    {selectedPlace.naverPlace?.roadAddress && <div className="text-xs leading-5"><span className="text-neutral-400">도로명</span><p className="mt-0.5">{selectedPlace.naverPlace.roadAddress}</p></div>}
                    {selectedPlace.naverPlace?.address && <div className="text-xs leading-5"><span className="text-neutral-400">지번</span><p className="mt-0.5">{selectedPlace.naverPlace.address}</p></div>}
                    {selectedPlace.naverPlace?.telephone && <div className="flex justify-between gap-3 text-xs"><span className="text-neutral-400">전화</span><span className="font-medium">{selectedPlace.naverPlace.telephone}</span></div>}
                  </div>
                  <a href={selectedPlace.naverPlace?.link || `https://map.naver.com/p/search/${encodeURIComponent([selectedPlace.naverPlace?.address, selectedPlace.name].filter(Boolean).join(" "))}`} target="_blank" rel="noreferrer" className="mt-4 block rounded-xl bg-neutral-900 px-3 py-3 text-center text-xs font-semibold text-white hover:opacity-90 dark:bg-white dark:text-neutral-900">네이버 플레이스에서 보기 ↗</a>
                </section>
              )}

              {rightPanel === "history" && (
                <>
                  {searchResults.length > 0 && (
                    <div className="shrink-0 border-b border-neutral-200 p-3 dark:border-neutral-800">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                            Search Results
                          </p>
                          <p className="mt-1 truncate text-sm font-bold">
                            {searchQuery}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-neutral-400">
                          {searchResults.length}개
                        </span>
                      </div>

                      <div className="max-h-48 space-y-1.5 overflow-y-auto">
                        {searchResults.map((item, index) => (
                          <button
                            key={`${item.name}-${item.address}-${index}`}
                            type="button"
                            disabled={item.lat == null || item.lng == null}
                            onClick={() => handleSelectSearchResult(item)}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-left transition hover:border-neutral-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="min-w-0 truncate text-xs font-semibold">
                                {item.name || "이름 없는 장소"}
                              </span>
                              {item.category && (
                                <span className="shrink-0 text-[10px] text-neutral-400">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            {item.roadAddress || item.address ? (
                              <p className="mt-1 truncate text-[10px] leading-4 text-neutral-400">
                                {item.roadAddress || item.address}
                              </p>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <DomesticMapHistoryPanel
                    history={history}
                    now={now}
                    searching={searching}
                    onSelect={handleHistoryClick}
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {tripPlan && (
        <DomesticTripPlannerPanel tripPlan={tripPlan} plannerMode={plannerMode} selectedDay={selectedDay} open={plannerPanelOpen} onToggle={setPlannerPanelOpen} onSelectedDayChange={onSelectedDayChange} onPlaceUpdate={onPlaceUpdate} onPlaceMove={onPlaceMove} onPlaceRemove={onPlaceRemove} onPlaceAdd={handleAddPlace} onPlacesChange={onPlacesChange} />
      )}

    </div>
  );
}

function DomesticMapProvider(props: DomesticMapProps) {
  if (!NAVER_MAP_CLIENT_ID) {
    return <div className="flex h-full min-h-[720px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-sm text-neutral-500">네이버 지도 API 키가 설정되지 않았습니다. <code className="mx-1">.env.local</code>을 확인해주세요.</div>;
  }

  return <NavermapsProvider ncpKeyId={NAVER_MAP_CLIENT_ID} submodules={["geocoder"]}><DomesticMapInner {...props} /></NavermapsProvider>;
}

function DomesticMapFallback() {
  return <div className="flex h-full min-h-[720px] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-center dark:border-neutral-800 dark:bg-neutral-900"><p className="text-sm text-neutral-500">네이버 지도를 불러오는 중입니다...</p></div>;
}

export default function DomesticMap(props: DomesticMapProps) {
  return <Suspense fallback={<DomesticMapFallback />}><DomesticMapProvider {...props} /></Suspense>;
}
