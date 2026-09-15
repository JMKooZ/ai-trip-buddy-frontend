"use client";

import { useEffect } from "react";
import type { TripPlace } from "@/app/types/trip";

interface TripPlaceDetailModalProps {
  place: TripPlace | null;
  onClose: () => void;
}

export default function TripPlaceDetailModal({
  place,
  onClose,
}: TripPlaceDetailModalProps) {
  useEffect(() => {
    if (!place) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [place, onClose]);

  if (!place) return null;

  const naverSearchUrl = `https://map.naver.com/p/search/${encodeURIComponent(place.name)}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-place-detail-title"
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-neutral-400">
              DAY {place.day} · {place.order}번째 장소
            </p>
            <h3 id="trip-place-detail-title" className="mt-1 text-lg font-bold">
              {place.name}
            </h3>
            <p className="mt-1 text-xs text-neutral-400">{place.category}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="상세보기 닫기"
          >
            ×
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-950">
          <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
            {place.description || "등록된 상세 설명이 없습니다."}
          </p>
        </div>

        <div className="mt-4 space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-neutral-400">예상 체류</span>
            <span className="font-semibold">{place.stayMinutes}분</span>
          </div>

          {place.naverPlace?.roadAddress && (
            <div className="text-sm leading-6">
              <p className="text-xs text-neutral-400">도로명 주소</p>
              <p className="mt-1">{place.naverPlace.roadAddress}</p>
            </div>
          )}

          {place.naverPlace?.address && (
            <div className="text-sm leading-6">
              <p className="text-xs text-neutral-400">지번 주소</p>
              <p className="mt-1">{place.naverPlace.address}</p>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold dark:border-neutral-700"
          >
            닫기
          </button>
          <a
            href={naverSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
          >
            네이버에서 검색
          </a>
        </div>
      </div>
    </div>
  );
}
