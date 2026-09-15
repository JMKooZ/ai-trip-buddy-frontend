"use client";

import type { RegionMode } from "@/app/types/map";

interface RegionTabsProps {
  value: RegionMode;
  onChange: (mode: RegionMode) => void;
}

export default function RegionTabs({ value, onChange }: RegionTabsProps) {
  return (
    <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {(
        [
          { key: "domestic", label: "국내" },
          { key: "overseas", label: "해외" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ease-out ${
            value === tab.key
              ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
