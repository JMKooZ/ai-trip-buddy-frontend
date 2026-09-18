"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { fetchMyTrips, type SavedTripSummary } from "@/app/lib/api/tripApi";

export default function MyPage() {
  const { user, loading } = useAuth();
  const [trips, setTrips] = useState<SavedTripSummary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLoadingTrips(false);
      return;
    }
    fetchMyTrips()
      .then(setTrips)
      .finally(() => setLoadingTrips(false));
  }, [loading, user]);

  if (!loading && !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-neutral-500">로그인이 필요한 페이지입니다.</p>
        <Link
          href="/"
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
        >
          홈으로 이동
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          ← 홈으로
        </Link>
        <h1 className="mt-2 text-2xl font-bold">마이페이지</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {user?.nickname}님이 저장한 여행 계획
        </p>
      </div>

      {loadingTrips ? (
        <p className="text-sm text-neutral-400">불러오는 중...</p>
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-10 text-center text-sm text-neutral-400 dark:border-neutral-700">
          아직 저장한 여행 계획이 없습니다.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {trips.map((trip) => (
            <li
              key={trip.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                {trip.durationLabel}
              </p>
              <h2 className="mt-1 text-lg font-bold">{trip.destination}</h2>
              <p className="mt-2 text-xs text-neutral-400">
                {new Date(trip.createdAt).toLocaleDateString("ko-KR")} 저장됨
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}