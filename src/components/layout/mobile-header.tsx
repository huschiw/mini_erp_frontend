"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-white">Smart Inventory</h1>
        <p className="text-xs text-zinc-400">ERP System</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-white hover:bg-zinc-800 px-2"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </header>
  );
}
