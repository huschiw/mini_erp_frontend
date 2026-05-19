"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderTree, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const user = getUser();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    lowStock: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, categories] = await Promise.all([
          api.getProducts({ limit: 100 }),
          api.getCategories(),
        ]);
        const lowStock = productsRes.data.filter(
          (p) => p.stock <= p.minimumStock
        ).length;
        setStats({
          products: productsRes.pagination.total,
          categories: categories.length,
          lowStock,
        });
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  const cards = [
    {
      title: "Total Products",
      value: stats.products,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Categories",
      value: stats.categories,
      icon: FolderTree,
      color: "text-green-600",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
      <p className="mt-1 text-zinc-500">
        Welcome back, {user?.name}. Phase 1 overview.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">
                {title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-zinc-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
