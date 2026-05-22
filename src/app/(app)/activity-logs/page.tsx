"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, ActivityLog } from "@/lib/api";
import { useTranslation, interpolate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const activityTypeColors: Record<string, string> = {
  LOGIN: "bg-blue-100 text-blue-700",
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-yellow-100 text-yellow-700",
  DELETE: "bg-red-100 text-red-700",
  STOCK_IN: "bg-emerald-100 text-emerald-700",
  STOCK_OUT: "bg-orange-100 text-orange-700",
};

export default function ActivityLogsPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");

  const loadLogs = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getActivityLogs({
          type: filterType || undefined,
          page: nextPage,
          limit: 10,
        });
        setLogs(res.data);
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    },
    [filterType]
  );

  useEffect(() => {
    const timer = setTimeout(() => loadLogs(1), 0);
    return () => clearTimeout(timer);
  }, [loadLogs]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.activityLogs.title}</h1>
          <p className="mt-1 text-zinc-500">{t.activityLogs.subtitle}</p>
        </div>
        <Button variant="outline" onClick={() => loadLogs(1)} disabled={loading}>
          {loading ? t.common.refreshing : t.common.refresh}
        </Button>
      </div>

      <div className="mt-4 flex gap-3">
        <select
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">{t.activityLogs.allTypes}</option>
          <option value="LOGIN">{t.activityLogs.typeLogin}</option>
          <option value="CREATE">{t.activityLogs.typeCreate}</option>
          <option value="UPDATE">{t.activityLogs.typeUpdate}</option>
          <option value="DELETE">{t.activityLogs.typeDelete}</option>
          <option value="STOCK_IN">{t.activityLogs.typeStockIn}</option>
          <option value="STOCK_OUT">{t.activityLogs.typeStockOut}</option>
        </select>
        <Button onClick={() => loadLogs(1)}>{t.activityLogs.applyFilter}</Button>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <Card className="mt-6">
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <p className="p-6 text-zinc-500">{t.common.loading}</p>
          ) : logs.length === 0 ? (
            <p className="p-6 text-zinc-500">{t.activityLogs.noLogs}</p>
          ) : (
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  <th className="px-4 py-3 font-semibold">{t.activityLogs.date}</th>
                  <th className="px-4 py-3 font-semibold">{t.activityLogs.user}</th>
                  <th className="px-4 py-3 font-semibold">{t.activityLogs.type}</th>
                  <th className="px-4 py-3 font-semibold">{t.activityLogs.description}</th>
                  <th className="px-4 py-3 font-semibold">{t.activityLogs.ip}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {new Date(log.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{log.user.name}</p>
                      <p className="text-xs text-zinc-500">{log.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          activityTypeColors[log.type] || "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{log.description}</td>
                    <td className="px-4 py-3">
                      {log.entityType && (
                        <span className="text-xs text-zinc-500">
                          {log.entityType} {log.entityId?.slice(0, 8)}...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-end gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {interpolate(t.activityLogs.page, { page, total: totalPages })}
        </span>
        <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <button
            disabled={page <= 1 || loading}
            onClick={() => loadLogs(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-zinc-200 dark:border-zinc-700"
          >
            <ChevronLeft className="h-4 w-4" />
            {t.activityLogs.prev}
          </button>
          <button
            disabled={page >= totalPages || loading}
            onClick={() => loadLogs(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t.activityLogs.next}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
