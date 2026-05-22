"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError, Product } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarcodeScanButton } from "@/components/barcode-scanner";

const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1"),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function StockInPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { productId: "", quantity: 1, supplier: "", invoiceNumber: "", note: "" },
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProducts({ limit: 100 });
      setProducts(res.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(), 0);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Handle barcode scan
  const handleBarcodeScan = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      setValue("productId", product.id);
      setMessage(`Product found: ${product.name}`);
    } else {
      setError(`No product found with barcode: ${barcode}`);
    }
  };

  async function onSubmit(data: FormData) {
    setError(null);
    setMessage(null);
    try {
      await api.stockIn({
        ...data,
        supplier: data.supplier || null,
        invoiceNumber: data.invoiceNumber || null,
        note: data.note || null,
      });
      setMessage(t.stockIn.success);
      reset({ productId: "", quantity: 1, supplier: "", invoiceNumber: "", note: "" });
      await loadProducts();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to receive stock");
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t.stockIn.title}</h1>
        <p className="mt-1 text-zinc-500">{t.stockIn.subtitle}</p>
      </div>

      <Card className="mt-6 max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="productId">{t.stockIn.product}</Label>
                <BarcodeScanButton onScan={handleBarcodeScan} />
              </div>
              <select
                id="productId"
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:bg-zinc-900 dark:text-white"
                disabled={loading}
                {...register("productId")}
              >
                <option value="">{t.stockIn.selectProduct}</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku} — {product.name} (stock: {product.stock})
                  </option>
                ))}
              </select>
              <FieldError message={errors.productId?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">{t.stockIn.quantity}</Label>
              <Input id="quantity" type="number" min={1} step={1} {...register("quantity", { valueAsNumber: true })} />
              <FieldError message={errors.quantity?.message} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier">{t.stockIn.supplier}</Label>
                <Input id="supplier" placeholder={t.stockIn.supplierPlaceholder} {...register("supplier")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input id="invoiceNumber" placeholder="Optional invoice" {...register("invoiceNumber")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">{t.stockIn.note}</Label>
              <Input id="note" placeholder={t.stockIn.notePlaceholder} {...register("note")} />
            </div>

            {message && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p>}
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting ? t.stockIn.submitting : t.stockIn.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
