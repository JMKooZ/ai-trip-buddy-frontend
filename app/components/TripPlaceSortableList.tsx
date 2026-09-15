"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TripPlace } from "@/app/types/trip";

interface TripPlaceSortableListProps {
  places: TripPlace[];
  onUpdate?: (placeId: string, field: "name" | "category" | "description", value: string) => void;
  onMove?: (index: number, direction: -1 | 1) => void;
  onRemove?: (placeId: string) => void;
  onReorder: (places: TripPlace[]) => void;
  compact?: boolean;
}

function SortablePlaceItem({
  place,
  index,
  total,
  onUpdate,
  onMove,
  onRemove,
  compact,
}: {
  place: TripPlace;
  index: number;
  total: number;
  onUpdate?: TripPlaceSortableListProps["onUpdate"];
  onMove?: TripPlaceSortableListProps["onMove"];
  onRemove?: TripPlaceSortableListProps["onRemove"];
  compact?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-start gap-2 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${
        compact ? "p-2" : "p-3"
      } ${isDragging ? "z-50 opacity-80 shadow-xl" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`${place.order}번 장소 드래그해서 순서 변경`}
        title="이 부분을 잡고 드래그해서 순서를 변경하세요"
        className="mt-0.5 flex h-9 w-8 shrink-0 cursor-grab touch-none select-none flex-col items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 active:cursor-grabbing dark:bg-neutral-800 dark:text-neutral-300"
      >
        <span className="text-[11px] leading-3">⠿</span>
        <span className="text-[10px] font-bold leading-3">{place.order}</span>
      </button>

      <div className="min-w-0 flex-1 space-y-1.5">
        {onUpdate ? (
          <input
            value={place.name}
            onChange={(event) => onUpdate(place.id, "name", event.target.value)}
            className="w-full bg-transparent text-sm font-semibold outline-none"
            aria-label={`${place.order}번 장소 이름`}
          />
        ) : (
          <p className="truncate text-sm font-semibold">{place.name}</p>
        )}

        {onUpdate ? (
          <input
            value={place.category}
            onChange={(event) => onUpdate(place.id, "category", event.target.value)}
            className="w-full bg-transparent text-xs text-neutral-400 outline-none"
            aria-label={`${place.order}번 장소 카테고리`}
          />
        ) : (
          <p className="text-[10px] text-neutral-400">{place.category}</p>
        )}

        {onUpdate && !compact && (
          <textarea
            value={place.description}
            onChange={(event) => onUpdate(place.id, "description", event.target.value)}
            placeholder="간단한 메모"
            rows={2}
            className="w-full resize-none rounded-lg bg-neutral-50 px-2 py-1.5 text-xs outline-none dark:bg-neutral-950"
            aria-label={`${place.order}번 장소 메모`}
          />
        )}

        {compact && place.description && (
          <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
            {place.description}
          </p>
        )}
      </div>

      {(onMove || onRemove) && (
        <div className="flex shrink-0 flex-col gap-1">
          {onMove && (
            <>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMove(index, -1)}
                aria-label={`${place.order}번 장소 위로 이동`}
                className="h-6 w-6 rounded-md bg-neutral-100 text-xs disabled:opacity-20 dark:bg-neutral-800"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === total - 1}
                onClick={() => onMove(index, 1)}
                aria-label={`${place.order}번 장소 아래로 이동`}
                className="h-6 w-6 rounded-md bg-neutral-100 text-xs disabled:opacity-20 dark:bg-neutral-800"
              >
                ↓
              </button>
            </>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(place.id)}
              aria-label={`${place.order}번 장소 삭제`}
              className="h-6 w-6 rounded-md text-xs text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function TripPlaceSortableList({
  places,
  onUpdate,
  onMove,
  onRemove,
  onReorder,
  compact = false,
}: TripPlaceSortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = places.findIndex((place) => place.id === active.id);
    const newIndex = places.findIndex((place) => place.id === over.id);

    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

    const nextPlaces = [...places];
    const [movedPlace] = nextPlaces.splice(oldIndex, 1);
    nextPlaces.splice(newIndex, 0, movedPlace);

    onReorder(
      nextPlaces.map((place, index) => ({
        ...place,
        order: index + 1,
      })),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={places.map((place) => place.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {places.map((place, index) => (
            <SortablePlaceItem
              key={place.id}
              place={place}
              index={index}
              total={places.length}
              onUpdate={onUpdate}
              onMove={onMove}
              onRemove={onRemove}
              compact={compact}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
