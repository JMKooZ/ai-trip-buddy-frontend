import type { TripPlace } from "@/app/types/trip";

function getNaverSearchUrl(place: TripPlace) {
  const query = [place.naverPlace?.address, place.name].filter(Boolean).join(" ");
  return `https://map.naver.com/p/search/${encodeURIComponent(query || place.name)}`;
}

interface TripPlaceCardProps {
  place: TripPlace;
  dayNumber: number;
  plannerMode: "ai" | "custom";
  onSelect: (place: TripPlace) => void;
  onEditDay: (dayNumber: number) => void;
  onDelete: (dayNumber: number, placeId: string) => void;
}

export default function TripPlaceCard({
  place,
  dayNumber,
  plannerMode,
  onSelect,
  onEditDay,
  onDelete,
}: TripPlaceCardProps) {
  return (
    <div
      className="group rounded-lg border border-neutral-100 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-950"
      title={place.description || "상세 설명이 없습니다."}
      onClick={() => onSelect(place)}
    >
      <div className="flex items-start gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white dark:bg-white dark:text-neutral-900">
          {place.order}
        </span>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              window.open(getNaverSearchUrl(place), "_blank", "noopener,noreferrer");
            }}
            className="block max-w-full truncate text-left text-xs font-semibold underline-offset-2 hover:underline"
            title="네이버 지도에서 검색"
          >
            {place.name}
          </button>
          <p className="mt-0.5 text-[10px] text-neutral-400">
            {place.category} · {place.stayMinutes}분
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(place);
            }}
            className="mt-1 block w-full truncate text-left text-[11px] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {place.description || "상세 설명이 없습니다."}
          </button>
        </div>

        {plannerMode === "custom" ? (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEditDay(dayNumber);
              }}
              className="rounded-md px-1.5 py-1 text-[10px] text-neutral-400 hover:bg-white hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
              title="이 DAY의 장소 수정"
            >
              수정
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(dayNumber, place.id);
              }}
              className="rounded-md px-1.5 py-1 text-[10px] text-neutral-400 hover:bg-white hover:text-red-500 dark:hover:bg-neutral-900"
              title="장소 삭제"
            >
              삭제
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEditDay(dayNumber);
            }}
            className="shrink-0 rounded-md px-1.5 py-1 text-[10px] text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-900 dark:hover:text-white"
            title="이 장소를 수정"
          >
            수정
          </button>
        )}
      </div>
    </div>
  );
}