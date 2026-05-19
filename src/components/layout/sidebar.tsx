"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ArchiveRestore,
  ArchiveX,
  History,
  LogOut,
  Settings,
  Activity,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuth, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/stock-in", label: "Stock In", icon: ArchiveRestore },
  { href: "/stock-out", label: "Stock Out", icon: ArchiveX },
  { href: "/inventory-history", label: "Inventory History", icon: History },
  { href: "/activity-logs", label: "Activity Logs", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    clearAuth();
    router.push("/login");
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-zinc-200 bg-zinc-950 text-white dark:border-zinc-800 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      <div className="border-b border-zinc-800 p-6 pt-12 lg:pt-6">
        <h1 className="text-lg font-bold">Smart Inventory</h1>
        <p className="mt-1 text-xs text-zinc-400">ERP System</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === href
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center justify-between rounded-md bg-zinc-900 px-3 py-2">
          <span className="text-sm text-zinc-300">Theme</span>
          <ThemeToggle />
        </div>
        <div className="mt-3 border-t border-zinc-800 pt-3">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-zinc-400">{user?.email}</p>
          <span className="mt-1 inline-block rounded bg-zinc-800 px-2 py-0.5 text-xs">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
      </aside>
    </>
  );
}
