"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { logout as logoutApi } from "@/app/lib/api/authApi";
import LoginModal from "@/app/components/auth/LoginModal";

export default function AuthWidget() {
  const { user, loading, refresh } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutApi();
    await refresh();
    setMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          로그인
        </button>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-semibold dark:border-neutral-700"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white dark:bg-white dark:text-neutral-900">
          {user.nickname?.[0] ?? "U"}
        </span>
        {user.nickname}
      </button>

      {menuOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <Link
            href="/mypage"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            마이페이지
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}