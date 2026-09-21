"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { useAppDialog } from "@/app/components/ui/AppDialogProvider";
import {
  fetchTripDetail,
  deleteTripPlan,
  type SavedTripDetail,
} from "@/app/lib/api/tripApi";

const DRAFT_TRIP_PLAN_KEY = "draft-trip-plan";
const DRAFT_TRIP_ID_KEY = "draft-trip-id";

export default function SavedTripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { confirm, alert } = useAppDialog();

  const [detail, setDetail] = useState<SavedTripDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    fetchTripDetail(Number(params.id))
      .then(setDetail)
      .catch(() => setNotFound(true))
      .finally(() => setFetching(false));
  }, [loading, user, params.id]);

  const handleEdit = () => {
    if (!detail) return;
    window.sessionStorage.setItem(DRAFT_TRIP_PLAN_KEY, JSON.stringify(detail.plan));
    window.sessionStorage.setItem(DRAFT_TRIP_ID_KEY, String(detail.id));
    router.push("/");
  };

  const handleDelete = async () => {
    if (!detail) return;
    const confirmed = await confirm(
      "이 여행 계획을 삭제할까요? 삭제하면 되돌릴 수 없습니다.",
      "여행 계획 삭제",
      "삭제",
      "취소",
    );
    if (!confirmed) return;

    try {
      await deleteTripPlan(detail.id);
      router.push("/mypage");
    } catch (error) {
      console.error("삭제 실패", error);
      void alert("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  if (!loading && !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-neutral-500">로그인이 필요한 페이지입니다.</p>
        <Link href="/" className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
          홈으로 이동
        </Link>
      </main>
    );
  }

  if (fetching) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
        <p className="text-sm text-neutral-400">불러오는 중...</p>
      </main>
    );
  }

  if (notFound || !detail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-neutral-500">여행 계획을 찾을 수 없습니다.</p>
        <Link href="/mypage" className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
          마이페이지로
        </Link>
      </main>
    );
  }

  const { plan } = detail;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <Link href="/mypage" className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
          ← 마이페이지
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              {plan.durationLabel}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{plan.destination}</h1>
            <p className="mt-2 text-xs text-neutral-400">
              {new Date(detail.createdAt).toLocaleDateString("ko-KR")} 저장 · 마지막 수정 {new Date(detail.updatedAt).toLocaleDateString("ko-KR")}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
            >
              불러와서 수정
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            >
              삭제
            </button>
          </div>
        </div>

        {plan.summary && (
          <p className="mt-4 text-sm leading-6 text-neutral-500">{plan.summary}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plan.days.map((day) => (
          <div key={day.day} className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">DAY {day.day}</span>
              <span className="text-xs text-neutral-400">{day.places.length}곳</span>
            </div>
            <p className="mt-1 text-sm font-semibold">{day.title}</p>

            <div className="mt-3 space-y-2">
              {day.places.map((place) => (
                <div key={place.id} className="rounded-lg bg-neutral-50 p-2.5 text-xs dark:bg-neutral-900">
                  <p className="font-semibold">{place.order}. {place.name}</p>
                  <p className="mt-0.5 text-neutral-400">{place.category} · {place.stayMinutes}분</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}