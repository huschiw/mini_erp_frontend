"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, InventoryMovement, Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

export default function InventoryHistoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const res = await api.getProducts({ limit: 100 });
    setProducts(res.data);
  }, []);

  async function handleExport() {
    setError(null);
    try {
      const response = await api.exportMovementsCSV({ from: from || undefined, to: to || undefined });
      const blob = new Blob([response], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "inventory-movements.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Export failed");
    }
  }

  const loadMovements = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getInventoryMovements({
          productId: productId || undefined,
          from: from || undefined,
          to: to || undefined,
          page: nextPage,
          limit: 20,
        });
        setMovements(res.data);
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load movements");
      } finally {
        setLoading(false);
      }
    },
    [from, productId, to]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts().catch(() => {});
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  useEffect(() => {
    const timer = setTimeout(() => loadMovements(1), 0);
    return () => clearTimeout(timer);
  }, [loadMovements]);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Inventory History</h1>
        <p className="mt-1 text-zinc-500">Track stock in and stock out movements</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <select
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">All products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} — {product.name}
            </option>
          ))}
        </select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button onClick={() => loadMovements(1)}>Apply Filters</Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <Card className="mt-6">
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <p className="p-6 text-zinc-500">Loading...</p>
          ) : movements.length === 0 ? (
            <p className="p-6 text-zinc-500">No movements found.</p>
          ) : (
            <table className="w-full min-w-[900px] text-sm text-zinc-900">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Before</th>
                  <th className="px-4 py-3 font-semibold">After</th>
                  <th className="px-4 py-3 font-semibold">Created By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3 text-zinc-700">{new Date(movement.createdAt).toLocaleString("th-TH")}</td>
                    <td className="px-4 py-3">
                      <span className={movement.type === "STOCK_IN" ? "rounded bg-green-100 px-2 py-0.5 font-medium text-green-700" : "rounded bg-red-100 px-2 py-0.5 font-medium text-red-700"}>
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">{movement.product.sku} — {movement.product.name}</td>
                    <td className="px-4 py-3 font-medium">{movement.quantity}</td>
                    <td className="px-4 py-3">{movement.beforeStock}</td>
                    <td className="px-4 py-3">{movement.afterStock}</td>
                    <td className="px-4 py-3 text-zinc-700">{movement.creator.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => loadMovements(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-zinc-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => loadMovements(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
