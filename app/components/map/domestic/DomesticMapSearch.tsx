"use client";

import { useEffect, useRef } from "react";
import { useNavermaps } from "react-naver-maps";
import { useAppDialog } from "@/app/components/ui/AppDialogProvider";
import {
  searchPlaces as searchPlacesApi,
  type PlaceSearchItem,
} from "@/app/lib/api/tripApi";
import type {
  DomesticMapSearchRequest,
  HistoryEntry,
  LatLng,
} from "./types";

interface DomesticMapSearchProps {
  request?: DomesticMapSearchRequest;
  onSearchingChange: (searching: boolean) => void;
  onTargetChange: (target: LatLng | null) => void;
  onSearchTargetChange: (target: LatLng | null) => void;
  onHistoryAdd: (
    entry: Omit<HistoryEntry, "id" | "timestamp"> & { id?: string },
  ) => void;
  onOpenHistory: () => void;
  onSearchResults: (query: string, items: PlaceSearchItem[]) => void;
}

function normalizePlace(item: PlaceSearchItem): PlaceSearchItem | null {
  const lat = Number(item.lat);
  const lng = Number(item.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    ...item,
    lat,
    lng,
  };
}

export default function DomesticMapSearch({
  request,
  onSearchingChange,
  onTargetChange,
  onSearchTargetChange,
  onHistoryAdd,
  onOpenHistory,
  onSearchResults,
}: DomesticMapSearchProps) {
  const navermaps = useNavermaps();
  const processedRequestId = useRef<number | null>(null);
  const { alert } = useAppDialog();

  const callbacksRef = useRef({
    onSearchingChange,
    onTargetChange,
    onSearchTargetChange,
    onHistoryAdd,
    onOpenHistory,
    onSearchResults,
  });

  useEffect(() => {
    callbacksRef.current = {
      onSearchingChange,
      onTargetChange,
      onSearchTargetChange,
      onHistoryAdd,
      onOpenHistory,
      onSearchResults,
    };
  }, [
    onSearchingChange,
    onTargetChange,
    onSearchTargetChange,
    onHistoryAdd,
    onOpenHistory,
    onSearchResults,
  ]);

  useEffect(() => {
    const query = request?.query.trim();
    const requestId = request?.id;

    if (!query || requestId == null) {
      return;
    }

    if (processedRequestId.current === requestId) {
      return;
    }

    processedRequestId.current = requestId;

    let cancelled = false;

    const executePlaceSearch = async () => {
      callbacksRef.current.onSearchingChange(true);

      try {
        const data = await searchPlacesApi(query);

        if (cancelled) {
          return;
        }

        const rawItems = Array.isArray(data?.items) ? data.items : [];
        const normalizedItems = rawItems
          .map(normalizePlace)
          .filter((item): item is PlaceSearchItem => item !== null);

        // 검색 결과 전체는 좌표가 없더라도 UI에 표시할 수 있도록 전달한다.
        callbacksRef.current.onSearchResults(query, rawItems);

        if (normalizedItems.length === 0) {
          callbacksRef.current.onTargetChange(null);
          callbacksRef.current.onSearchTargetChange(null);
          callbacksRef.current.onOpenHistory();

          await alert(
            rawItems.length > 0
              ? `검색 결과는 있지만 지도에 표시할 수 있는 좌표가 없습니다.\n\n검색어: ${query}`
              : `검색 결과가 없습니다.\n\n검색어: ${query}`,
            "장소 검색",
          );
          return;
        }

        const result = normalizedItems[0];
        const target: LatLng = {
          lat: result.lat as number,
          lng: result.lng as number,
        };

        // 지도 제어는 DomesticMapController가 target 변경을 감지해 담당한다.
        callbacksRef.current.onTargetChange(target);
        callbacksRef.current.onSearchTargetChange(target);
        callbacksRef.current.onOpenHistory();

        const naverPlaceUrl =
          result.link ||
          `https://map.naver.com/p/search/${encodeURIComponent(
            [result.address, result.name || query]
              .filter(Boolean)
              .join(" "),
          )}`;

        callbacksRef.current.onHistoryAdd({
          id: crypto.randomUUID(),
          lat: target.lat,
          lng: target.lng,
          label: query,
          source: "search",
          naverPlaceUrl,
          query,
          address: result.address || "",
          roadAddress: result.roadAddress || "",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Naver 장소 검색 실패", error);
        callbacksRef.current.onSearchResults(query, []);
        callbacksRef.current.onSearchTargetChange(null);

        await alert(
          error instanceof Error
            ? error.message
            : `장소 검색에 실패했습니다.\n\n검색어: ${query}`,
          "장소 검색 오류",
        );
      } finally {
        if (!cancelled) {
          callbacksRef.current.onSearchingChange(false);
        }
      }
    };

    void executePlaceSearch();

    return () => {
      cancelled = true;
      callbacksRef.current.onSearchingChange(false);
    };
  }, [request?.id, request?.query, alert]);

  // useNavermaps는 Provider 내부에서 로딩되므로 존재를 확인해 번들 초기화를 보장한다.
  void navermaps;

  return null;
}
