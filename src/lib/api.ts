import { getToken, clearAuth } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
    throw new ApiError(
      (data as { error?: string }).error ?? "Request failed",
      res.status
    );
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: import("./auth").AuthUser; token: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  logout: () =>
    request<{ message: string }>("/api/auth/logout", { method: "POST" }),

  me: () =>
    request<{ user: import("./auth").AuthUser }>("/api/auth/me"),

  getCategories: () =>
    request<
      Array<{
        id: string;
        name: string;
        description: string | null;
        _count: { products: number };
      }>
    >("/api/categories"),

  createCategory: (data: { name: string; description?: string }) =>
    request("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCategory: (
    id: string,
    data: { name?: string; description?: string }
  ) =>
    request(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    request(`/api/categories/${id}`, { method: "DELETE" }),

  getProducts: (params?: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.categoryId) q.set("categoryId", params.categoryId);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<{
      data: Product[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/products${qs ? `?${qs}` : ""}`);
  },

  createProduct: (data: ProductInput) =>
    request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<ProductInput>) =>
    request<Product>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) =>
    request(`/api/products/${id}`, { method: "DELETE" }),
};

export type Product = {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string };
  stock: number;
  minimumStock: number;
  costPrice: string;
  sellingPrice: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  categoryId: string;
  stock: number;
  minimumStock: number;
  costPrice: number;
  sellingPrice: number;
  imageUrl?: string | null;
};
