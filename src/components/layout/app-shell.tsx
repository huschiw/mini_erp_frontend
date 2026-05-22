"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <MobileHeader isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8">{children}</main>
    </div>
  );
}
