"use client";

import { useMemo, useState } from "react";
import type {
  TripDuration,
  TripPlan,
  TravelStyle,
} from "@/app/types/trip";
import RegionSearchBar from "@/app/components/map/RegionSearchBar";

interface TripPlannerProps {
  onPlanGenerated: (plan: TripPlan) => void;
  onMapSearch: (query: string) => void;
}

const TRAVEL_STYLES: TravelStyle[] = [
  "맛집",
  "카페",
  "자연",
  "관광",
  "휴식",
  "액티비티",
];

const DESTINATION_PRESETS = ["제주도", "서울", "부산"];

function createMockPlan(
  destination: string,
  duration: TripDuration,
  nights: number,
  styles: TravelStyle[]
): TripPlan {
  const normalized = destination.trim() || "제주도";
  const isJeju = normalized.includes("제주");
  const isBusan = normalized.includes("부산");

  const places = isBusan
    ? [
        [
          "부산역",
          "이동",
          "여행의 시작점에서 가볍게 일정 시작",
          35.1151,
          129.0414,
        ],
        [
          "흰여울문화마을",
          "관광",
          "바다를 보며 천천히 산책하기 좋은 코스",
          35.0784,
          129.0453,
        ],
        [
          "자갈치시장",
          "맛집",
          "부산 대표 먹거리와 시장 분위기 즐기기",
          35.0966,
          129.0306,
        ],
        [
          "광안리 해변",
          "휴식",
          "저녁 시간 바다와 야경 감상",
          35.1532,
          129.1187,
        ],
      ]
    : isJeju
      ? [
          [
            "제주공항",
            "이동",
            "도착 후 렌터카 수령 및 여행 시작",
            33.5104,
            126.4914,
          ],
          [
            "용두암",
            "관광",
            "공항 근처에서 가볍게 제주 바다 감상",
            33.5162,
            126.5126,
          ],
          [
            "애월 카페거리",
            "카페",
            "바다를 보며 여유롭게 카페 타임",
            33.4637,
            126.3096,
          ],
          [
            "협재 해수욕장",
            "자연",
            "노을과 함께 제주 서쪽 대표 해변 즐기기",
            33.394,
            126.2396,
          ],
        ]
      : [
          [
            `${normalized} 중심지`,
            "관광",
            "여행지의 대표 명소부터 시작",
            37.5665,
            126.978,
          ],
          [
            `${normalized} 맛집`,
            "맛집",
            "현지에서 많이 찾는 음식 중심으로 구성",
            37.5701,
            126.982,
          ],
          [
            `${normalized} 카페`,
            "카페",
            "일정 중간에 쉬어가는 카페 코스",
            37.565,
            126.99,
          ],
          [
            `${normalized} 대표 명소`,
            "관광",
            "여행의 마지막을 대표 장소로 마무리",
            37.575,
            127.0,
          ],
        ];

  const firstDayPlaces = places.map((place, index) => ({
    id: `${normalized}-${index}`,
    day: 1,
    order: index + 1,
    name: place[0] as string,
    category: place[1] as string,
    description: place[2] as string,
    lat: Number(place[3]),
    lng: Number(place[4]),
    stayMinutes:
      index === 0
        ? 30
        : index === places.length - 1
          ? 90
          : 60,
  }));

  const dayCount =
    duration === "day"
      ? 1
      : Math.max(2, Math.min(nights + 1, 4));

  const days = Array.from(
    { length: dayCount },
    (_, dayIndex) => {
      const day = dayIndex + 1;

      if (day === 1) {
        return {
          day,
          title: "도착 · 대표 명소 중심",
          places: firstDayPlaces,
        };
      }

      return {
        day,
        title:
          day === dayCount
            ? "마무리 · 여유롭게 귀환"
            : "핵심 관광 · 맛집 중심",
        places: firstDayPlaces
          .slice()
          .reverse()
          .map((place, index) => ({
            ...place,
            id: `${place.id}-day-${day}`,
            day,
            order: index + 1,
          })),
      };
    }
  );

  const styleText =
    styles.length > 0
      ? styles.join(" · ")
      : "균형 있는 여행";

  const durationLabel =
    duration === "day"
      ? "당일치기"
      : `${nights}박 ${nights + 1}일`;

  return {
    destination: normalized,
    durationLabel,
    summary: `${normalized} · ${durationLabel} · ${styleText}를 기준으로 AI가 여행의 큰 흐름을 먼저 구성하는 화면입니다.`,
    days,
  };
}

export default function TripPlanner({
  onPlanGenerated,
  onMapSearch,
}: TripPlannerProps) {
  const [destination, setDestination] = useState("제주도");
  const [duration, setDuration] =
    useState<TripDuration>("stay");
  const [nights, setNights] = useState(2);
  const [styles, setStyles] =
    useState<TravelStyle[]>(["맛집", "자연"]);
  const [request, setRequest] = useState("");
  const [generating, setGenerating] = useState(false);

  const durationText = useMemo(() => {
    return duration === "day"
      ? "당일치기"
      : `${nights}박 ${nights + 1}일`;
  }, [duration, nights]);

  const toggleStyle = (style: TravelStyle) => {
    setStyles((prev) =>
      prev.includes(style)
        ? prev.filter((item) => item !== style)
        : [...prev, style]
    );
  };

  const handleGenerate = () => {
    setGenerating(true);

    window.setTimeout(() => {
      const plan = createMockPlan(
        destination,
        duration,
        nights,
        styles
      );

      onPlanGenerated(plan);
      setGenerating(false);
    }, 500);
  };

  return (
    <section className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:p-6">
      <div className="mb-6">
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Trip Map Search
          </p>

          <RegionSearchBar
            placeholder="지역이나 장소를 검색해보세요"
            onSearch={onMapSearch}
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          AI Trip Planner
        </p>

        <h2 className="mt-2 text-xl font-bold tracking-tight md:text-2xl">
          어디로, 얼마나 떠날까요?
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          여행 조건을 입력하면 AI가 먼저 전체 동선을 구조화하고,
          그 다음 장소를 하나씩 조정할 수 있게 만드는 흐름입니다.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            여행지
          </label>

          <input
            value={destination}
            onChange={(event) =>
              setDestination(event.target.value)
            }
            placeholder="예: 제주도, 부산, 서울"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
          />

          <div className="mt-2 flex flex-wrap gap-2">
            {DESTINATION_PRESETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDestination(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  destination === item
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            여행 기간
          </label>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setDuration("day")}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                duration === "day"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white"
                  : "text-neutral-500"
              }`}
            >
              당일치기
            </button>

            <button
              type="button"
              onClick={() => setDuration("stay")}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                duration === "stay"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white"
                  : "text-neutral-500"
              }`}
            >
              숙박 여행
            </button>
          </div>

          {duration === "stay" && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-700">
              <span className="text-sm text-neutral-500">
                숙박
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setNights((value) =>
                      Math.max(1, value - 1)
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700"
                >
                  −
                </button>

                <span className="w-12 text-center text-sm font-semibold">
                  {durationText}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setNights((value) =>
                      Math.min(7, value + 1)
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            여행 스타일
          </label>

          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((style) => {
              const selected = styles.includes(style);

              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium ${
                    selected
                      ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700"
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            원하는 여행이 있다면
          </label>

          <textarea
            value={request}
            onChange={(event) =>
              setRequest(event.target.value)
            }
            placeholder="예: 너무 빡빡하지 않게, 맛집은 꼭 포함해줘"
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 outline-none focus:border-neutral-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
          />
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={
            generating || !destination.trim()
          }
          className="w-full rounded-xl bg-neutral-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          {generating
            ? "AI가 여행 구조를 만드는 중..."
            : "AI로 여행 일정 만들기"}
        </button>
      </div>
    </section>
  );
}