import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppDialogProvider } from "@/app/components/ui/AppDialogProvider";

export const metadata: Metadata = {
  title: "AI-Trip Buddy",
  description: "AI 기반 맞춤형 여행 플래너",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppDialogProvider>{children}</AppDialogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
