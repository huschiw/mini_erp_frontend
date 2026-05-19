"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError, Product, ProductInput } from "@/lib/api";
import {
  productFormSchema,
  type ProductFormData,
} from "@/lib/validations/product";
import { FieldError } from "@/components/ui/field-error";
import { formatBaht } from "@/lib/utils";
import { isAdmin, getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Pencil, Trash2, Plus, Search, Download } from "lucide-react";

type Category = { id: string; name: string };

export default function ProductsPage() {
  const user = getUser();
  const admin = isAdmin(user);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  const loadCategories = useCallback(async () => {
    const cats = await api.getCategories();
    setCategories(cats.map((c) => ({ id: c.id, name: c.name })));
    return cats;
  }, []);

  const loadProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      setListError(null);
      try {
        const productsRes = await api.getProducts({
          search: search.trim() || undefined,
          categoryId: categoryFilter || undefined,
          page,
          limit: 10,
        });
        setProducts(productsRes.data);
        setPagination({
          page: productsRes.pagination.page,
          totalPages: productsRes.pagination.totalPages,
          total: productsRes.pagination.total,
        });
      } catch (e) {
        setListError(e instanceof ApiError ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [search, categoryFilter]
  );

  useEffect(() => {
    const t = setTimeout(() => loadCategories().catch(() => {}), 0);
    return () => clearTimeout(t);
  }, [loadCategories]);

  useEffect(() => {
    const t = setTimeout(() => loadProducts(1), 300);
    return () => clearTimeout(t);
  }, [loadProducts]);

  function openCreate() {
    setEditing(null);
    setFormError(null);
    reset({
      sku: "",
      barcode: "",
      name: "",
      description: "",
      categoryId: categories[0]?.id ?? "",
      stock: 0,
      minimumStock: 0,
      costPrice: 0,
      sellingPrice: 0,
      imageUrl: "",
    });
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setFormError(null);
    reset({
      sku: p.sku,
      barcode: p.barcode ?? "",
      name: p.name,
      description: p.description ?? "",
      categoryId: p.categoryId,
      stock: p.stock,
      minimumStock: p.minimumStock,
      costPrice: Number(p.costPrice),
      sellingPrice: Number(p.sellingPrice),
      imageUrl: p.imageUrl ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setFormError(null);
  }

  async function onSubmit(data: ProductFormData) {
    setFormError(null);
    const payload: ProductInput = {
      ...data,
      barcode: data.barcode || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
    };
    try {
      if (editing) {
        await api.updateProduct(editing.id, payload);
      } else {
        await api.createProduct(payload);
      }
      closeModal();
      await loadProducts(pagination.page);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Save failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      await loadProducts(pagination.page);
    } catch (e) {
      setListError(e instanceof ApiError ? e.message : "Delete failed");
    }
  }

  async function handleExport() {
    try {
      const response = await api.exportProductsCSV();
      const blob = new Blob([response], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setListError("Export failed");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
          <p className="mt-1 text-zinc-500">
            {pagination.total} products total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          {admin && (
            <Button onClick={openCreate} disabled={categories.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            className="pl-9"
            placeholder="Search SKU, name, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {listError && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {listError}
        </p>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Product" : "New Product"}
        className="max-w-2xl"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="e.g. SKU-001" {...register("sku")} />
            <FieldError message={errors.sku?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              placeholder="Optional barcode"
              {...register("barcode")}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Product name"
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              {...register("description")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
              {...register("categoryId")}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              placeholder="https://..."
              {...register("imageUrl")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              step={1}
              placeholder="0"
              {...register("stock", { valueAsNumber: true })}
            />
            <FieldError message={errors.stock?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimumStock">Minimum Stock</Label>
            <Input
              id="minimumStock"
              type="number"
              min={0}
              step={1}
              placeholder="0"
              {...register("minimumStock", { valueAsNumber: true })}
            />
            <FieldError message={errors.minimumStock?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price</Label>
            <Input
              id="costPrice"
              type="number"
              min={0}
              step="0.25"
              placeholder="0.00"
              {...register("costPrice", { valueAsNumber: true })}
            />
            <FieldError message={errors.costPrice?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Selling Price</Label>
            <Input
              id="sellingPrice"
              type="number"
              min={0}
              step="0.25"
              placeholder="0.00"
              {...register("sellingPrice", { valueAsNumber: true })}
            />
            <FieldError message={errors.sellingPrice?.message} />
          </div>
          {formError && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 sm:col-span-2">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <Card className="mt-6">
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <p className="p-6 text-zinc-500">Loading...</p>
          ) : products.length === 0 ? (
            <p className="p-6 text-zinc-500">No products found.</p>
          ) : (
            <table className="w-full min-w-[800px] text-sm text-zinc-900">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  {admin && (
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const low = p.stock <= p.minimumStock;
                  return (
                    <tr key={p.id} className="border-b border-zinc-100">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">
                        {p.category.name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            low
                              ? "rounded bg-red-100 px-2 py-0.5 font-medium text-red-700"
                              : ""
                          }
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-900">
                        {formatBaht(p.sellingPrice)}
                      </td>
                      {admin && (
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => loadProducts(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-zinc-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadProducts(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
