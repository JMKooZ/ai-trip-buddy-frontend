"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { useAppDialog } from "@/app/components/ui/AppDialogProvider";
import { saveTripPlan } from "@/app/lib/api/tripApi";
import LoginModal from "@/app/components/auth/LoginModal";
import type { TripPlan } from "@/app/types/trip";

const DRAFT_TRIP_PLAN_KEY = "draft-trip-plan";

interface SaveTripButtonProps {
  plan: TripPlan | null;
}

export default function SaveTripButton({ plan }: SaveTripButtonProps) {
  const { user } = useAuth();
  const { confirm, success, alert } = useAppDialog();
  const [loginOpen, setLoginOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const pending = window.sessionStorage.getItem(DRAFT_TRIP_PLAN_KEY);
    if (!pending) return;

    (async () => {
      try {
        const restoredPlan = JSON.parse(pending) as TripPlan;
        await saveTripPlan(restoredPlan);
        window.sessionStorage.removeItem(DRAFT_TRIP_PLAN_KEY);
        await success("로그인 후 여행 계획이 자동으로 저장되었습니다!");
      } catch (error) {
        console.error("자동 저장 실패", error);
      }
    })();
  }, [user]);

  const handleSave = async () => {
    if (!plan || plan.days.every((day) => day.places.length === 0)) {
      void alert("저장할 여행 일정이 없습니다. 먼저 일정을 만들어주세요.");
      return;
    }

    if (!user) {
      const goLogin = await confirm(
        "로그인 후 저장 가능합니다.",
        "로그인이 필요해요",
        "로그인",
        "취소",
      );
      if (goLogin) setLoginOpen(true);
      return;
    }

    setSaving(true);
    try {
      await saveTripPlan(plan);
      window.sessionStorage.removeItem(DRAFT_TRIP_PLAN_KEY);
      await success("여행 계획이 저장되었습니다!");
    } catch (error) {
      console.error("여행 계획 저장 실패", error);
      void alert("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {saving ? "저장 중..." : "여행 계획 저장"}
      </button>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}