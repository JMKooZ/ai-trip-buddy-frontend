import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppDialogProvider } from "@/app/components/ui/AppDialogProvider";
import { AuthProvider } from "@/app/components/auth/AuthProvider";

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
          <AuthProvider>
            <AppDialogProvider>{children}</AppDialogProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}