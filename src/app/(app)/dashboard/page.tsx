"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, DashboardSummary, LowStockProduct } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useTranslation, interpolate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderTree, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const user = getUser();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, lowStockRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getLowStockProducts(10),
      ]);
      setSummary(summaryRes);
      setLowStockProducts(lowStockRes.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadDashboard(), 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]);

  const overviewCards = summary?.overview
    ? [
        {
          title: t.dashboard.totalProducts,
          value: summary.overview.totalProducts,
          icon: Package,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          title: t.dashboard.categories,
          value: summary.overview.totalCategories,
          icon: FolderTree,
          color: "text-green-600",
          bgColor: "bg-green-50",
        },
        {
          title: t.dashboard.lowStockItems,
          value: summary.overview.lowStockItems,
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
        },
        {
          title: t.dashboard.inventoryValue,
          value: `฿${summary.overview.inventoryValue.toLocaleString("th-TH")}`,
          icon: DollarSign,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t.dashboard.title}</h1>
          <p className="mt-1 text-zinc-500">
            {interpolate(t.dashboard.welcome, { name: user?.name ?? "" })}
          </p>
        </div>
        <Button variant="outline" onClick={loadDashboard} disabled={loading}>
          {loading ? t.common.refreshing : t.common.refresh}
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Overview Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map(({ title, value, icon: Icon, color, bgColor }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">
                {title}
              </CardTitle>
              <div className={`rounded-md ${bgColor} p-2`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-zinc-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Movement & Top Products */}
      {summary && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Monthly Movement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.dashboard.monthlyMovement}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {t.dashboard.stockIn}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-green-900">
                    {summary.monthly.stockIn}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      {t.dashboard.stockOut}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-red-900">
                    {summary.monthly.stockOut}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.dashboard.topProducts}</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.topProducts.length === 0 ? (
                <p className="text-sm text-zinc-500">{t.dashboard.noMovements}</p>
              ) : (
                <div className="space-y-3">
                  {summary.topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between rounded-md border border-zinc-100 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-zinc-900">{product.name}</p>
                          <p className="text-xs text-zinc-500">{product.sku}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-zinc-900">
                        {product.totalQuantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low Stock Alerts */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t.dashboard.lowStockAlerts}
          </CardTitle>
          {lowStockProducts.length > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
              {lowStockProducts.length} {t.dashboard.items}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-zinc-500">{t.dashboard.allSufficient}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left">
                    <th className="pb-2 font-medium text-zinc-600">{t.dashboard.product}</th>
                    <th className="pb-2 font-medium text-zinc-600">{t.dashboard.sku}</th>
                    <th className="pb-2 font-medium text-zinc-600">{t.dashboard.currentStock}</th>
                    <th className="pb-2 font-medium text-zinc-600">{t.dashboard.minimum}</th>
                    <th className="pb-2 font-medium text-zinc-600 text-red-600">{t.dashboard.shortage}</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="border-b border-zinc-100">
                      <td className="py-3 font-medium text-zinc-900">{product.name}</td>
                      <td className="py-3 text-zinc-600">{product.sku}</td>
                      <td className="py-3 text-zinc-900">{product.stock}</td>
                      <td className="py-3 text-zinc-600">{product.minimumStock}</td>
                      <td className="py-3 font-medium text-red-600">{product.shortage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
