"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { clearAuth, getToken, isSessionExpired } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken() || isSessionExpired()) {
      clearAuth();
      router.replace("/login");
      return;
    }

    const interval = setInterval(() => {
      if (isSessionExpired()) {
        clearAuth();
        router.replace("/login");
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  return <AppShell>{children}</AppShell>;
}
