"use client";

import { useEffect, useState } from "react";
import type { TripPlan } from "@/app/types/trip";

declare global {
  interface Window {
    Kakao: any;
  }
}

interface ShareTripButtonProps {
  plan: TripPlan | null;
}

export default function ShareTripButton({ plan }: ShareTripButtonProps) {
  const [kakaoReady, setKakaoReady] = useState(false);

  useEffect(() => {
    if (window.Kakao?.isInitialized()) {
      setKakaoReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
      setKakaoReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleKakaoShare = () => {
    if (!kakaoReady || !plan) return;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${plan.destination} 여행 일정`,
        description: plan.summary || "AI-Trip Buddy로 만든 여행 일정을 확인해보세요",
        imageUrl: `${window.location.origin}/og-trip.png`,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      buttons: [{ title: "일정 보기", link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
    });
  };

  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: plan ? `${plan.destination} 여행 일정` : "AI-Trip Buddy",
          text: plan?.summary,
          url: shareUrl,
        });
      } catch {
        // 사용자가 공유를 취소함
      }
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    window.alert("링크가 복사되었습니다. 인스타그램 등에 붙여넣어 공유해보세요.");
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleKakaoShare}
        disabled={!kakaoReady}
        className="rounded-xl bg-[#FEE500] px-3 py-2.5 text-xs font-bold text-[#191919] disabled:opacity-50"
      >
        카카오톡 공유
      </button>
      <button
        type="button"
        onClick={handleGenericShare}
        className="rounded-xl border border-neutral-200 px-3 py-2.5 text-xs font-bold dark:border-neutral-700"
      >
        공유하기
      </button>
    </div>
  );
}