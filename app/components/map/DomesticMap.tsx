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
import RegionSearchBar from "@/app/components/map/RegionSearchBar";
import { KOREA_DEFAULT_VIEW, CLOSEUP_ZOOM } from "@/app/lib/map/regions";
import { formatRelativeTime } from "@/app/lib/format/relativeTime";

interface LatLng {
  lat: number;
  lng: number;
}

interface HistoryEntry extends LatLng {
  id: string;
  label: string;
  timestamp: number;
  source: "search" | "click";
}

const NAVER_MAP_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

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

    // 이벤트가 제공하는 좌표를 그대로 사용한다.
    // 화면상의 픽셀 좌표를 임의로 보정하지 않아
    // 실제 클릭 지점과 마커 위치가 일치하도록 한다.
    onMapClick(coord.lat(), coord.lng());
  });

  useEffect(() => {
    if (!map || !target) {
      return;
    }

    const position = new window.naver.maps.LatLng(
      target.lat,
      target.lng
    );

    map.setCenter(position);
    map.setZoom(CLOSEUP_ZOOM);
  }, [map, target]);

  return target ? (
    <Marker
      key={`${target.lat}-${target.lng}`}
      position={target}
    />
  ) : null;
}

function DomesticMapInner() {
  const navermaps = useNavermaps();

  const [target, setTarget] = useState<LatLng | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // 상대 시간을 1초 단위로 갱신한다.
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  const addHistory = (
    entry: LatLng,
    label: string,
    source: HistoryEntry["source"]
  ) => {
    const normalizedLabel =
      label.trim() || "알 수 없는 위치";

    setHistory((prev) => {
      // 같은 장소를 빠르게 연속 클릭/검색했을 경우
      // 중복 기록을 만들지 않는다.
      const duplicate = prev.find(
        (item) =>
          item.label === normalizedLabel &&
          Math.abs(item.lat - entry.lat) < 0.00001 &&
          Math.abs(item.lng - entry.lng) < 0.00001
      );

      if (duplicate) {
        const rest = prev.filter(
          (item) => item.id !== duplicate.id
        );

        return [
          {
            ...duplicate,
            timestamp: Date.now(),
            source,
          },
          ...rest,
        ].slice(0, 20);
      }

      return [
        {
          ...entry,
          id: crypto.randomUUID(),
          label: normalizedLabel,
          timestamp: Date.now(),
          source,
        },
        ...prev,
      ].slice(0, 20);
    });
  };

  const handleSearch = (query: string) => {
    if (!navermaps?.Service) {
      window.alert(
        "지도 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    setSearching(true);

    navermaps.Service.geocode(
      { query },
      (status: string, response: any) => {
        setSearching(false);

        if (status !== navermaps.Service.Status.OK) {
          window.alert(
            "검색 결과가 없어요. 다른 지역명이나 장소명으로 시도해보세요."
          );
          return;
        }

        const result = response?.v2?.addresses?.[0];

        if (!result) {
          window.alert(
            "검색 결과를 가져오지 못했습니다. 다시 시도해주세요."
          );
          return;
        }

        const lat = Number(result.y);
        const lng = Number(result.x);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return;
        }

        const searchedLabel =
          result.roadAddress ||
          result.jibunAddress ||
          query;

        setTarget({
          lat,
          lng,
        });

        addHistory(
          {
            lat,
            lng,
          },
          searchedLabel,
          "search"
        );
      }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    // 클릭 좌표 자체는 보정하지 않는다.
    // 지도 SDK가 전달한 실제 WGS84 좌표를 사용한다.
    const clickedPoint = {
      lat,
      lng,
    };

    // 클릭 즉시 마커와 지도를 이동시킨다.
    // reverse geocode 결과를 기다리지 않는다.
    setTarget(clickedPoint);

    if (!navermaps?.Service) {
      addHistory(
        clickedPoint,
        `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        "click"
      );
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
        // reverse geocoding이 실패하더라도
        // 지도 클릭 자체는 이미 성공했으므로
        // 좌표를 기준으로 기록을 남긴다.
        if (
          status !== navermaps.Service.Status.OK
        ) {
          addHistory(
            clickedPoint,
            `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            "click"
          );
          return;
        }

        const address = response?.v2?.address;
        const result = response?.v2?.results?.[0];
        const region = result?.region;

        // 사람이 이해하기 쉬운 지역명을 우선한다.
        //
        // 예:
        // 서울특별시 강남구 역삼동
        // 경기도 성남시 분당구 정자동
        const area1 = region?.area1?.name;
        const area2 = region?.area2?.name;
        const area3 = region?.area3?.name;

        const regionLabel = [
          area1,
          area2,
          area3,
        ]
          .filter(Boolean)
          .join(" ");

        const addressLabel =
          address?.roadAddress ||
          address?.jibunAddress;

        const label =
          regionLabel ||
          addressLabel ||
          `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        addHistory(
          clickedPoint,
          label,
          "click"
        );
      }
    );
  };

  return (
    <div
      className={`grid gap-4 transition-[grid-template-columns] duration-500 ease-in-out ${
        history.length > 0
          ? "md:grid-cols-[1fr_280px]"
          : "md:grid-cols-1"
      }`}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <RegionSearchBar
          placeholder="국내 지역/장소 검색"
          onSearch={handleSearch}
          loading={searching}
        />

        <Container className="h-[60vh] w-full overflow-hidden rounded-xl transition-[height] duration-500 md:h-[75vh]">
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
          </NaverMap>
        </Container>
      </div>

      {history.length > 0 && (
        <aside className="history-panel max-h-[75vh] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            최근 검색·클릭
          </h2>

          <div className="history-list">
            {history.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setTarget({
                    lat: item.lat,
                    lng: item.lng,
                  })
                }
                className="history-item group"
              >
                <span className="history-index">
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {item.label}
                  </span>

                  <span className="mt-1 block text-xs text-neutral-400">
                    {formatRelativeTime(
                      item.timestamp,
                      now
                    )}

                    <span className="ml-2 opacity-60">
                      {item.source === "search"
                        ? "검색"
                        : "지도 클릭"}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

function DomesticMapProvider() {
  if (!NAVER_MAP_CLIENT_ID) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-500 md:h-[75vh]">
        네이버 지도 API 키가 설정되지 않았습니다.
        <code className="mx-1">.env.local</code>
        을 확인해주세요.
      </div>
    );
  }

  return (
    <NavermapsProvider
      ncpKeyId={NAVER_MAP_CLIENT_ID}
      submodules={["geocoder"]}
    >
      <DomesticMapInner />
    </NavermapsProvider>
  );
}

function DomesticMapFallback() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 text-center dark:border-neutral-800 dark:bg-neutral-900 md:h-[75vh]">
      <p className="text-sm text-neutral-500">
        네이버 지도를 불러오는 중입니다...
      </p>
    </div>
  );
}

export default function DomesticMap() {
  return (
    <Suspense fallback={<DomesticMapFallback />}>
      <DomesticMapProvider />
    </Suspense>
  );
}