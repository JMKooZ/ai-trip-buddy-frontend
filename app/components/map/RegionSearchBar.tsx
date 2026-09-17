"use client";

import { useState } from "react";
import { useAppDialog } from "@/app/components/ui/AppDialogProvider";

interface RegionSearchBarProps {
  placeholder: string;
  onSearch: (query: string) => void;
  loading?: boolean;
}

export default function RegionSearchBar({
  placeholder,
  onSearch,
  loading,
}: RegionSearchBarProps) {
  const [query, setQuery] = useState("");
  const { alert, success } = useAppDialog();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!query.trim()) {
      void alert("장소를 입력해주세요.");
      return;
    }
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm shadow-sm outline-none focus:border-neutral-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "검색 중..." : "검색"}
      </button>
    </form>
  );
}