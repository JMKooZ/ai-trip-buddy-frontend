"use client";

import { useEffect, useRef } from "react";
import { useMap, useNavermaps } from "react-naver-maps";
import type { DomesticMapSearchRequest, HistoryEntry, LatLng } from "./types";

interface DomesticMapSearchProps {
  request?: DomesticMapSearchRequest;
  onSearchingChange: (searching: boolean) => void;
  onTargetChange: (target: LatLng | null) => void;
  onSearchTargetChange: (target: LatLng | null) => void;
  onHistoryAdd: (entry: Omit<HistoryEntry, "id" | "timestamp"> & { id?: string }) => void;
  onOpenHistory: () => void;
}

export default function DomesticMapSearch({
  request,
  onSearchingChange,
  onTargetChange,
  onSearchTargetChange,
  onHistoryAdd,
  onOpenHistory,
}: DomesticMapSearchProps) {
  const map = useMap();
  const navermaps = useNavermaps();
  const processedRequestId = useRef<number | null>(null);

  const callbacksRef = useRef({
    onSearchingChange,
    onTargetChange,
    onSearchTargetChange,
    onHistoryAdd,
    onOpenHistory,
  });

  useEffect(() => {
    callbacksRef.current = {
      onSearchingChange,
      onTargetChange,
      onSearchTargetChange,
      onHistoryAdd,
      onOpenHistory,
    };
  }, [
    onSearchingChange,
    onTargetChange,
    onSearchTargetChange,
    onHistoryAdd,
    onOpenHistory,
  ]);

  useEffect(() => {
    const query = request?.query.trim();
    const requestId = request?.id;

    if (!map || !navermaps || !query || !requestId) return;
    if (processedRequestId.current === requestId) return;

    processedRequestId.current = requestId;

    let cancelled = false;
    let timer: number | undefined;

    const fail = (message: string) => {
      if (cancelled) return;

      callbacksRef.current.onSearchingChange(false);
      callbacksRef.current.onSearchTargetChange(null);
      window.alert(message);
    };

    const execute = () => {
      if (cancelled) return;

      const service = navermaps.Service;

      if (!service?.geocode || !service?.Status) {
        timer = window.setTimeout(execute, 100);
        return;
      }

      callbacksRef.current.onSearchingChange(true);

      service.geocode({ query }, (status: string, response: any) => {
        if (cancelled) return;

        callbacksRef.current.onSearchingChange(false);

        if (status !== service.Status.OK) {
          fail(`검색 결과를 찾지 못했습니다.\n검색어: ${query}`);
          return;
        }

        const result = response?.v2?.addresses?.[0];
        const lat = Number(result?.y);
        const lng = Number(result?.x);

        if (!result || !Number.isFinite(lat) || !Number.isFinite(lng)) {
          fail(
            `검색 결과의 위치를 확인하지 못했습니다.\n검색어: ${query}\n\n현재 Trip Map Search는 네이버 지도 Geocoder를 사용하므로 주소 기반 검색이 필요합니다. 장소명 검색은 네이버 장소 검색 API 연결 후 지원합니다.`,
          );
          return;
        }

        const target = { lat, lng };
        const jibunAddress = result.jibunAddress || "";
        const roadAddress = result.roadAddress || "";
        const exactSearchQuery = [jibunAddress, query]
          .filter(Boolean)
          .join(" ");

        map.setCenter(new navermaps.LatLng(lat, lng));
        map.setZoom(16);

        callbacksRef.current.onTargetChange(target);
        callbacksRef.current.onSearchTargetChange(target);
        callbacksRef.current.onOpenHistory();
        callbacksRef.current.onHistoryAdd({
          id: crypto.randomUUID(),
          lat,
          lng,
          label: query,
          source: "search",
          naverPlaceUrl: `https://map.naver.com/p/search/${encodeURIComponent(
            exactSearchQuery || query,
          )}`,
          query,
          address: jibunAddress,
          roadAddress,
        });
      });
    };

    execute();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      callbacksRef.current.onSearchingChange(false);
    };
  }, [map, navermaps, request?.id, request?.query]);

  return null;
}
