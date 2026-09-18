"use client";

import { loginUrl } from "@/app/lib/api/authApi";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-xs rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-center text-lg font-bold">로그인</h2>
        <p className="mt-1 text-center text-xs text-neutral-500 dark:text-neutral-400">
          간편하게 로그인하고 여행 계획을 저장하세요
        </p>

        <div className="mt-6 flex flex-col gap-3">

          <a href={loginUrl("naver")}
            className="flex items-center justify-center rounded-xl bg-[#03C75A] px-4 py-3 text-sm font-bold text-white"
          >
            네이버로 로그인
          </a>

          <a href={loginUrl("kakao")}
            className="flex items-center justify-center rounded-xl bg-[#FEE500] px-4 py-3 text-sm font-bold text-[#191919]"
          >
            카카오로 로그인
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full text-center text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          닫기
        </button>
      </div>
    </div>
  );
}