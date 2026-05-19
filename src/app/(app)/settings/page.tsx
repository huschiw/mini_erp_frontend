"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { User, Mail, Shield } from "lucide-react";

export default function SettingsPage() {
  const user = getUser();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-zinc-500">Manage your account and preferences</p>
      </div>

      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <User className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-zinc-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <div className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                  <User className="h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-900 dark:text-white">{user?.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <div className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-900 dark:text-white">{user?.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                <div className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                  <Shield className="h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-900 dark:text-white">{user?.role}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>Smart Inventory ERP System</p>
            <p>Version: 1.0.0</p>
            <p>Built with Next.js, Prisma, and PostgreSQL</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
