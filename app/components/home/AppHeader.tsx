import AuthWidget from "@/app/components/auth/AuthWidget";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function AppHeader() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          AI-Trip Buddy
        </h1>
        <p className="mt-1 text-xs text-neutral-500 md:text-sm">
          여행을 계획하는 시간을 줄여주는 AI 여행 플래너
        </p>
      </div>
      <div className="flex items-center gap-3">
        <AuthWidget />
        <ThemeToggle />
      </div>
    </header>
  );
}