"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import RegionTabs from "@/app/components/map/RegionTabs";
import ThemeToggle from "@/app/components/ThemeToggle";
import type { RegionMode } from "@/app/types/map";

const DomesticMap = dynamic(() => import("@/app/components/map/DomesticMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 md:h-[75vh]">
      국내 지도를 준비하는 중입니다...
    </div>
  ),
});

const OverseasMap = dynamic(() => import("@/app/components/map/OverseasMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 md:h-[75vh]">
      해외 지도를 준비하는 중입니다...
    </div>
  ),
});

export default function Home() {
  const [mode, setMode] = useState<RegionMode>("domestic");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center gap-6 px-4 py-8 transition-colors duration-500 md:px-8 md:py-10">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold transition-colors duration-500 md:text-3xl">AI-Trip Buddy</h1>
        <ThemeToggle />
      </div>

      <RegionTabs value={mode} onChange={setMode} />

      <div
        key={mode}
        className="map-mode-enter w-full"
      >
        {mode === "domestic" ? <DomesticMap /> : <OverseasMap />}
      </div>
    </main>
  );
}
