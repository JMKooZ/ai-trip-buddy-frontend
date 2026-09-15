"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const OPTIONS = [
  { key: "light", label: "라이트" },
  { key: "dark", label: "다크" },
  { key: "system", label: "시스템" },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1 text-sm shadow-sm transition-all duration-500 dark:border-neutral-700 dark:bg-neutral-900">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => setTheme(opt.key)}
          className={`rounded-full px-3 py-1 transition-all duration-300 ease-out ${
            theme === opt.key
              ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
